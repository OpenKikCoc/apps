export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM ai_sessions ORDER BY updated_at DESC LIMIT 50"
    ).all();
    
    return Response.json({ success: true, data: results });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get('id');
        
        if (!id) return new Response("Missing id", { status: 400 });

        await context.env.DB.prepare(
            "DELETE FROM ai_sessions WHERE id = ?"
        ).bind(id).run();

        return Response.json({ success: true });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
