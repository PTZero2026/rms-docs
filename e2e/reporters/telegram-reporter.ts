import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import fs from 'node:fs';

/**
 * Reporter gửi tóm tắt lỗi + video test fail lên Telegram.
 * Chỉ gửi KHI có test fail và có đủ env TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.
 * Không có env / không có lỗi -> im lặng, không cản trở lần chạy.
 */
interface Failure {
  title: string;
  error: string;
  durationMs: number;
  videoPath?: string;
}

const API = 'https://api.telegram.org';
const stripAnsi = (s: string) => s.replace(/\x1B\[[0-9;]*m/g, '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export default class TelegramReporter implements Reporter {
  private token = process.env.TELEGRAM_BOT_TOKEN || '';
  private chatId = process.env.TELEGRAM_CHAT_ID || '';
  private failures = new Map<string, Failure>();
  private total = 0;

  onTestEnd(test: TestCase, result: TestResult): void {
    this.total++;
    const bad = result.status === 'failed' || result.status === 'timedOut' || result.status === 'interrupted';
    if (!bad) return;
    // giữ lần thử cuối (tránh trùng khi có retry)
    const video = result.attachments.find((a) => a.name === 'video' || a.contentType.startsWith('video/'));
    this.failures.set(test.id, {
      title: test.titlePath().filter(Boolean).slice(1).join(' › ') || test.title,
      error: stripAnsi(result.error?.message || result.errors.map((e) => e.message).join('\n') || 'Không rõ nguyên nhân'),
      durationMs: result.duration,
      videoPath: video?.path && fs.existsSync(video.path) ? video.path : undefined,
    });
  }

  async onEnd(result: FullResult): Promise<void> {
    const fails = [...this.failures.values()];
    if (fails.length === 0) return; // toàn bộ pass -> không gửi
    if (!this.token || !this.chatId) {
      console.warn('[telegram] Bỏ qua gửi: thiếu TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID.');
      return;
    }
    try {
      const passed = this.total - fails.length;
      const head =
        `🔴 <b>RMS E2E — Pilot ĐH Thủy Lợi: ${fails.length} test LỖI</b>\n` +
        `Kết quả: <b>${passed}/${this.total}</b> pass · trạng thái <code>${result.status}</code>\n` +
        `Môi trường: <code>${esc(process.env.RMS_BASE_URL || 'tl-nckh.vnest.vn')}</code>\n\n`;
      // Ghép từng block NGUYÊN VẸN theo ngân sách — không cắt giữa thẻ <pre> (Telegram HTML 4096 ký tự).
      const LIMIT = 3800;
      let body = '';
      let shown = 0;
      for (let i = 0; i < fails.length; i++) {
        const f = fails[i];
        const block = `${i + 1}. <b>${esc(trunc(f.title, 160))}</b>\n<pre>${esc(trunc(f.error, 400))}</pre>\n`;
        if (head.length + body.length + block.length > LIMIT) break;
        body += block;
        shown++;
      }
      if (shown < fails.length) body += `… và ${fails.length - shown} lỗi khác (xem báo cáo HTML).`;
      await this.sendMessage(head + body);

      for (const f of fails) {
        if (!f.videoPath) continue;
        const caption = `🎥 ${esc(trunc(f.title, 900))}`;
        await this.sendFile(f.videoPath, caption);
      }
      console.log(`[telegram] Đã gửi ${fails.length} lỗi lên nhóm chat.`);
    } catch (e) {
      console.error('[telegram] Gửi thất bại:', (e as Error).message);
    }
  }

  private async sendMessage(text: string): Promise<void> {
    const res = await fetch(`${API}/bot${this.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: this.chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!res.ok) throw new Error(`sendMessage ${res.status} ${await res.text()}`);
  }

  /** Gửi video; nếu Telegram từ chối codec (webm) thì fallback gửi dạng document. */
  private async sendFile(filePath: string, caption: string): Promise<void> {
    const buf = fs.readFileSync(filePath);
    const name = filePath.split(/[\\/]/).pop() || 'video.webm';
    const asVideo = await this.upload('sendVideo', 'video', buf, name, caption, { supports_streaming: 'true' });
    if (!asVideo.ok) await this.upload('sendDocument', 'document', buf, name, caption, {});
  }

  private async upload(
    method: string,
    field: string,
    buf: Buffer,
    filename: string,
    caption: string,
    extra: Record<string, string>,
  ): Promise<{ ok: boolean }> {
    const fd = new FormData();
    fd.append('chat_id', this.chatId);
    fd.append('caption', caption);
    fd.append('parse_mode', 'HTML');
    for (const [k, v] of Object.entries(extra)) fd.append(k, v);
    fd.append(field, new Blob([new Uint8Array(buf)], { type: 'video/webm' }), filename);
    const res = await fetch(`${API}/bot${this.token}/${method}`, { method: 'POST', body: fd });
    if (!res.ok) console.warn(`[telegram] ${method} ${res.status}: ${trunc(await res.text(), 200)}`);
    return { ok: res.ok };
  }
}
