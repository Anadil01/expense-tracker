import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Expense from '@/lib/models/Expense';
import { uploadReceipt } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

// GET /api/expenses — fetch all expenses for the workspace
export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);

  // Optional filters from query string
  // e.g. /api/expenses?status=pending&category=Travel&month=2025-06
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const month = searchParams.get('month'); // format: "2025-06"

  await connectDB();

  // Always filter by workspaceId — users only see their workspace data
  const query = { workspaceId: session.user.workspaceId };

  if (status) query.status = status;
  if (category) query.category = category;

  // Filter by month — get start and end of the month
  if (month) {
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); // first day of next month
    query.date = { $gte: start, $lt: end };
  }

  const expenses = await Expense.find(query)
    .populate('submittedBy', 'name email image') // join user data
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 }); // newest first

  return NextResponse.json({ expenses });
}

// POST /api/expenses — submit a new expense
export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Viewers cannot submit expenses
  if (session.user.role === 'viewer') {
    return NextResponse.json({ error: 'Viewers cannot submit expenses' }, { status: 403 });
  }

  try {
    // FormData because we're handling file upload + fields together
    const formData = await req.formData();

    const title = formData.get('title');
    const amount = Number(formData.get('amount'));
    const category = formData.get('category');
    const date = formData.get('date');
    const receiptFile = formData.get('receipt'); // File object or null

    // Validate required fields
    if (!title || !amount || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    await connectDB();

    let receiptUrl = null;
    let receiptPublicId = null;

    // Upload receipt to Cloudinary if provided
    if (receiptFile && receiptFile.size > 0) {

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(receiptFile.type)) {
        return NextResponse.json(
          { error: 'Receipt must be JPG, PNG, WEBP or PDF' },
          { status: 400 }
        );
      }

      // Validate file size — max 5MB
      if (receiptFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Receipt must be under 5MB' },
          { status: 400 }
        );
      }

      // Convert File to Buffer for Cloudinary
      const arrayBuffer = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Unique filename using timestamp
      const filename = `receipt_${session.user.id}_${Date.now()}`;
      const uploaded = await uploadReceipt(buffer, filename);

      receiptUrl = uploaded.url;
      receiptPublicId = uploaded.publicId;
    }

    const expense = await Expense.create({
      workspaceId: session.user.workspaceId,
      submittedBy: session.user.id,
      title,
      amount,
      category,
      date: new Date(date),
      receiptUrl,
      receiptPublicId,
    });

    return NextResponse.json({ expense }, { status: 201 });

  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}