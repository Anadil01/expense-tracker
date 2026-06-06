// This one file handles ALL auth routes:
// POST /api/auth/signin
// POST /api/auth/signout
// GET  /api/auth/session
// GET  /api/auth/callback/google
// ... etc

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;