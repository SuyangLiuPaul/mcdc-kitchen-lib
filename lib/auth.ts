import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  // JWT strategy works reliably in serverless (Netlify) and lets
  // UploadThing middleware use getToken() to verify auth.
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // On first sign-in, embed the DB user ID into the JWT.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Surface the ID and role on the session object used by the app.
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        session.user.role = dbUser?.role ?? "USER";
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        logActivity({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          action: "LOGIN",
        });
      }
    },
  },
  pages: {
    signIn: "/",
  },
};

export function auth() {
  return getServerSession(authOptions);
}
