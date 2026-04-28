// ═══════════════════════════════════════════════════════════
// ORENIVO — Lemon Squeezy Webhook
// Receives order_created / subscription_created events
// and upgrades the matching user to Pro in the DB.
//
// Deploy: supabase functions deploy lemon-webhook
// Set secret: supabase secrets set LEMON_SQUEEZY_SIGNING_SECRET=<your-secret>
// ═══════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const SIGNING_SECRET = Deno.env.get("LEMON_SQUEEZY_SIGNING_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SIGNING_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("[lemon-webhook] Missing required environment variables. Set LEMON_SQUEEZY_SIGNING_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifySignature(body: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SIGNING_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = hexToBytes(signature);
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(body));
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  // Verify the webhook signature
  const valid = await verifySignature(body, signature);
  if (!valid) {
    console.error("[lemon-webhook] Invalid signature");
    return new Response("Unauthorized", { status: 401 });
  }

  const event = JSON.parse(body);
  const eventName: string = event?.meta?.event_name ?? "";

  console.log(`[lemon-webhook] Received: ${eventName}`);

  // Handle one-time purchases and subscription activations
  if (
    eventName === "order_created" ||
    eventName === "subscription_created" ||
    eventName === "subscription_resumed"
  ) {
    const customerEmail: string =
      event?.data?.attributes?.user_email ??
      event?.data?.attributes?.customer?.email ??
      "";

    const customerId = String(event?.data?.attributes?.customer_id ?? "");

    if (!customerEmail) {
      console.error("[lemon-webhook] No email found in payload");
      return new Response("No email", { status: 400 });
    }

    // Find user by email in auth.users
    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) {
      console.error("[lemon-webhook] Failed to list users:", authErr);
      return new Response("Internal error", { status: 500 });
    }

    const authUser = authUsers.users.find(
      (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
    );

    if (!authUser) {
      // User hasn't signed up yet — store pending upgrade by email for later
      console.log(`[lemon-webhook] No auth user found for ${customerEmail}, storing pending.`);
      await supabase.from("pending_upgrades").upsert(
        { email: customerEmail.toLowerCase(), lemon_squeezy_customer_id: customerId },
        { onConflict: "email" }
      );
      return new Response("OK - pending", { status: 200 });
    }

    // Upgrade user to Pro
    const { error: updateErr } = await supabase
      .from("users")
      .upsert(
        {
          id: authUser.id,
          email: customerEmail.toLowerCase(),
          plan: "pro",
          lemon_squeezy_customer_id: customerId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (updateErr) {
      console.error("[lemon-webhook] Failed to update user plan:", updateErr);
      return new Response("Internal error", { status: 500 });
    }

    console.log(`[lemon-webhook] Upgraded ${customerEmail} to Pro`);
  }

  // Handle subscription cancellations
  if (eventName === "subscription_expired" || eventName === "subscription_cancelled") {
    const customerEmail: string =
      event?.data?.attributes?.user_email ??
      event?.data?.attributes?.customer?.email ??
      "";

    if (customerEmail) {
      await supabase
        .from("users")
        .update({ plan: "free", plan_expires_at: new Date().toISOString() })
        .eq("email", customerEmail.toLowerCase());

      console.log(`[lemon-webhook] Downgraded ${customerEmail} to Free`);
    }
  }

  return new Response("OK", { status: 200 });
});
