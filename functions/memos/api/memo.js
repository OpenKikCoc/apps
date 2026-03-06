export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare(
    "SELECT * FROM memos ORDER BY updated_at DESC"
  ).all();
  return Response.json(results);
}

export async function onRequestPost(context) {
  const { content } = await context.request.json();
  const id = crypto.randomUUID();
  const now = Date.now();

  await context.env.DB.prepare(
    "INSERT INTO memos (id, content, created_at, updated_at) VALUES (?, ?, ?, ?)"
  ).bind(id, content, now, now).run();

  return Response.json({ id, content, created_at: now, updated_at: now });
}

export async function onRequestPut(context) {
  const { id, content } = await context.request.json();
  const now = Date.now();

  await context.env.DB.prepare(
    "UPDATE memos SET content = ?, updated_at = ? WHERE id = ?"
  ).bind(content, now, id).run();

  return Response.json({ id, content, updated_at: now });
}

export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) return new Response("Missing ID", { status: 400 });

  await context.env.DB.prepare(
    "DELETE FROM memos WHERE id = ?"
  ).bind(id).run();

  return Response.json({ success: true });
}
