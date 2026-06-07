import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Expense from '@/lib/models/Expense';
import { deleteReceipt } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

// PATCH /api/expenses/:id — approve or reject (admin only)
export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only admins can approve or reject
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can review expenses' }, { status: 403 });
  }

  const { status, reviewNote } = await req.json();

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await connectDB();

  const expense = await Expense.findOne({
    _id: params.id,
    workspaceId: session.user.workspaceId, // security — can't touch other workspaces
  });

  if (!expense) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
  }

  if (expense.status !== 'pending') {
    return NextResponse.json(
      { error: 'Only pending expenses can be reviewed' },
      { status: 400 }
    );
  }

  expense.status = status;
  expense.reviewedBy = session.user.id;
  expense.reviewNote = reviewNote || '';
  expense.reviewedAt = new Date();
  await expense.save();

  return NextResponse.json({ expense });
}

// DELETE /api/expenses/:id — member deletes their own pending expense
export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const expense = await Expense.findOne({
    _id: params.id,
    workspaceId: session.user.workspaceId,
  });

  if (!expense) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
  }

  // Members can only delete their own pending expenses
  // Admins can delete anything
  const isOwner = expense.submittedBy.toString() === session.user.id;
  const canDelete = session.user.role === 'admin' || (isOwner && expense.status === 'pending');

  if (!canDelete) {
    return NextResponse.json(
      { error: 'You cannot delete this expense' },
      { status: 403 }
    );
  }

  // Clean up Cloudinary image when expense is deleted
  if (expense.receiptPublicId) {
    await deleteReceipt(expense.receiptPublicId);
  }

  await expense.deleteOne();

  return NextResponse.json({ message: 'Expense deleted' });
}