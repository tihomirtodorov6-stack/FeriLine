// send-call-push - FIXED VERSION with VAPID keys inside
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = "BKblf56TPs57wUynFl2e8mjlC3G0AsBIqUOimwPIpq8zViMmyW-j45uzOGBFuu2f2agsDs8e417HG6VXZkzIsvA";
const VAPID_PRIVATE_KEY = "vT7f-4J4fGVm1ZjwP0k1C1SjY3kr4YZJG7I8AglQPZE";

webpush.setVapidDetails("mailto:admin@feriline.com", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const subscription = body.subscription || body.pushSubscription;
    
    if (!subscription?.endpoint) {
      return new Response(JSON.stringify({ error: "Missing subscription" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const callerName = body.callerName || "Някой ти звъни";
    const callId = body.callId || Date.now().toString();

    const payload = JSON.stringify({
      title: `Обаждане от ${callerName}`,
      body: "Натисни за да отговориш",
      icon: "/icon-192.png",
      badge: "/badge.png",
      data: { callId, callerName, callerId: body.callerId, type: "CALL", url: `/call/${callId}` },
      requireInteraction: true,
      vibrate: [200, 100, 200]
    });

    await webpush.sendNotification(subscription, payload);
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});