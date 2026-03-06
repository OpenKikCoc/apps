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
  const data = await context.request.json();
  
  const insertItem = async (item) => {
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
    return id;
  };

  if (Array.isArray(data)) {
    const ids = [];
    // Execute in serial to avoid database lock issues if any, or use a transaction if D1 supported it well in this context
    // For simplicity and safety with D1, we'll just await each.
    for (const item of data) {
      ids.push(await insertItem(item));
    }
    return Response.json({ success: true, ids, count: ids.length });
  } else {
    const id = await insertItem(data);
    return Response.json({ success: true, id });
  }
}
