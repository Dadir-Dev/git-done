import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/src/lib/prisma";

export async function ensureAppUser(userId: string) {
  const clerkUser = await currentUser();

  if (!clerkUser || clerkUser.id !== userId) {
    throw new Error("Authenticated Clerk user could not be loaded");
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("Authenticated user does not have an email address");
  }

  const name = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ") || null;

  return prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email, name, imageUrl: clerkUser.imageUrl },
    update: { email, name, imageUrl: clerkUser.imageUrl },
  });
}