import dotenv from 'dotenv'
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { CollectionManager } from '@/libs/mongodb-wrapper';

dotenv.config();

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "web3",
      name: "web3",
      credentials: {
        message: { label: "Message", type: "text" },
        signedMessage: { label: "Signed Message", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.signedMessage || !credentials?.message) return null;

        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message));
          const result = await siwe.verify({
            signature: credentials.signedMessage,
            nonce: await getCsrfToken({ req: { headers: req.headers } }),
          });

          if (!result.success) throw new Error("Invalid Signature");

          if (result.data.statement !== process.env.NEXT_PUBLIC_SIGNIN_MESSAGE)
            throw new Error("Statement Mismatch");

          if (new Date(result.data.expirationTime as string).getTime() < new Date().getTime())
            throw new Error("Signature Already expired");

          return { id: siwe.address };
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account }: { token: any; account: any }) {
      if (account) token.accessToken = account.access_token;

      try {
        const cms_user_collection = await new CollectionManager("cms-users").getCollection();

        const result = await cms_user_collection.findOne({ user_address: token.sub });

        if (result && result.role)
          token.role = result.role;
         else
          token.role = 'subscriber';
      } catch (error) {
        console.error('Error finding user in the database:', error);
      }

      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      try {
        const cms_user_collection = await new CollectionManager("cms-users").getCollection();

        const result = await cms_user_collection.findOne({ user_address: token.sub });

        if (result && result.role) {
          session.user.role = result.role;
        } else {
          await cms_user_collection.updateOne(
            { user_address: token.sub },
            {
              $setOnInsert: { user_address: token.sub, role: 'subscriber', created_at: new Date() },
              $set: { updated_at: new Date() }
            },
            { upsert: true }
          );

          session.user.role = 'subscriber';
        }
      } catch (error) {
        console.error('Error handling user in the database:', error);
      }

      session.address = token.sub;
      session.token = token;

      return session;
    },
  },
};

// @ts-ignore
const nextAuthHandler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);

export default nextAuthHandler;
