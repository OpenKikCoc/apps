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

export async function onRequestPut(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) return new Response("Missing ID", { status: 400 });

  const data = await context.request.json();

  await context.env.DB.prepare(
    `UPDATE items SET 
      name = ?, brand = ?, quantity = ?, unit = ?, 
      expiry_date = ?, dosage = ?, indications = ?
     WHERE id = ?`
  ).bind(
    data.name,
    data.brand,
    data.quantity,
    data.unit,
    data.expiry_date,
    data.dosage,
    data.indications ? data.indications.join(',') : "",
    id
  ).run();

  return Response.json({ success: true });
}
