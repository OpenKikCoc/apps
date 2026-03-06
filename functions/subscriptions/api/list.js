export async function onRequest(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const activeOnly = url.searchParams.get('active') === '1';

  let query = "SELECT * FROM subscriptions";
  if (activeOnly) {
    query += " WHERE active = 1";
  }
  query += " ORDER BY start_date ASC";

  try {
    const { results } = await env.DB.prepare(query).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
