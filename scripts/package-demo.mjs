// Ship the same V0 build and snapshots that a new browser session receives.
import { execFileSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initialSnapshot } from '../apps/web/src/demo/storage.ts'
import { roleForAccount, roleNames } from '../apps/web/src/demo/identity.ts'

const repo = fileURLToPath(new URL('../', import.meta.url))
const dest = join(repo, 'dist')
const stage = await mkdtemp(join(tmpdir(), 'rms-school-demo-'))
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;')
function page(title, body) {
  return `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title>
<style>body{max-width:66rem;margin:2rem auto;padding:0 1rem;color:#182e35;font:1rem/1.55 system-ui,sans-serif}a{color:#075e61}nav{display:flex;gap:.8rem;flex-wrap:wrap}h1,h2,h3{line-height:1.25}article{border-top:1px solid #cad7d7;padding:.6rem 0}dt{font-weight:650}dd{margin:0 0 .65rem}pre{white-space:pre-wrap;font:inherit}li{margin:.5rem 0}th,td{text-align:left;vertical-align:top;border-bottom:1px solid #cad7d7;padding:.4rem}table{border-collapse:collapse}@media print{nav,.open{display:none}article{break-inside:avoid}}</style>
<nav><a href="demo.html">Hướng dẫn</a><a href="tlu.html">Thủy lợi</a><a href="hmu.html">Y Hà Nội</a><a href="review.html">Tiêu chí và ca kiểm thử</a></nav><main><h1>${escape(title)}</h1>${body}</main></html>`
}
function caseGuide(pack, rows) {
  const accounts = new Map(rows.filter(r => r.kind === 'account').map(r => [r.owner, r]))
  const features = [...new Set(pack.cases.map(c => c.feature))]
  const menu = features.map(f => `<a href="#${f}">${f}</a>`).join(' ')
  return page(pack.school, `<p>Đọc điều kiện trước khi mở ca. Liên kết mở đúng trường, vai và màn hình trên cùng một tab RMS. Để thử nhánh khác từ đầu, dùng một phiên duyệt riêng mới. <a href="data/${pack.tenant}.json">Bộ dữ liệu đầy đủ (JSON)</a> · <a href="review-${pack.tenant}.md">Phiếu ghi nhận review</a></p><nav>${menu}</nav>` +
    features.map(f => `<h2 id="${f}">${f}</h2>` + pack.cases.filter(c => c.feature === f).map(c => {
      const actor = accounts.get(c.actor)
      const record = rows.find(r => r.id === c.recordId)
      return `<article id="${c.id}"><h3>${c.id} · ${escape(c.goal)}</h3><dl><dt>Người thao tác</dt><dd>${escape(actor.title)} · ${escape(roleNames[roleForAccount(actor)])} · ${escape(actor.unit)}</dd><dt>Điều kiện</dt><dd>${escape(c.precondition)}</dd><dt>Hồ sơ ban đầu</dt><dd>${escape(record.title)} · ${escape(record.fields.code || record.id)} · ${escape(record.status)}</dd><dt>Thao tác và dữ liệu nhập</dt><dd>${escape(c.steps)}</dd><dt>Kết quả cần đối chiếu</dt><dd>${escape(c.expected)}</dd></dl><p class="open"><a href="./?cas=${c.id}" target="rms-demo">Mở ca ${c.id} trong RMS</a> · <a href="review.html#${f}">Tra tiêu chí ${f}</a></p></article>`
    }).join('')).join(''))
}
try {
  await mkdir(dest, { recursive: true })
  await cp(join(repo, 'apps/web/dist'), stage, { recursive: true })
  await mkdir(join(stage, 'data'))
  const features = (await readdir(join(repo, 'docs/features'))).filter(n => /^[BFP]\d\d-/.test(n)).sort()
  const sections = []
  for (const folder of features) {
    const id = folder.slice(0, 3)
    const source = join(repo, 'docs/features', folder)
    const directory = join(stage, 'criteria', folder)
    await mkdir(directory, { recursive: true })
    for (const name of ['spec.md', 'test-plan.md']) await cp(join(source, name), join(directory, name))
    const plan = await readFile(join(source, 'test-plan.md'), 'utf8')
    const lines = plan.split('\n').filter(line => /^\|\s*TC-\d/.test(line))
    const items = lines.map(line => {
      const cells = line.slice(1).replace(/\|\s*$/, '').split(/(?<!\\)\|/).map(cell => cell.trim())
      return `<li><b>${escape(cells.slice(0, 2).join(' · '))}</b> — ${escape(cells.slice(2).join(' → '))}</li>`
    })
    sections.push(`<section id="${id}"><h2>${escape(folder)}</h2><p><a href="criteria/${folder}/spec.md">Đặc tả và AC</a> · <a href="criteria/${folder}/test-plan.md">Toàn văn kế hoạch kiểm thử</a></p><ul>${items.join('')}</ul></section>`)
  }
  await writeFile(join(stage, 'review.html'), page('Tiêu chí và ca kiểm thử theo phân hệ',
    '<p>Dùng mã AC và TC để ghi phát hiện vào phiếu của trường. Các ca API, đăng nhập thật, lưu tệp, phân quyền máy chủ và đồng thời cần môi trường tích hợp của dự án.</p>' + sections.join('')))
  for (const tenant of ['tlu', 'hmu']) {
    const pack = JSON.parse(await readFile(join(repo, 'apps/web/src/demo/datasets', tenant + '.json'), 'utf8'))
    const snapshot = initialSnapshot(tenant)
    await writeFile(join(stage, 'data', tenant + '.json'), JSON.stringify({
      tenant, school: pack.school, businessDate: '2026-11-21', ...snapshot, cases: pack.cases,
    }, null, 2) + '\n')
    await writeFile(join(stage, tenant + '.html'), caseGuide(pack, snapshot.rows))
    const log = ['# Phiếu review · ' + pack.school, '', 'Người review ____________________    Ngày ____________________', '',
      '| Ca | Mục tiêu | Kết quả thực tế | Đạt / Cần sửa / Chưa chạy | Bằng chứng và mã vấn đề |',
      '|---|---|---|---|---|', ...pack.cases.map(c => `| ${c.id} | ${c.goal} | | Chưa chạy | |`)]
    await writeFile(join(stage, 'review-' + tenant + '.md'), log.join('\n') + '\n')
    console.log(tenant, snapshot.rows.length, 'bản ghi,', snapshot.audit.length, 'sự kiện,', pack.cases.length, 'ca')
  }
  await writeFile(join(stage, 'demo.html'), page('Demo và review RMS', `
<p>Ngày nghiệp vụ 21/11/2026. Chọn trường để mở ca với tư cách chủ nhiệm, chuyên viên, người chấm, sinh viên hoặc quản trị. Tất cả hồ sơ, mức kinh phí và quy định theo trường trong gói đều là dữ liệu mô phỏng.</p>
<ul><li><a href="tlu.html">Đại học Thủy lợi</a> · Thử từ báo cáo quan trắc, khoản chi và sáng chế đang chờ duyệt đến điều kiện nghiệm thu. Với ca TLU-16, đối soát đủ PC-19 và PC-20 trước khi đóng đề tài.</li>
<li><a href="hmu.html">Đại học Y Hà Nội</a> · Chạy HMU-07 rồi HMU-08 để phân biệt kết luận khoa học và kết quả đạo đức. Chạy HMU-24 rồi HMU-29 để duyệt hợp đồng và đối chiếu 24 giờ của Mai, 16 giờ của Minh.</li></ul>
<p>Đổi người giữa chừng bằng nút <b>Phiên mô phỏng</b> trong RMS. Mỗi tab giữ danh tính riêng. Các thay đổi được lưu trên trình duyệt và dùng chung giữa các tab cùng địa chỉ. Đóng mọi cửa sổ riêng tư rồi mở lại để chạy một buổi mới trên dữ liệu gốc.</p>
<p>Mở liên kết ca khi đang chạy máy chủ cục bộ. Để khởi động từ thư mục đã giải nén, chạy <code>python3 -m http.server 4173 --bind 127.0.0.1</code>, sau đó mở <a href="http://127.0.0.1:4173/demo.html">hướng dẫn và hai bộ ca</a>. Bản mô phỏng lưu thông tin minh chứng và phát sinh tệp xuất báo cáo, lý lịch ở máy người dùng.</p>`))
  await writeFile(join(stage, 'BAT-DAU.txt'), 'Giải nén gói vào một thư mục. Mở terminal tại đó và chạy\n\npython3 -m http.server 4173 --bind 127.0.0.1\n\nMở http://127.0.0.1:4173/demo.html trong trình duyệt.\n')
  const files = await readdir(stage)
  const zip = join(dest, 'rms-demo-tlu-hmu.zip')
  execFileSync('python3', ['-m', 'zipfile', '-c', zip, ...files], { cwd: stage })
  await cp(stage, join(dest, 'demo-rms'), { recursive: true })
  console.log(zip)
} finally {
  await rm(stage, { recursive: true, force: true })
}
