import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Workspace from '@/lib/models/Workspace';
import { NextResponse } from 'next/server';

export async function POST(req) {
  // 1. Get the current session — who is making this request?
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { name, monthlyBudget } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
  }

  await connectDB();

  // 2. One org per user — check if they already have one
  const existingUser = await User.findById(session.user.id);
  if (existingUser.workspaceId) {
    return NextResponse.json(
      { error: 'You already belong to a workspace' },
      { status: 409 }
    );
  }

  // 3. Create the workspace
  const workspace = await Workspace.create({
    name: name.trim(),
    ownerId: session.user.id,
    monthlyBudget: monthlyBudget || 0,
  });

  // 4. Update the user — give them admin role + link to workspace
  await User.findByIdAndUpdate(session.user.id, {
    workspaceId: workspace._id,
    role: 'admin',            // creator is always admin
  });

  return NextResponse.json({ workspace }, { status: 201 });
}