import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, alertId, vitalsSnapshot } = await req.json();

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    const emergencyContact = Deno.env.get("EMERGENCY_CONTACT_PHONE");

    if (!accountSid || !authToken || !fromNumber || !emergencyContact) {
      return new Response(
        JSON.stringify({
          success: false,
          configured: false,
          message: "SMS credentials unconfigured in Supabase Project Secrets. Incident logged in-app.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const messageBody = `🚨 FAMCARE360 SOS ALERT: Emergency triggered by family member (User: ${userId}, Alert ID: ${alertId || "N/A"}). Check dashboard immediately.`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const formData = new URLSearchParams();
    formData.append("To", emergencyContact);
    formData.append("From", fromNumber);
    formData.append("Body", messageBody);

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioData = await twilioRes.json();

    return new Response(
      JSON.stringify({ success: twilioRes.ok, twilio: twilioData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: twilioRes.ok ? 200 : 400 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
