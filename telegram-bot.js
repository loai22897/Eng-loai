
/**
 * ملف تشغيل بوت تلجرام (Pro Version)
 * يدعم البحث المتقدم عن الفيرموير والتعريفات والمواصفات
 * مع معالجة ذكية للأخطاء (Auto-Fallback) ودعم Cloudflare
 */

import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// --- إعداد المسارات ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- تحميل متغيرات البيئة ---
dotenv.config({ path: path.resolve(__dirname, '.env') });
if (fs.existsSync(path.resolve(__dirname, '.env.local'))) {
    const envLocalConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '.env.local')));
    for (const k in envLocalConfig) {
        process.env[k] = envLocalConfig[k];
    }
}

const app = express();

// إعداد مهم عند استخدام Cloudflare أو أي Reverse Proxy
// يسمح هذا للتطبيق بمعرفة أنه يعمل خلف بروكسي ويثق في ترويسات IP والبروتوكول
app.set('trust proxy', 1);

const PORT = process.env.PORT || 4000; 

// قراءة المفاتيح بدقة
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.AI_STUDIO_API_KEY || process.env.API_KEY;
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN;

// --- التحقق من المفاتيح ---
if (!BOT_TOKEN) {
  console.error("❌ خطأ قاتل: لم يتم العثور على TELEGRAM_BOT_TOKEN في ملف .env");
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error("❌ خطأ قاتل: لم يتم العثور على API_KEY الخاص بـ Gemini في ملف .env");
  process.exit(1);
}

console.log("✅ المفاتيح موجودة. جاري إعداد الاتصال...");

// --- إعداد الذكاء الاصطناعي ---
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
// Updated to gemini-3-flash-preview per guidelines
const MODEL_NAME = "gemini-3-flash-preview"; 

// --- التعليمات الموحدة ---
const MAIN_SYSTEM_INSTRUCTION = `
أنت "AI Print by Loai"، مساعد ذكي ومتخصص لمهندسي صيانة الطابعات.

**الشخصية والأسلوب:**
* كن محترفاً، موجزاً، وواثقاً.
* تحدث بصيغة الخبير الذي يقدم توجيهات عملية فورية.
* استخدم المصطلحات الفنية الصحيحة بالإنجليزية (مثل Fuser Unit, Drum Unit).
* لا تستخدم Markdown معقد قد يكسر رسائل تلجرام.

**المهمة:**
ساعد المهندس في تشخيص الأعطال، العثور على التعريفات، أو معرفة المواصفات.
`;

// --- إنشاء البوت ---
const bot = new Telegraf(BOT_TOKEN);

bot.catch((err, ctx) => {
  console.error(`❌ Telegraf Error for ${ctx.updateType}:`, err);
  ctx.reply("⚠️ حدث خطأ داخلي في البوت، حاول مرة أخرى.").catch(() => {});
});

// --- القائمة الرئيسية ---
const mainMenu = Markup.keyboard([
  ['🔍 بحث عن تعريف', '🔄 تحديث فيرموير'],
  ['📋 مواصفات طابعة', '❓ تشخيص عطل']
]).resize();

bot.start((ctx) => {
    const userName = ctx.from.first_name || "يا هندسة";
    ctx.reply(
        `أهلاً بك ${userName} 🌹\nأنا (AI Print Bot) مساعدك الشخصي.\n\nاختر من القائمة أو اكتب سؤالك مباشرة (نص أو صورة).`,
        mainMenu
    );
});

bot.command('help', (ctx) => ctx.reply('أرسل لي كود العطل، أو اسم الطابعة، أو صورة للمشكلة وسأقوم بتحليلها.'));

