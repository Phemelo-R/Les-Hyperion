// biostats-loader.mjs
// Fetches R/Biostatistics/manifest.json and renders page links inside #biostats-list

async function renderBiostats() {
  const container = document.getElementById('biostats-list');
  if (!container) return;
  try {
    const resp = await fetch('R/Biostatistics/manifest.json', { cache: "no-cache" });
    if (!resp.ok) {
      container.innerHTML = '<p class="note">No manifest found. Please add <code>R/Biostatistics/manifest.json</code> or provide the filenames.</p>';
      return;
    }
    const manifest = await resp.json();
    const pages = manifest.pages || [];
    if (!pages.length) {
      container.innerHTML = '<p class="note">Manifest is empty — no pages listed.</p>';
      return;
    }

    const list = document.createElement('div');
    list.className = 'biostats-grid';
    pages.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card biostats-item';
      const title = document.createElement('h3');
      const a = document.createElement('a');
      a.href = p.path;
      a.textContent = p.title || p.path;
      a.target = '_self';
      title.appendChild(a);
      card.appendChild(title);

      if (p.description) {
        const desc = document.createElement('p');
        desc.textContent = p.description;
        desc.className = 'note';
        card.appendChild(desc);
      }

      // optional thumbnail (if provided)
      if (p.thumbnail) {
        const img = document.createElement('img');
        img.src = p.thumbnail;
        img.alt = p.title || '';
        img.style.maxWidth = '100%';
        img.style.marginBottom = '0.5rem';
        card.insertBefore(img, card.firstChild);
      }

      list.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(list);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="note">Failed to load manifest — check console for details.</p>';
  }
}

document.addEventListener('DOMContentLoaded', renderBiostats);
export { renderBiostats };
