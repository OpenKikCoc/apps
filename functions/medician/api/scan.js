export async function onRequestPost(context) {
  const formData = await context.request.formData();
  const file = formData.get('file');

  if (!file) return new Response(JSON.stringify({ error: "No file" }), { status: 400 });

  // Mock Mode Check: If no API Key is set, return simulated data
  const API_KEY = context.env.AI_API_KEY;
  // Use AI_MODEL env var for the Volcengine Model Name
  // For Coding Plan, this MUST be "ark-code-latest"
  const MODEL_ID = context.env.AI_MODEL || "ark-code-latest"; 

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

  if (!MODEL_ID) {
      return new Response(JSON.stringify({ error: "Missing AI_MODEL environment variable" }), { status: 500 });
  }

  // Real AI Call (Volcengine Ark Coding Plan - OpenAI Compatible)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const mimeType = file.type || 'image/jpeg';
    const url = `https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "Identify this medicine. Return ONLY valid JSON with fields: name, brand, quantity (integer guess), unit, expiry_date (YYYY-MM-DD), dosage, indications (array of strings). Do not use markdown formatting. IMPORTANT: Ensure that the 'name', 'brand', 'dosage', and 'indications' are returned in the exact original language shown on the package (e.g., if the text is in Chinese, return Chinese; if in English, return English). Do not translate them." },
                    { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
                ]
            }
        ]
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Volcengine API Error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    // Parse OpenAI-compatible response
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
         throw new Error("Invalid response structure from Volcengine (OpenAI Compatible)");
    }

    let text = result.choices[0].message.content;
    
    // Clean markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
        const data = JSON.parse(text);
        return Response.json({
            success: true,
            data: data
        });
    } catch (e) {
         return Response.json({
            success: true,
            data: { raw_text: text },
            error: "Failed to parse JSON from AI response"
        });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
