export async function onRequestPost(context) {
  const formData = await context.request.formData();
  const file = formData.get('file');

  if (!file) return new Response(JSON.stringify({ error: "No file" }), { status: 400 });

  // Mock Mode Check: If no API Key is set, return simulated data
  const API_KEY = context.env.AI_API_KEY;
  if (!API_KEY) {
    await new Promise(r => setTimeout(r, 1000)); // Simulate network delay
    return Response.json({
      success: true,
      data: {
        name: "[本地模拟] 布洛芬缓释胶囊",
        brand: "芬必得",
        quantity: 1,
        unit: "盒",
        expiry_date: "2026-12-31",
        dosage: "0.3g*24粒",
        indications: ["头痛", "发热", "牙痛", "神经痛"]
      },
      is_mock: true
    });
  }

  // Real AI Call (Gemini Example)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Google Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Identify this medicine. Return ONLY valid JSON with fields: name, brand, quantity (integer guess), unit, expiry_date (YYYY-MM-DD), dosage, indications (array of strings). Do not use markdown formatting." },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }]
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    // Parse Gemini response (which might be wrapped in text)
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
         throw new Error("Invalid response structure from Gemini");
    }

    let text = result.candidates[0].content.parts[0].text;
    // Clean markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text);

    return Response.json({
      success: true,
      data: data
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
