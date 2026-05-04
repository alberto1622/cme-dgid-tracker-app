import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import type { AppRole } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: AppRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: AppRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: AppRole;
  }
}
