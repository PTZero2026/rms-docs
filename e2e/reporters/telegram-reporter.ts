import type { Reporter, TestCase, TestResult, TestStep, FullResult } from '@playwright/test/reporter';
import fs from 'node:fs';

/**
 * Reporter gửi lỗi test lên Telegram: 1 tin tổng kết + với MỖI test lỗi gửi
 * kèm video và một message MÔ TẢ CÁC BƯỚC đã thực hiện (đánh dấu bước lỗi).
 * Chỉ gửi khi có test fail và đủ env TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.
 */
interface StepLine {
  text: string;
  failed: boolean;
}
interface Failure {
  title: string;
  error: string;
  steps: StepLine[];
  videoPath?: string;
}

const API = 'https://api.telegram.org';
const stripAnsi = (s: string) => s.replace(/\x1B\[[0-9;]*m/g, '');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Biểu tượng gợi loại thao tác cho dễ đọc. */
function iconFor(title: string): string {
  const t = title.toLowerCase();
  if (/goto|navigate|waitforurl/.test(t)) return '🌐';
  if (/\bfill\b|type|presssequentially/.test(t)) return '✏️';
  if (/click|press\b/.test(t)) return '👆';
  if (/expect|tobevisible|tohaveurl|tohavetitle|tohavecount|tobe/.test(t)) return '🔎';
  if (/waitfor/.test(t)) return '⏳';
  return '•';
}

// Bỏ bước vòng đời trình duyệt (nhiễu, không phải thao tác nghiệp vụ).
const NOISE = /^(Launch browser|Create (context|page)|Close (context|page)|Set (storage|extra)|Dispose|Fixture)/i;

/** Gom bước có ý nghĩa (thao tác + kiểm tra) từ cây step, giữ thứ tự, bỏ hook/fixture (đăng nhập). */
function collectSteps(steps: TestStep[] | undefined, out: StepLine[]): void {
  for (const s of steps || []) {
    if ((s.category === 'pw:api' || s.category === 'expect' || s.category === 'test.step') && !NOISE.test(s.title)) {
      out.push({ text: s.title, failed: !!s.error });
    }
    if (s.steps?.length) collectSteps(s.steps, out);
  }
}

export default class TelegramReporter implements Reporter {
  private token = process.env.TELEGRAM_BOT_TOKEN || '';
  private chatId = process.env.TELEGRAM_CHAT_ID || '';
  private failures = new Map<string, Failure>();
  private total = 0;

  onTestEnd(test: TestCase, result: TestResult): void {
    this.total++;
    const bad = result.status === 'failed' || result.status === 'timedOut' || result.status === 'interrupted';
    if (!bad) return;
    const video = result.attachments.find((a) => a.name === 'video' || a.contentType.startsWith('video/'));
    const steps: StepLine[] = [];
    collectSteps(result.steps, steps);
    this.failures.set(test.id, {
      title: test.titlePath().filter(Boolean).slice(1).join(' › ') || test.title,
      error: stripAnsi(result.error?.message || result.errors.map((e) => e.message).join('\n') || 'Không rõ nguyên nhân'),
      steps: steps.slice(0, 40),
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
      const env = esc(process.env.RMS_BASE_URL || 'tl-nckh.vnest.vn');
      // 1) Tin tổng kết ngắn
      await this.sendMessage(
        `🔴 <b>RMS E2E — ${fails.length} test LỖI</b>\n` +
          `Kết quả: <b>${passed}/${this.total}</b> pass · <code>${result.status}</code> · <code>${env}</code>`,
      );
      // 2) Mỗi test lỗi: message mô tả các bước + (video kèm theo nếu có)
      for (const f of fails) {
        await this.sendMessage(this.buildStepsMessage(f));
        if (f.videoPath) await this.sendFile(f.videoPath, `🎥 ${esc(trunc(f.title, 150))}`);
      }
      console.log(`[telegram] Đã gửi ${fails.length} lỗi (kèm bước + video) lên nhóm chat.`);
    } catch (e) {
      console.error('[telegram] Gửi thất bại:', (e as Error).message);
    }
  }

  /** Dựng message: tiêu đề + danh sách bước (bước lỗi đánh ❌) + lỗi. Bảo đảm ≤ 4096, không cắt giữa thẻ. */
  private buildStepsMessage(f: Failure): string {
    const header = `🎬 <b>${esc(trunc(f.title, 180))}</b>\n🧭 <b>Các bước đã chạy:</b>\n`;
    let lines = '';
    let n = 0;
    for (const s of f.steps) {
      const mark = s.failed ? '❌' : '✅';
      const line = `${mark} ${++n}. ${iconFor(s.text)} ${esc(trunc(s.text, 90))}\n`;
      if (header.length + lines.length + line.length > 2800) {
        lines += '…\n';
        break;
      }
      lines += line;
    }
    if (!lines) lines = '(không ghi nhận bước chi tiết)\n';
    const errBlock = `\n⛔ <b>Lỗi:</b>\n<pre>${esc(trunc(f.error, 500))}</pre>`;
    return header + lines + errBlock; // header + ≤2800 + ≤~560 < 4096
  }

  private async sendMessage(text: string): Promise<void> {
    if (process.env.TELEGRAM_DRY_RUN) {
      console.log('\n----- [telegram dry-run: sendMessage] -----\n' + text + '\n-------------------------------------------');
      return;
    }
    const res = await fetch(`${API}/bot${this.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: this.chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!res.ok) throw new Error(`sendMessage ${res.status} ${await res.text()}`);
  }

  /** Gửi video; nếu Telegram từ chối codec (webm) thì fallback gửi dạng document. */
  private async sendFile(filePath: string, caption: string): Promise<void> {
    if (process.env.TELEGRAM_DRY_RUN) {
      console.log(`[telegram dry-run: sendVideo] ${caption} <- ${filePath}`);
      return;
    }
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
