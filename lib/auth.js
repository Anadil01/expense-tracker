import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import User from './models/User';

function isDatabaseConnectionError(error) {
  return (
    error?.name === 'MongooseServerSelectionError' ||
    error?.name === 'MongoServerSelectionError' ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ENOTFOUND'
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [

    // ── Provider 1: Google OAuth ─────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ── Provider 2: Email + Password ─────────────────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },

      // This runs when user submits the login form
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectDB();
        } catch (error) {
          console.error('Credentials sign-in DB error:', error);
          throw new Error('DatabaseUnavailable');
        }

        // 1. Find user by email
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.password) throw new Error('Invalid email or password');

        // 2. Compare password with hashed version in DB
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Invalid email or password');

        // 3. Return user object — NextAuth puts this in the session
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId?.toString() || null,
        };
      }
    })
  ],

  // ── Callbacks ─────────────────────────────────────────
  // These let you customize what's in the token and session

  callbacks: {
    // Runs when JWT token is created or updated
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.email = user.email;

        // Credentials users already return our DB-backed fields directly.
        if (account?.provider === 'credentials') {
          token.id = user.id;
          token.role = user.role;
          token.workspaceId = user.workspaceId;
        } else {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email?.toLowerCase() });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.workspaceId = dbUser.workspaceId?.toString() || null;
          }
        }
      }

      // 'update' trigger fires when we call session.update()
      // We use this to refresh the session after workspace is created
      if (trigger === 'update' || (!token.id && token.email)) {
        await connectDB();

        const dbUser = token.id
          ? await User.findById(token.id)
          : await User.findOne({ email: token.email?.toLowerCase() });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.workspaceId = dbUser.workspaceId?.toString() || null;
        }
      }

      return token;
    },

    // Runs every time session is accessed — shapes what client sees
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.workspaceId = token.workspaceId;
      return session;
    },

    // Runs after Google OAuth — create user in DB if first time
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          const email = (user.email || profile?.email)?.toLowerCase();

          if (!email) {
            return '/login?error=NoGoogleEmail';
          }

          let dbUser = await User.findOne({ email });

          if (!dbUser) {
            dbUser = await User.create({
              name: user.name || profile?.name || 'Google User',
              email,
              image: user.image,
            });
          }

          // Attach our DB fields so jwt/session use the app user, not the raw provider user.
          user.id = dbUser._id.toString();
          user.email = dbUser.email;
          user.role = dbUser.role;
          user.workspaceId = dbUser.workspaceId?.toString() || null;
        } catch (error) {
          console.error('Google sign-in error:', error);
          if (isDatabaseConnectionError(error)) {
            return '/login?error=DatabaseUnavailable';
          }
          return '/login?error=GoogleSignInFailed';
        }
      }
      return true; // allow sign in
    }
  },

  pages: {
    signIn: '/login', // use our custom login page
    error: '/login',
  },

  session: { strategy: 'jwt' }, // store session in JWT, not DB
});
