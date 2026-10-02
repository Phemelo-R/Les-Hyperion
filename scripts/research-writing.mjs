import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { htmlText } from './html-text.mjs';

// Preserve the source files and render every markdown cell and embedded figure.
export function renderWriting({ root, writing, marked, escape }) {
  const original = JSON.parse(
    fs.readFileSync(
      path.join(root, 'content/research', writing.source),
      'utf8',
    ),
  );
  const media = path.join(root, 'assets/research');
  fs.mkdirSync(media, { recursive: true });
  const headings = [];
  let firstHeading = true;
  const html = original.cells
    .map((cell) => {
      if (cell.cell_type !== 'markdown') {
        throw new Error(`Expected written research only: ${writing.source}`);
      }
      let source = Array.isArray(cell.source)
        ? cell.source.join('')
        : cell.source;
      for (const [name, attachment] of Object.entries(cell.attachments || {})) {
        const mime = Object.keys(attachment).find((type) =>
          /^image\/(png|jpeg|webp)$/.test(type),
        );
        if (!mime) throw new Error(`Unsupported research figure: ${name}`);
        const data = attachment[mime];
        const bytes = Buffer.from(
          Array.isArray(data) ? data.join('') : data,
          'base64',
        );
        const filename =
          crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 20) +
          '.' +
          mime.split('/')[1];
        fs.writeFileSync(path.join(media, filename), bytes);
        source = source
          .split('attachment:' + name)
          .join('assets/research/' + filename);
      }
      const equations = [];
      source = source.replace(
        /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$(?!\s)([^$\n]+?)\$/g,
        (equation) => {
          equations.push(equation);
          return 'LHMATHPLACEHOLDER' + (equations.length - 1) + 'END';
        },
      );
      let output = marked
        .parse(source, { gfm: true })
        .replace(/LHMATHPLACEHOLDER(\d+)END/g, (_, index) =>
          escape(equations[Number(index)]),
        );
      // The page heading supplies a readable title
      output = output.replace(
        /<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/g,
        (_, level, text) => {
          if (firstHeading && level === '1') {
            firstHeading = false;
            return '';
          }
          const id = 'article-section-' + headings.length;
          const label = htmlText(text);
          headings.push({ id, label });
          return `<h${level} id="${id}">${text}</h${level}>`;
        },
      );
      // Original figure captions are displayed below the figures, as well as in alt text.
      output = output.replace(
        /<p>\s*(<img[^>]*alt="([^"]*)"[^>]*>)\s*<\/p>/g,
        (_, img, caption) =>
          `<figure class="research-figure">${img.replace('<img ', '<img loading="lazy" ')}<figcaption>${caption}</figcaption></figure>`,
      );
      return `<section class="markdown-cell">${output}</section>`;
    })
    .join('\n');
  return { html, headings };
}
