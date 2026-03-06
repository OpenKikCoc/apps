export async function onRequestDelete(context) {
  // Extract ID from URL (e.g. /api/item/123)
  // Note: This requires a dynamic route file structure like functions/api/item/[id].js
  // But for simplicity in this demo, let's assume we pass ID in query or body, 
  // or we can use the URL pattern matching if we rename this file.
  
  // Let's stick to the standard pattern:
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) return new Response("Missing ID", { status: 400 });

  await context.env.DB.prepare(
    "DELETE FROM items WHERE id = ?"
  ).bind(id).run();

  return Response.json({ success: true });
}
