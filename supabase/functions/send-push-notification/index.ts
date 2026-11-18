// ==============================================================================
// FAMCARE360: Supabase Edge Function - Secure Firebase Cloud Messaging Dispatch
// Path: supabase/functions/send-push-notification/index.ts
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushRequestBody {
  targetUserId: string;
  title: string;
  body: string;
  type?: string;
  link?: string;
}

// Helper: Convert base64url to Uint8Array and vice-versa
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert PEM format private key to CryptoKey
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s+/g, "");

  const binaryDer = base64ToArrayBuffer(pemContents);

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
}

// Generate Google OAuth 2.0 Access Token from Service Account JSON
async function getGoogleAccessToken(
  serviceAccount: { client_email: string; private_key: string }
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const privateKey = await importPrivateKey(serviceAccount.private_key);
  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureString = String.fromCharCode.apply(null, signatureArray);
  const encodedSignature = base64UrlEncode(signatureString);

  const signedJwt = `${unsignedToken}.${encodedSignature}`;

  // Exchange signed JWT for OAuth 2.0 Bearer Token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signedJwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || "Failed to obtain Google access token");
  }

  return tokenData.access_token;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { targetUserId, title, body, type = "info", link = "/" }: PushRequestBody =
      await req.json();

    if (!targetUserId || !title || !body) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters: targetUserId, title, body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 1. Authorize caller via Supabase JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase environment credentials unconfigured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // If request has Authorization header, verify caller identity and family relation
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !caller) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized caller" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }

      // Check if caller is target or authorized family member
      if (caller.id !== targetUserId) {
        const { data: isFamily } = await supabaseAdmin.rpc("is_family_member", {
          target_user_id: targetUserId,
        });

        // If RPC returned false, reject cross-family push notification
        if (isFamily === false) {
          return new Response(
            JSON.stringify({ success: false, error: "Forbidden: Recipient is not a member of your family." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
          );
        }
      }
    }

    // 2. Read Firebase Service Account Credential from Supabase Secret
    const rawSecret = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!rawSecret) {
      return new Response(
        JSON.stringify({
          success: false,
          configured: false,
          message: "Firebase service-account secret (FIREBASE_SERVICE_ACCOUNT_JSON) is not set in Supabase Secrets.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let serviceAccount: { client_email: string; private_key: string; project_id: string };
    try {
      serviceAccount = JSON.parse(rawSecret);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid FIREBASE_SERVICE_ACCOUNT_JSON format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // 3. Query active device tokens for the target user
    const { data: deviceRows, error: tokenErr } = await supabaseAdmin
      .from("device_tokens")
      .select("id, token")
      .eq("user_id", targetUserId)
      .eq("is_active", true);

    if (tokenErr || !deviceRows || deviceRows.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          deliveredCount: 0,
          message: "No active device tokens found for target user.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 4. Obtain short-lived Google OAuth2 access token
    const accessToken = await getGoogleAccessToken(serviceAccount);

    // 5. Dispatch FCM HTTP v1 Messages to all registered device tokens
    let deliveredCount = 0;
    const invalidTokenIds: string[] = [];
    const isUrgent = type === "sos" || type === "health_warning";

    for (const row of deviceRows) {
      const fcmPayload = {
        message: {
          token: row.token,
          notification: {
            title,
            body,
          },
          data: {
            title,
            body,
            type,
            link,
          },
          webpush: {
            headers: {
              Urgency: isUrgent ? "high" : "normal",
            },
            fcm_options: {
              link,
            },
          },
        },
      };

      const fcmRes = await fetch(
        `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fcmPayload),
        }
      );

      if (fcmRes.ok) {
        deliveredCount++;
      } else {
        const errData = await fcmRes.json();
        const errStatus = errData?.error?.status || "";
        // If device token is unregistered or invalid, queue for cleanup
        if (
          errStatus === "NOT_FOUND" ||
          errStatus === "UNREGISTERED" ||
          errData?.error?.message?.includes("not a valid FCM registration token")
        ) {
          invalidTokenIds.push(row.id);
        }
      }
    }

    // 6. Cleanup expired or invalid device tokens
    if (invalidTokenIds.length > 0) {
      await supabaseAdmin
        .from("device_tokens")
        .update({ is_active: false })
        .in("id", invalidTokenIds);
    }

    return new Response(
      JSON.stringify({
        success: true,
        deliveredCount,
        totalDevices: deviceRows.length,
        cleanedTokens: invalidTokenIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
