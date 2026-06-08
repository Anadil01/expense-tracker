import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Workspace from '@/lib/models/Workspace';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { name, monthlyBudget } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
  }

  await connectDB();

  // ← Find by email instead of ID — works for both Google and credentials users
  const existingUser = await User.findOne({ email: session.user.email }).populate('workspaceId');

  if (!existingUser) {
    return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
  }

  // If workspace already exists, return it gracefully
  if (existingUser.workspaceId) {
    return NextResponse.json(
      { workspace: existingUser.workspaceId, alreadyExists: true },
      { status: 200 }
    );
  }

  const workspace = await Workspace.create({
    name: name.trim(),
    ownerId: existingUser._id,       // ← use DB id, not session id
    monthlyBudget: monthlyBudget || 0,
  });

  await User.findByIdAndUpdate(existingUser._id, {  // ← same here
    workspaceId: workspace._id,
    role: 'admin',
  });

  return NextResponse.json({ workspace }, { status: 201 });
}