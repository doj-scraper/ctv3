import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getAuth } from "@clerk/express";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const { userId } = getAuth(opts.req);

    if (userId) {
      // Fetch user from database (synced from Clerk)
      let dbUser = await db.getUserByClerkId(userId);

      // If user doesn't exist in DB yet, create them
      if (!dbUser) {
        await db.upsertUser({
          clerkId: userId,
          lastSignedIn: new Date(),
        });
        dbUser = await db.getUserByClerkId(userId);
      }

      user = dbUser || null;
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}