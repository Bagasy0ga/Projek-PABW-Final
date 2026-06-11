export async function askOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "qwen/qwen3-next-80b-a3b-instruct:free";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY belum diisi di Railway Variables.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
      "X-Title": "Projek PABW Final"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: `
Kamu adalah asisten rekomendasi hotel.
Tugasmu adalah memberi rekomendasi hotel berdasarkan kebutuhan user.
Jawab dalam bahasa Indonesia.
Jawaban harus singkat, jelas, dan relevan.
Jangan mengarang data hotel yang tidak diberikan oleh sistem.
          `.trim()
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenRouter error:", data);
    throw new Error(data?.error?.message || "Gagal memanggil OpenRouter.");
  }

  return data.choices?.[0]?.message?.content || "Model tidak memberikan jawaban.";
}