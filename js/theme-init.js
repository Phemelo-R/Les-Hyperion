try {
  const saved = localStorage.getItem('lh-theme');
  document.documentElement.dataset.theme = ['dark', 'light'].includes(saved)
    ? saved
    : matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
} catch {
  document.documentElement.dataset.theme = 'light';
}
