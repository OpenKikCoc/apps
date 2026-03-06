export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { name, price, currency, billing_cycle, start_date, category, description } = body;
    const id = crypto.randomUUID();
    const created_at = Date.now();

    await env.DB.prepare(
      "INSERT INTO subscriptions (id, name, price, currency, billing_cycle, start_date, category, description, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)"
    )
      .bind(id, name, price, currency || 'CNY', billing_cycle, start_date, category, description, created_at)
      .run();

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
