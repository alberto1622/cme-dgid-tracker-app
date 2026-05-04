import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export type AppRole = "user" | "admin";

type SeedAccount = { email: string; password: string; name: string; role: AppRole };

function getSeedAccounts(): SeedAccount[] {
  const adminEmail = process.env.ADMIN_EMAIL ?? "bakhoum.alou21@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";
  return [
    { email: adminEmail, password: adminPassword, name: "Administrateur", role: "admin" },
  ];
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email & mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const account = getSeedAccounts().find(
          (a) => a.email.toLowerCase() === credentials.email.toLowerCase() && a.password === credentials.password,
        );
        if (!account) return null;

        return {
          id: account.email,
          email: account.email,
          name: account.name,
          role: account.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: AppRole }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as AppRole) ?? "user";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
