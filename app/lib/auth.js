import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import User from './models/User';

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
        await connectDB();

        // 1. Find user by email
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error('No user found with this email');

        // 2. Compare password with hashed version in DB
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Incorrect password');

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
    async jwt({ token, user, trigger }) {
      if (user) {
        // First login — add our custom fields to the token
        token.id = user.id;
        token.role = user.role;
        token.workspaceId = user.workspaceId;
      }

      // 'update' trigger fires when we call session.update()
      // We use this to refresh the session after workspace is created
      if (trigger === 'update') {
        const dbUser = await User.findById(token.id);
        if (dbUser) {
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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        const exists = await User.findOne({ email: user.email });
        if (!exists) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
      }
      return true; // allow sign in
    }
  },

  pages: {
    signIn: '/login', // use our custom login page
  },

  session: { strategy: 'jwt' }, // store session in JWT, not DB
});