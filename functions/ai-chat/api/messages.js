export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) return new Response("Missing session_id", { status: 400 });

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM ai_messages WHERE session_id = ? ORDER BY created_at ASC"
    ).bind(sessionId).all();
    
    return Response.json({ success: true, data: results });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
