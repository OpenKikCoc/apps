export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    // List recent pastes (limit 10)
    const { results } = await context.env.DB.prepare(
      "SELECT id, language, created_at, substr(content, 1, 100) as snippet FROM pastes ORDER BY created_at DESC LIMIT 10"
    ).all();
    return Response.json(results);
  }

  const result = await context.env.DB.prepare(
    "SELECT * FROM pastes WHERE id = ?"
  ).bind(id).first();

  if (!result) {
    return new Response("Paste not found", { status: 404 });
  }

  return Response.json(result);
}

export async function onRequestPost(context) {
  try {
    const { content, language } = await context.request.json();
    
    if (!content) {
      return new Response("Content is required", { status: 400 });
    }

    // Generate a short ID (8 chars)
    const id = crypto.randomUUID().substring(0, 8);
    const createdAt = Date.now();

    await context.env.DB.prepare(
      "INSERT INTO pastes (id, content, language, created_at) VALUES (?, ?, ?, ?)"
    ).bind(id, content, language || 'text', createdAt).run();

    return Response.json({ success: true, id });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response("ID is required", { status: 400 });
  }

  try {
    await context.env.DB.prepare(
      "DELETE FROM pastes WHERE id = ?"
    ).bind(id).run();
    
    return Response.json({ success: true });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
