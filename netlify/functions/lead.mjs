/**
 * ============================================================
 *  Приём заявок с формы -> сообщение в Telegram (Netlify Function)
 * ============================================================
 *  Адрес: POST /api/lead  (в js/config.js: formEndpoint: "/api/lead")
 *
 *  Переменные окружения (Netlify -> Project configuration ->
 *  Environment variables):
 *    TELEGRAM_BOT_TOKEN — токен бота от @BotFather
 *    TELEGRAM_CHAT_ID   — id чата или группы, куда слать заявки
 *
 *  Заявки нигде не сохраняются — только пересылаются в Telegram.
 * ============================================================
 */
export const config = { path: '/api/lead' };

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

// одна строка: убираем управляющие символы и обрезаем длину
function line(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
}

// многострочный текст (комментарий): переносы строк сохраняем
function text(v, max) {
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ').trim().slice(0, max);
}

export default async (req) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return json({ ok: false, error: 'not_configured' }, 500);

  let data;
  try { data = await req.json(); } catch (e) { return json({ ok: false, error: 'bad_json' }, 400); }
  if (!data || typeof data !== 'object') return json({ ok: false, error: 'bad_json' }, 400);

  // ловушка для спам-ботов: скрытое поле, живой человек его не заполняет
  if (data.website) return json({ ok: true });

  const name = line(data.name, 100);
  const phone = line(data.phone, 30);
  const service = line(data.service, 150);
  const comment = text(data.comment, 1000);

  if (name.length < 2 || phone.replace(/\D/g, '').length !== 11) {
    return json({ ok: false, error: 'validation' }, 422);
  }

  const site = new URL(req.url).host;
  const lines = ['🚗 Новая заявка с сайта ' + site, '', 'Имя: ' + name, 'Телефон: ' + phone];
  if (service) lines.push('Услуга: ' + service);
  if (comment) lines.push('\nКомментарий:\n' + comment);
  const msg = lines.join('\n');

  try {
    const res = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, disable_web_page_preview: true })
    });
    if (!res.ok) return json({ ok: false, error: 'telegram_error' }, 502);
  } catch (e) {
    return json({ ok: false, error: 'telegram_unreachable' }, 502);
  }

  return json({ ok: true });
};
