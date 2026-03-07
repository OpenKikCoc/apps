export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const prompt = formData.get('message') || formData.get('prompt');
    const file = formData.get('file') || formData.get('image');
    let sessionId = formData.get('session_id');

    const API_KEY = context.env.AI_API_KEY;
    const MODEL_ID = context.env.AI_MODEL || "ark-code-latest"; 

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "Missing AI_API_KEY" }), { status: 500 });
    }

    // 1. Session Management
    let isNewSession = false;
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        isNewSession = true;
        // Create new session in DB
        await context.env.DB.prepare(
            `INSERT INTO ai_sessions (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)`
        ).bind(sessionId, prompt ? prompt.substring(0, 50) : "New Chat", Date.now(), Date.now()).run();
    } else {
        // Update session timestamp
        await context.env.DB.prepare(
            `UPDATE ai_sessions SET updated_at = ? WHERE id = ?`
        ).bind(Date.now(), sessionId).run();
    }

    // 2. Build User Content
    const userContent = [];
    if (prompt) {
      userContent.push({ type: "text", text: prompt });
    }

    if (file && typeof file === 'object' && file.name) {
      const mimeType = file.type || '';
      if (mimeType.startsWith('image/')) {
        const arrayBuffer = await file.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64Image = btoa(binary);
        userContent.push({ 
          type: "image_url", 
          image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${base64Image}` } 
        });
      } else {
        try {
            const textContent = await file.text();
            userContent.push({ 
                type: "text", 
                text: `\n\n[File Content: ${file.name}]\n\`\`\`\n${textContent}\n\`\`\`\n` 
            });
        } catch (e) {
            console.warn(`Failed to read file ${file.name} as text:`, e);
        }
      }
    }

    if (userContent.length === 0) {
        return new Response(JSON.stringify({ error: "No message or valid file provided" }), { status: 400 });
    }

    // 3. Save User Message to DB
    const userMsgId = crypto.randomUUID();
    // For storage, we simplify content to text if possible, or a placeholder for images
    // Since D1 is simple, we'll store the text part as 'content'. 
    // Ideally we'd store the full JSON structure, but for simple history, text is often enough.
    // If it's multimodal, we might want to store a JSON string.
    // Let's store the raw text prompt for now, or "[Image]" if only image.
    let storedContent = prompt || "";
    if (file) storedContent += ` [File: ${file.name}]`;
    
    await context.env.DB.prepare(
        `INSERT INTO ai_messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)`
    ).bind(userMsgId, sessionId, 'user', storedContent, Date.now()).run();

    // 4. Fetch History (Context Window)
    // Get last 20 messages for context (using subquery to get latest then order chronologically)
    const { results: history } = await context.env.DB.prepare(
        `SELECT id, role, content FROM (
            SELECT id, role, content, created_at FROM ai_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 20
        ) ORDER BY created_at ASC`
    ).bind(sessionId).all();

    // Construct messages array for API
    // Note: We need to be careful. The DB stores simplified content. 
    // The API needs the specific structure.
    // For the *current* turn, we use the rich `userContent` object.
    // For *past* turns, we use the text content from DB.
    // This means past images are lost in context (unless we store them, which is heavy for D1).
    // This is a common trade-off. We'll just send text history + current rich input.
    
    const apiMessages = history.filter(msg => msg.id !== userMsgId).map(msg => ({
        role: msg.role,
        content: msg.content
    }));
    
    // Add current message with full rich content
    apiMessages.push({
        role: "user",
        content: userContent
    });

    // 5. Call AI API
    const url = `https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions`;
    const response = await fetch(url, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: apiMessages
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Volcengine API Error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
         throw new Error("Invalid response structure from Volcengine");
    }
    const aiContent = result.choices[0].message.content;

    // 6. Save AI Response to DB
    const aiMsgId = crypto.randomUUID();
    await context.env.DB.prepare(
        `INSERT INTO ai_messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)`
    ).bind(aiMsgId, sessionId, 'assistant', aiContent, Date.now()).run();

    return Response.json({
      success: true,
      data: {
        session_id: sessionId,
        response: aiContent,
        is_new_session: isNewSession
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
