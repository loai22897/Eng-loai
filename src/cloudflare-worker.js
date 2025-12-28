/**
 * Cloudflare Worker Script for AI Print Bot
 * انسخ هذا الكود وضعه في Cloudflare Workers Dashboard
 */

export default {
  async fetch(request, env, ctx) {
    // 1. التحقق من أن الطلب هو POST (تحديثات تيليجرام تأتي كـ POST)
    if (request.method !== "POST") {
      return new Response("🤖 AI Print Bot Worker is Running correctly!");
    }

    try {
      // 2. إعداد المفاتيح
      // الأفضل تخزينها في Settings -> Variables في Cloudflare
      // لكن تم وضعها هنا لتعمل مباشرة عند النسخ كما طلبت
      const TELEGRAM_TOKEN = env.TELEGRAM_BOT_TOKEN || "8522259228:AAHmZQNks3A0Sse-MJFacx43osd5WDZbq4U";
      const GEMINI_API_KEY = env.GEMINI_API_KEY || "AIzaSyCFvGVqbhrI_Z3nEyZbMRy7VnOk93f3_Zw";

      // 3. استخراج الرسالة
      const data = await request.json();
      const message = data.message?.text;
      const chatId = data.message?.chat?.id;

      // إذا لم تكن رسالة نصية أو لا يوجد معرف محادثة، نتجاهلها
      if (!message || !chatId) {
        return new Response("OK");
      }

      // 4. الردود السريعة للأوامر
      if (message === "/start") {
        await sendTelegram(chatId, `يا مهندس! 🌹\nأنا "AI Print" مساعدك الذكي لصيانة الطابعات.\n\nأرسل لي وصف العطل، أو كود الخطأ، وسأعطيك الحل والقطع المطلوبة.`, TELEGRAM_TOKEN);
        return new Response("OK");
      }
      
      if (message === "/help") {
         await sendTelegram(chatId, `🛠️ **كيف أساعدك؟**\n\n1. أرسل كود العطل (مثلاً SC542).\n2. أرسل وصف المشكلة (مثلاً "حشر ورق في السخان").\n3. اطلب رقم قطعة (مثلاً "رقم رول السخان HP 402").`, TELEGRAM_TOKEN);
         return new Response("OK");
      }

      // 5. التجهيز لإرسال الطلب إلى Gemini
      // نستخدم إصدار v1beta لدعم تعليمات النظام (System Instructions)
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const payload = {
        contents: [{
          parts: [{ text: message }]
        }],
        // تعليمات النظام: تجعل البوت يتقمص شخصية المهندس الخبير
        system_instruction: {
          parts: [{
            text: `أنت "AI Print" مساعد ذكي وخبير متخصص جداً في صيانة الطابعات وماكينات التصوير.
المهام: تشخيص الأعطال، تحديد أرقام قطع الغيار (Part Numbers)، وشرح طرق الإصلاح.
الأسلوب: تحدث كمهندس لزميله المهندس (استخدم مصطلحات فنية دقيقة مثل Fuser Unit, Drum, Developer, Formatter).
تنبيه: إذا كان السؤال بعيداً تماماً عن الطابعات، اعتذر بلطف واطلب سؤالاً تقنياً.`
          }]
        }
      };

      // 6. الاتصال بـ Gemini
      const aiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const aiData = await aiResponse.json();
      
      // استخراج الإجابة
      const replyText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;

      // 7. إرسال الإجابة للمستخدم
      if (replyText) {
        await sendTelegram(chatId, replyText, TELEGRAM_TOKEN);
      } else {
        // رسالة خطأ في حال فشل الذكاء الاصطناعي
        await sendTelegram(chatId, "⚠️ عذراً، واجهت مشكلة في تحليل هذا الطلب. هل يمكنك صياغته بشكل أوضح؟", TELEGRAM_TOKEN);
      }

    } catch (e) {
      console.error(e);
      // في حال حدوث خطأ برمجي، نعيد OK لكي لا يقوم تيليجرام بإعادة إرسال الرسالة مراراً وتكراراً
    }

    return new Response("OK");
  }
};

// --- دالة مساعدة لإرسال الرسائل إلى تيليجرام ---
async function sendTelegram(chatId, text, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        // Markdown يسمح بتنسيق الخط العريض وغيره، لكنه حساس للرموز الخاصة
        // نتركه فارغاً أو نستخدم Markdown بحذر. هنا لم نستخدمه لتجنب الأخطاء.
      })
    });
  } catch (err) {
    console.error("Failed to send telegram message", err);
  }
}
