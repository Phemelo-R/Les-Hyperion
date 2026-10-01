window.MathJax = {
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
  },
  chtml: {
    fontURL: new URL(
      '../assets/vendor/mathjax/output/chtml/fonts/woff-v2',
      document.currentScript.src,
    ).href,
  },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] },
};
