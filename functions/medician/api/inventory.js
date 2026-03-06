export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare(
    "SELECT * FROM items ORDER BY expiry_date ASC"
  ).all();
  
  // Parse indications string back to array for frontend compatibility
  const items = results.map(item => ({
    ...item,
    indications: item.indications ? item.indications.split(',') : []
  }));

  return Response.json(items);
}

export async function onRequestPost(context) {
  const item = await context.request.json();
  const id = crypto.randomUUID();
  
  await context.env.DB.prepare(
    `INSERT INTO items (id, name, brand, quantity, unit, expiry_date, dosage, indications, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    item.name,
    item.brand,
    item.quantity,
    item.unit,
    item.expiry_date,
    item.dosage,
    item.indications ? item.indications.join(',') : "",
    Date.now()
  ).run();

  return Response.json({ success: true, id });
}
