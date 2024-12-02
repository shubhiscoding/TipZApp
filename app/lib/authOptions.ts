import Google from "next-auth/providers/google";
import { NextAuthOptions, Session } from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
              params: {
                  scope: "openid profile email https://www.googleapis.com/auth/youtube.readonly",
              },
          },
        }),
    ],
    
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
}