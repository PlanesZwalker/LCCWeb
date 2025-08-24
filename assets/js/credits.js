// credits.js - Automatically add credit for Kris VOID illustrations
(function () {
  function addStylesOnce() {
    if (document.getElementById('credits-style')) return;
    const style = document.createElement('style');
    style.id = 'credits-style';
    style.textContent = `
      .image-credit{font-size:12px;opacity:.8;color:rgba(230,237,247,.9);text-align:right;margin-top:6px}
      .image-credit a{color:inherit;text-decoration:underline dotted}
    `;
    document.head.appendChild(style);
  }

  function creditImage(img) {
    if (!img || img.dataset.credited) return;
    const src = img.getAttribute('src') || '';
    // Only images whose filename starts with "Cascade Letters"
    const name = src.split('/').pop() || '';
    if (!name.startsWith('Cascade Letters')) return;
    const credit = document.createElement('div');
    credit.className = 'image-credit';
    credit.textContent = 'Illustration « Cascade Letters » — Kris VOID';
    img.insertAdjacentElement('afterend', credit);
    img.dataset.credited = 'true';
  }

  function init() {
    addStylesOnce();
    document.querySelectorAll('img').forEach(creditImage);
    // Observe dynamic additions
    const obs = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes && m.addedNodes.forEach(n => {
          if (n && n.tagName === 'IMG') creditImage(n);
          else if (n && n.querySelectorAll) n.querySelectorAll('img').forEach(creditImage);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


