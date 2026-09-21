// src/app/api/webhooks/clerk/route.ts
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  let evt;

  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const {
          id,
          email_addresses,
          primary_email_address_id,
          first_name,
          last_name,
          image_url,
        } = evt.data;

        const email =
          email_addresses.find(
            (address) => address.id === primary_email_address_id,
          )?.email_address ?? email_addresses[0]?.email_address;

        if (!email) {
          console.error("Clerk webhook user has no email address", { id });
          return new Response("User email is required", { status: 422 });
        }

        // Build name safely — filter out nulls before joining
        const name =
          [first_name, last_name].filter(Boolean).join(" ") || null;

        await prisma.user.upsert({
          where: { id },
          create: { id, email, name, imageUrl: image_url ?? null },
          update: { email, name, imageUrl: image_url ?? null },
        });
        break;
      }
      case "user.deleted": {
        if (evt.data.id) {
          await prisma.user.deleteMany({ where: { id: evt.data.id } });
        }
        break;
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Clerk webhook database processing failed:", err);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

// Clerk Dashboard pings this endpoint with a GET to verify reachability
export async function GET() {
  return new Response("Clerk webhook endpoint is active", { status: 200 });
}
