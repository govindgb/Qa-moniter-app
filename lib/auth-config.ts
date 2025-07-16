import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import connectToDatabase from './mongodb';
import User from '@/models/QaMonitorUsers';

const client = new MongoClient(process.env.MONGODB_URI!);

export const authOptions = {
  adapter: MongoDBAdapter(client),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          
          // Check if user already exists
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user with Google data
            existingUser = new User({
              name: user.name,
              email: user.email,
              password: 'google-oauth', // Placeholder password for OAuth users
              role: 'tester', // Default role
              isActive: true,
              googleId: account.providerAccountId,
            });
            await existingUser.save();
          } else {
            // Update existing user with Google ID if not present
            if (!existingUser.googleId) {
              existingUser.googleId = account.providerAccountId;
              await existingUser.save();
            }
          }
          
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      if (account?.provider === 'google' && user) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.userId = dbUser._id.toString();
            token.role = dbUser.role;
            token.isActive = dbUser.isActive;
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.isActive = token.isActive;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);