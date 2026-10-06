import { mkdir, readFile, writeFile, copyFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const format = text => escape(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const source = await readFile(path.join(root, 'Resume.txt'), 'utf8');
const content = source.slice(source.indexOf('Senior Tech Lead and Full-Stack Architect'));
let inList = false;
let blocks = [];
for (const raw of content.split(/\r?\n/)) {
  const line = raw.trim();
  if (!line) continue;
  const bullet = /^[●•]\s+/.test(line);
  if (inList && !bullet) { blocks.push('</ul>'); inList = false; }
  if (bullet) {
    if (!inList) { blocks.push('<ul>'); inList = true; }
    blocks.push(`<li>${format(line.replace(/^[●•]\s+/, ''))}</li>`);
  } else if (/^---+$/.test(line)) blocks.push('<hr>');
  else if (line.startsWith('### ')) blocks.push(`<h3>${format(line.slice(4))}</h3>`);
  else if (line.startsWith('# ')) blocks.push(`<h2>${format(line.slice(2))}</h2>`);
  else blocks.push(`<p>${format(line)}</p>`);
}
if (inList) blocks.push('</ul>');
const resume = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resume — Sri Krishna Teja Kamma</title><link rel="icon" href="assets/favicon.svg"><style>
*{box-sizing:border-box}body{background:#f4f5f1;color:#17241e;font:15px/1.7 Arial,sans-serif;margin:0}main{max-width:920px;margin:40px auto;background:white;padding:60px 65px;border:1px solid #dce4de}h1{font-size:36px;line-height:1.2;letter-spacing:-1px;margin-bottom:10px}h2{font-size:23px;line-height:1.4;margin-top:40px;color:#244a3a}h3{font-size:16px;margin-top:26px}p{margin:10px 0}li{margin-bottom:12px}hr{border:0;border-top:1px solid #dce4de;margin-top:35px}a{color:#245f46}nav{max-width:920px;margin:28px auto;display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding:0 16px;font-size:13px}button{margin-left:auto;border:0;background:#244a3a;color:white;padding:12px 20px;border-radius:4px;cursor:pointer}header{border-bottom:1px solid #dce4de;padding-bottom:24px;margin-bottom:30px}.subtitle{font-size:19px;color:#52665a}.contact{font-size:13px}a:focus-visible,button:focus-visible{outline:2px solid #326e50;outline-offset:5px}@media(max-width:650px){main{margin:20px 12px;padding:25px 20px}h1{font-size:29px}body{font-size:13px}nav{gap:12px}button{margin-left:0}}@media print{@page{margin:16mm}body{background:white;font-size:10pt}nav{display:none}main{border:0;margin:0;padding:0;max-width:none}h1{font-size:23pt}h2{font-size:16pt;break-after:avoid}h3{font-size:11pt;break-after:avoid}li{break-inside:avoid}a{color:inherit;text-decoration:none}header{padding-bottom:12px}p{orphans:3;widows:3}}
</style></head><body><nav aria-label="Resume actions"><a href="index.html">← Back to portfolio</a><a href="Resume.txt" download="Sri-Krishna-Teja-Kamma-Resume.txt">Download original resume</a><button type="button" onclick="window.print()">Print / Save as PDF</button></nav><main><header><h1>Sri Krishna Teja Kamma</h1><p class="subtitle">Technical Lead · Full-Stack Architect</p><p class="contact"><a href="mailto:srikrishnakamma@outlook.com">srikrishnakamma@outlook.com</a> · <a href="tel:+916304453258">+91 63044 53258</a><br><a href="https://linkedin.com/in/sikrishnateja" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">linkedin.com/in/sikrishnateja</a></p></header>${blocks.join('\n')}</main></body></html>`;
await writeFile(path.join(root, 'resume.html'), resume);
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'assets'), path.join(root, 'dist', 'assets'), { recursive: true });
for (const file of ['index.html', 'resume.html', 'Resume.txt']) await copyFile(path.join(root, file), path.join(root, 'dist', file));
console.log('Static site built in dist/. Complete resume generated from Resume.txt.');
