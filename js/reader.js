'use strict';
document.querySelectorAll('.copy-code').forEach((button) =>
  button.addEventListener('click', async () => {
    const text = button.closest('.code-cell').querySelector('code').textContent;
    try {
      if (navigator.clipboard && isSecureContext)
        await navigator.clipboard.writeText(text);
      else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        textarea.remove();
        if (!success) throw new Error('Copy unavailable');
      }
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = 'Copy code';
      }, 1600);
    } catch {
      showNotice('Select the code and copy it using your browser.');
    }
  }),
);
const outputToggle = document.getElementById('toggle-outputs');
outputToggle?.addEventListener('click', () => {
  const collapsed = outputToggle.getAttribute('aria-pressed') !== 'true';
  document.querySelectorAll('.cell-output').forEach((output) => {
    output.open = !collapsed;
  });
  outputToggle.textContent = collapsed ? 'Expand outputs' : 'Collapse outputs';
  outputToggle.setAttribute('aria-pressed', String(collapsed));
});
const contents = document.querySelector('.reader-contents');
if (contents && matchMedia('(max-width:700px)').matches) contents.open = false;
const tocLinks = Array.from(document.querySelectorAll('.reader-contents a'));
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting)
        tocLinks.forEach((link) =>
          link.classList.toggle('active', link.hash === '#' + entry.target.id),
        );
    }),
  { rootMargin: '-110px 0px -65% 0px' },
);
document
  .querySelectorAll('.markdown-cell h1[id],.markdown-cell h2[id]')
  .forEach((heading) => observer.observe(heading));
let outputStates = [];
addEventListener('beforeprint', () => {
  outputStates = Array.from(document.querySelectorAll('.cell-output')).map(
    (output) => output.open,
  );
  document.querySelectorAll('.cell-output').forEach((output) => {
    output.open = true;
  });
});
addEventListener('afterprint', () =>
  document.querySelectorAll('.cell-output').forEach((output, index) => {
    output.open = outputStates[index];
  }),
);
