import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Workspace from '@/lib/models/Workspace';
import User from '@/lib/models/User';
import { NextResponse } from 'next/server';

// POST /api/invite/accept — called when user clicks invite link
export async function POST(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: 'Invite token is required' }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.workspaceId) {
    return NextResponse.json(
      { error: 'You already belong to a workspace' },
      { status: 409 }
    );
  }

  // Find workspace with this token
  const workspace = await Workspace.findOne({
    'pendingInvites.token': token,
    'pendingInvites.expiresAt': { $gt: new Date() } // not expired
  });

  if (!workspace) {
    return NextResponse.json(
      { error: 'Invite link is invalid or has expired' },
      { status: 400 }
    );
  }

  // Get the invite details
  const invite = workspace.pendingInvites.find(i => i.token === token);
  if (!invite) {
    return NextResponse.json(
      { error: 'Invite link is invalid or has expired' },
      { status: 400 }
    );
  }

  if (invite.email !== user.email) {
    return NextResponse.json(
      { error: 'This invite was sent to a different email address' },
      { status: 403 }
    );
  }

  // Add user to workspace with the invited role
  await User.findByIdAndUpdate(user._id, {
    workspaceId: workspace._id,
    role: invite.role,
  });

  // Remove the used token — tokens are single use
  await Workspace.findByIdAndUpdate(workspace._id, {
    $pull: { pendingInvites: { token } }
  });

  return NextResponse.json({ message: 'Joined workspace successfully' });
}
