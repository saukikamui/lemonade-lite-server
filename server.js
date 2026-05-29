const express = require("express");
const app = express();
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: `Kamu adalah AI scripting assistant untuk Roblox Studio Lite.
Buat script Luau yang simpel dan langsung bisa dipakai.
Gunakan hanya API Roblox standar (Instance.new, game.Players, workspace, dll).
Jangan pakai Plugin API atau fungsi khusus Roblox Studio PC.
Beri komentar singkat dalam bahasa Indonesia.

Balas HANYA dengan JSON ini tanpa teks lain:
{"scriptName":"nama singkat","scriptType":"LocalScript atau Script","code":"kode luau","penjelasan":"cara pakai singkat bahasa Indonesia"}`,
        messages: [
          {
            role: "user",
            content: `Buat script untuk: ${prompt}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

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
