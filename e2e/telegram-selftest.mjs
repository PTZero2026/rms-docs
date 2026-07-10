// Gửi thử 1 tin (và 1 video nếu có) lên Telegram để xác nhận env đúng.
// Chạy: node telegram-selftest.mjs  [đường-dẫn-video.webm]
import 'dotenv/config';
import fs from 'node:fs';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const API = 'https://api.telegram.org';

if (!token || !chatId) {
  console.error('❌ Thiếu TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID (đặt trong .env hoặc env shell).');
  process.exit(1);
}
console.log(`Bot token: ...${token.slice(-6)} · chat_id: ${chatId}`);

const call = async (method, body, isForm = false) => {
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: 'POST',
    ...(isForm ? {} : { headers: { 'Content-Type': 'application/json' } }),
    body: isForm ? body : JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`${method}: ${res.status} ${text.slice(0, 200)}`);
  return res.ok;
};

// 1) getMe — kiểm token
await call('getMe', {}); // GET cũng được nhưng POST vẫn hợp lệ

// 2) tin nhắn thử
await call('sendMessage', {
  chat_id: chatId,
  parse_mode: 'HTML',
  text: '✅ <b>RMS E2E self-test</b>\nKết nối Telegram OK. Đây là tin gửi thử, không phải lỗi test.',
});

// 3) video mẫu (nếu truyền đường dẫn hoặc tìm được trong videos/)
let vid = process.argv[2];
if (!vid && fs.existsSync('videos')) {
  const f = fs.readdirSync('videos').find((x) => x.endsWith('.webm'));
  if (f) vid = `videos/${f}`;
}
if (vid && fs.existsSync(vid)) {
  const fd = new FormData();
  fd.append('chat_id', chatId);
  fd.append('caption', `🎥 video mẫu: ${vid}`);
  fd.append('video', new Blob([new Uint8Array(fs.readFileSync(vid))], { type: 'video/webm' }), vid.split(/[\\/]/).pop());
  const ok = await call('sendVideo', fd, true);
  if (!ok) {
    const fd2 = new FormData();
    fd2.append('chat_id', chatId);
    fd2.append('document', new Blob([new Uint8Array(fs.readFileSync(vid))]), vid.split(/[\\/]/).pop());
    await call('sendDocument', fd2, true);
  }
} else {
  console.log('(bỏ qua video — không có file .webm; chạy test có RMS_VIDEO=1 để sinh)');
}
console.log('Xong. Kiểm tra nhóm chat Telegram.');
