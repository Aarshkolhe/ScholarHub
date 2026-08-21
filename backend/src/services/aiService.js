const CANDIDATE_MODELS = [
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-pro",
];

export async function askGemini({ prompt, systemInstruction }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_free_gemini_api_key_here") {
    return {
      success: false,
      source: "local-rule-engine",
      message: "GEMINI_API_KEY not configured in backend/.env. Using built-in free AI engine.",
    };
  }

  const fullText = systemInstruction
    ? `System Role: ${systemInstruction}\n\nStudent User Input: ${prompt}`
    : prompt;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: fullText }],
      },
    ],
  };

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const candidate = data?.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (text) {
          return {
            success: true,
            source: `google-gemini-ai (${model})`,
            reply: text,
          };
        }
      } else {
        console.warn(`[Gemini API] Model '${model}' returned code ${data?.error?.code}: ${data?.error?.message}`);
      }
    } catch (err) {
      console.warn(`[Gemini API] Network attempt failed for '${model}':`, err.message);
    }
  }

  return {
    success: false,
    source: "local-rule-engine",
    message: "Google Gemini models unavailable for this key, using built-in local engine.",
  };
}
