
export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("🤖 AI Print Bot Worker is Running correctly!");
    }

    try {
      const TELEGRAM_TOKEN = env.TELEGRAM_BOT_TOKEN;
      const GEMINI_API_KEY = env.GEMINI_API_KEY;

      const data = await request.json();
      const message = data.message?.text;
      const chatId = data.message?.chat?.id;

      if (!message || !chatId) return new Response("OK");

      if (message === "/start") {
        await sendTelegram(chatId, `يا مهندس! 🌹\nأنا "AI Print" مساعدك الذكي لصيانة الطابعات.`, TELEGRAM_TOKEN);
        return new Response("OK");
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;
      
      const payload = {
        contents: [{ parts: [{ text: message }] }],
        system_instruction: { parts: [{ text: `أنت خبير صيانة طابعات.` }] }
      };

      const aiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const aiData = await aiResponse.json();
      const replyText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText) await sendTelegram(chatId, replyText, TELEGRAM_TOKEN);

    } catch (e) {
      console.error(e);
    }
    return new Response("OK");
  }
};

async function sendTelegram(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}
