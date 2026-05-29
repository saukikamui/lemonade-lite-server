const express = require("express");
const app = express();
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ status: "Lemonade Lite Server aktif!" });
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt tidak boleh kosong" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `Kamu adalah AI scripting assistant untuk Roblox Studio Lite.
Buat script Luau yang simpel dan langsung bisa dipakai.
Gunakan hanya API Roblox standar (Instance.new, game.Players, workspace, dll).
Jangan pakai Plugin API atau fungsi khusus Roblox Studio PC.
Beri komentar singkat dalam bahasa Indonesia.

Balas HANYA dengan JSON ini tanpa teks lain:
{"scriptName":"nama singkat","scriptType":"LocalScript atau Script","code":"kode luau","penjelasan":"cara pakai singkat bahasa Indonesia"}`
          },
          {
            role: "user",
            content: `Buat script untuk: ${prompt}`
          }
        ]
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      parsed = {
        scriptName: "Script",
        scriptType: "LocalScript",
        code: text,
        penjelasan: "Copy script ke Studio Lite kamu.",
      };
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Gagal generate: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