// --- معالجة النصوص ---
bot.on('text', async (ctx) => {
  const userText = ctx.message.text;
  if (!userText || userText.startsWith('/')) return;

  ctx.sendChatAction('typing').catch(() => {});

  try {
    let intent = 'CHAT';
    const lowerText = userText.toLowerCase();

    if (/firmware|فيرموير|سوفتوير|تحديث|نسخة|update/i.test(lowerText)) intent = 'FIRMWARE';
    else if (/driver|تعريف|scan|printer|تحميل|download/i.test(lowerText)) intent = 'DRIVER';
    else if (/spec|مواصفات|سرعة|حبر|طابعة/i.test(lowerText) && userText.length < 50) intent = 'SPECS';

    let finalPrompt = userText;
    let systemInstruction = MAIN_SYSTEM_INSTRUCTION;
    let useSearchTool = false;

    if (intent === 'FIRMWARE') {
        finalPrompt = `Find LATEST official firmware for: "${userText}". Return a summary table in Arabic.`;
        useSearchTool = true;
    } else if (intent === 'DRIVER') {
        finalPrompt = `Find official driver download link for: "${userText}". Return the direct link nicely formatted in Arabic.`;
        useSearchTool = true;
    } else if (intent === 'SPECS') {
        finalPrompt = `Get technical specs for: "${userText}" (Speed, Toner, Drum). Format as a list in Arabic.`;
        useSearchTool = true;
    } else {
        useSearchTool = /كود|code|error|عطل|سعر|price/i.test(lowerText);
    }

    try {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: finalPrompt,
          config: { 
            systemInstruction: systemInstruction,
            tools: useSearchTool ? [{ googleSearch: {} }] : undefined
          },
        });

        // Use property access for .text
        let replyText = response.text || "";

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && chunks.length > 0) {
           const links = chunks
            .filter(c => c.web?.uri)
            .map(c => `🔗 ${c.web.title || 'رابط'}: ${c.web.uri}`)
            .slice(0, 3)
            .join('\n');
           
           if (links) replyText += `\n\n${links}`;
        }

        if (!replyText) throw new Error("Empty response from AI");

        await ctx.reply(replyText);

    } catch (apiError) {
        console.warn("⚠️ المحاولة الأولى فشلت، جاري استخدام Fallback بدون أدوات...");
        
        try {
            const fallbackResponse = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: `${finalPrompt} (أجب بناءً على معلوماتك العامة السابقة بدون بحث)`,
                config: { systemInstruction: systemInstruction } 
            });
            
            // Use property access for .text
            const fallbackText = fallbackResponse.text;
            if (fallbackText) {
                await ctx.reply(fallbackText + "\n\n*(ملاحظة: حدث خطأ في البحث الحي، هذه الإجابة من الأرشيف الداخلي)*");
            } else {
                await ctx.reply("عذراً، لم أتمكن من معالجة طلبك في الوقت الحالي.");
            }
        } catch (finalError) {
            console.error("❌ فشلت كل المحاولات:", finalError);
            await ctx.reply("⚠️ حدث خطأ في الاتصال بالخادم.");
        }
    }

  } catch (error) {
    console.error("❌ Processing Error:", error);
    ctx.reply("حدث خطأ غير متوقع.");
  }
});

// --- معالجة الصور ---
bot.on('photo', async (ctx) => {
    ctx.sendChatAction('typing').catch(() => {});
    try {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const fileLink = await ctx.telegram.getFileLink(fileId);
        
        const response = await fetch(fileLink.href);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');

        const aiResponse = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                    { text: ctx.message.caption || "ما هي المشكلة في هذه الطابعة؟ وكيف أصلحها؟" }
                ]
            },
            config: { systemInstruction: MAIN_SYSTEM_INSTRUCTION }
        });

        // Use property access for .text
        await ctx.reply(aiResponse.text || "لم أستطع تحليل الصورة.");
    } catch (error) {
        console.error("Image Error:", error);
        ctx.reply("⚠️ فشل تحليل الصورة.");
    }
});

// --- تشغيل الخادم ---
const startBot = async () => {
    try {
        if (WEBHOOK_DOMAIN) {
            app.use(express.json());
            
            // نقطة النهاية (Endpoint) التي سيقوم تلجرام بإرسال التحديثات إليها
            // Cloudflare سيقوم بتوجيه HTTPS إلى هذا المسار
            app.post('/telegram-webhook', (req, res) => {
                bot.handleUpdate(req.body, res);
            });
            
            app.get('/', (req, res) => res.send('🤖 AI Print Bot is Running behind Cloudflare!'));

            const webhookUrl = `${WEBHOOK_DOMAIN}/telegram-webhook`;
            console.log(`🔌 وضع الإنتاج (Cloudflare): جاري ضبط Webhook على: ${webhookUrl}`);
            
            // إلغاء أي webhook سابق وضبط الجديد
            await bot.telegram.deleteWebhook();
            await bot.telegram.setWebhook(webhookUrl);
            
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        } else {
            console.log("🔄 وضع التطوير (Polling)...");
            await bot.telegram.deleteWebhook({ drop_pending_updates: true });
            bot.launch();
            console.log("✅ البوت يعمل الآن (محلي)!");
        }
    } catch (error) {
        console.error("❌ فشل تشغيل البوت:", error);
    }
};

startBot();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
