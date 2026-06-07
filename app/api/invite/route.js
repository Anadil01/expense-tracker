import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Workspace from '@/lib/models/Workspace';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';
import crypto from 'crypto'; // built into Node — no install needed

// POST /api/invite — admin sends invite
export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 });
  }

  const { email, role } = await req.json();

  if (!email || !['member', 'viewer'].includes(role)) {
    return NextResponse.json({ error: 'Valid email and role required' }, { status: 400 });
  }

  await connectDB();

  // Check if user is already in the workspace
  const existing = await User.findOne({
    email: email.toLowerCase(),
    workspaceId: session.user.workspaceId
  });

  if (existing) {
    return NextResponse.json(
      { error: 'User already in workspace' },
      { status: 409 }
    );
  }

  // Generate secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store invite in workspace
  await Workspace.findByIdAndUpdate(session.user.workspaceId, {
    $push: {
      pendingInvites: { email: email.toLowerCase(), role, token, expiresAt }
    }
  });

  // The invite link you'd email to the user
  const inviteLink = `${process.env.NEXTAUTH_URL}/invite/accept?token=${token}`;

  // In production, send email with nodemailer here
  // For now, return the link so you can test it
  console.log('Invite link:', inviteLink);

  return NextResponse.json({
    message: 'Invite created',
    inviteLink // remove this in production
  });
}