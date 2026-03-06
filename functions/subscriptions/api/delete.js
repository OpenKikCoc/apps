export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "DELETE") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    await env.DB.prepare("DELETE FROM subscriptions WHERE id = ?").bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
