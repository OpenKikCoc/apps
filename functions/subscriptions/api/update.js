export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "PUT") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { id, name, price, currency, billing_cycle, start_date, category, description, active } = body;

    let query = "UPDATE subscriptions SET ";
    const params = [];
    const updates = [];

    if (name !== undefined) { updates.push("name = ?"); params.push(name); }
    if (price !== undefined) { updates.push("price = ?"); params.push(price); }
    if (currency !== undefined) { updates.push("currency = ?"); params.push(currency); }
    if (billing_cycle !== undefined) { updates.push("billing_cycle = ?"); params.push(billing_cycle); }
    if (start_date !== undefined) { updates.push("start_date = ?"); params.push(start_date); }
    if (category !== undefined) { updates.push("category = ?"); params.push(category); }
    if (description !== undefined) { updates.push("description = ?"); params.push(description); }
    if (active !== undefined) { updates.push("active = ?"); params.push(active); }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), { status: 400 });
    }

    query += updates.join(", ") + " WHERE id = ?";
    params.push(id);

    await env.DB.prepare(query).bind(...params).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
