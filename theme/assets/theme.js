/* Tema – JavaScript vanilla, nessuna dipendenza */
(function () {
  'use strict';

  const fetchJSON = (url, options = {}) =>
    fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers || {}) }
    }).then((r) => r.json().then((data) => (r.ok ? data : Promise.reject(data))));

  /* ---------- Barra annunci a rotazione ---------- */
  document.querySelectorAll('.announcement-bar__track').forEach((track) => {
    const items = track.querySelectorAll('.announcement-bar__item');
    if (items.length < 2) return;
    let i = 0;
    setInterval(() => {
      items[i].classList.remove('is-active');
      i = (i + 1) % items.length;
      items[i].classList.add('is-active');
    }, 4000);
  });

  /* ---------- Menu mobile ---------- */
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) menuToggle.click();
    });
  }

  /* ---------- Carrello laterale ---------- */
  const drawer = document.querySelector('[data-cart-drawer]');
  const drawerBody = document.querySelector('[data-cart-drawer-body]');

  const openDrawer = () => {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const updateCount = (count) => {
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.classList.toggle('is-hidden', count === 0);
    });
  };

  // Ricarica il contenuto del carrello tramite Section Rendering API
  const refreshDrawer = () =>
    fetch(`${window.routes.root_url.replace(/\/$/, '')}/?section_id=cart-drawer-content`)
      .then((r) => r.text())
      .then((html) => {
        if (!drawerBody) return;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const section = doc.querySelector('.shopify-section');
        drawerBody.innerHTML = section ? section.innerHTML : html;
      })
      .then(() => fetchJSON(`${window.routes.cart_url}.js`))
      .then((cart) => updateCount(cart.item_count));

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cart-open]') && drawer) {
      e.preventDefault();
      openDrawer();
    }
    if (e.target.closest('[data-cart-close]')) closeDrawer();

    const qtyBtn = e.target.closest('[data-qty-change]');
    if (qtyBtn && drawerBody && drawerBody.contains(qtyBtn)) {
      drawerBody.classList.add('is-loading');
      fetchJSON(`${window.routes.cart_change_url}.js`, {
        method: 'POST',
        body: JSON.stringify({ line: Number(qtyBtn.dataset.line), quantity: Number(qtyBtn.dataset.qtyChange) })
      })
        .then(refreshDrawer)
        .finally(() => drawerBody.classList.remove('is-loading'));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ---------- Form prodotto: aggiunta al carrello AJAX ---------- */
  document.querySelectorAll('[data-product-form]').forEach((form) => {
    const errorEl = form.querySelector('[data-form-error]');
    form.addEventListener('submit', (e) => {
      if (!drawer) return; // carrello in modalità pagina: invio normale
      e.preventDefault();
      const buttons = document.querySelectorAll(`[data-add-to-cart]`);
      const labels = [...buttons].map((b) => b.textContent);
      buttons.forEach((b) => { b.disabled = true; b.textContent = window.themeStrings.adding; });
      errorEl && errorEl.classList.add('is-hidden');

      fetch(`${window.routes.cart_add_url}.js`, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then((r) => r.json().then((data) => (r.ok ? data : Promise.reject(data))))
        .then(refreshDrawer)
        .then(openDrawer)
        .catch((err) => {
          if (errorEl) {
            errorEl.textContent = err.description || err.message || 'Errore';
            errorEl.classList.remove('is-hidden');
          }
        })
        .finally(() => buttons.forEach((b, i) => { b.disabled = false; b.textContent = labels[i]; }));
    });
  });

  /* ---------- Quantità +/- ---------- */
  document.addEventListener('click', (e) => {
    const step = e.target.closest('[data-qty-step]');
    if (!step) return;
    const input = step.parentElement.querySelector('input[type="number"]');
    const value = Math.max(Number(input.min) || 1, (Number(input.value) || 1) + Number(step.dataset.qtyStep));
    input.value = value;
  });

  /* ---------- Galleria prodotto ---------- */
  const showMedia = (gallery, id) => {
    gallery.querySelectorAll('[data-media-id]').forEach((s) => s.classList.toggle('is-active', s.dataset.mediaId === String(id)));
    gallery.querySelectorAll('[data-thumb]').forEach((t) => t.classList.toggle('is-active', t.dataset.thumb === String(id)));
  };
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const active = gallery.querySelector('[data-media-id].is-active');
    if (active) showMedia(gallery, active.dataset.mediaId);
    gallery.addEventListener('click', (e) => {
      const thumb = e.target.closest('[data-thumb]');
      if (thumb) showMedia(gallery, thumb.dataset.thumb);
    });
    // swipe su mobile
    let startX = null;
    const main = gallery.querySelector('.product-gallery__main');
    main.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) < 40) return;
      const slides = [...gallery.querySelectorAll('[data-media-id]')];
      const idx = slides.findIndex((s) => s.classList.contains('is-active'));
      const next = slides[(idx + (dx < 0 ? 1 : -1) + slides.length) % slides.length];
      if (next) showMedia(gallery, next.dataset.mediaId);
    });
  });

  /* ---------- Selettore varianti ---------- */
  document.querySelectorAll('[data-variant-picker]').forEach((picker) => {
    const section = picker.closest('[data-section]');
    const variants = JSON.parse(picker.querySelector('[data-variants]').textContent);
    const idInput = section.querySelector('[data-variant-id]');
    const gallery = section.querySelector('[data-gallery]');

    const selectedOptions = () =>
      [...picker.querySelectorAll('fieldset')].map((fs) => (fs.querySelector('input:checked') || {}).value);

    const markAvailability = (current) => {
      picker.querySelectorAll('fieldset').forEach((fs, optIdx) => {
        fs.querySelectorAll('input').forEach((input) => {
          const candidate = [...current];
          candidate[optIdx] = input.value;
          const match = variants.find((v) => v.options.every((o, i) => o === candidate[i]));
          input.classList.toggle('is-unavailable', !match || !match.available);
        });
      });
    };

    const update = () => {
      const options = selectedOptions();
      const variant = variants.find((v) => v.options.every((o, i) => o === options[i]));
      options.forEach((val, i) => {
        const label = picker.querySelector(`[data-option-label="${i}"]`);
        if (label) label.textContent = val;
      });
      markAvailability(options);

      const buttons = section.querySelectorAll('[data-add-to-cart]');
      if (!variant) {
        buttons.forEach((b) => { b.disabled = true; b.textContent = window.themeStrings.unavailable; });
        return;
      }
      idInput.value = variant.id;
      buttons.forEach((b) => {
        b.disabled = !variant.available;
        b.textContent = variant.available ? window.themeStrings.addToCart : window.themeStrings.soldOut;
      });
      if (variant.featured_media && gallery) showMedia(gallery, variant.featured_media.id);

      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());

      // Aggiorna prezzo ri-renderizzando la sezione per la nuova variante
      fetch(`${window.location.pathname}?variant=${variant.id}&section_id=${section.dataset.section}`)
        .then((r) => r.text())
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const newPrice = doc.querySelector('[data-price-wrapper]');
          const oldPrice = section.querySelector('[data-price-wrapper]');
          if (newPrice && oldPrice) oldPrice.innerHTML = newPrice.innerHTML;
          const newSticky = doc.querySelector('[data-sticky-price]');
          const oldSticky = section.querySelector('[data-sticky-price]');
          if (newSticky && oldSticky) oldSticky.innerHTML = newSticky.innerHTML;
        });
    };

    picker.addEventListener('change', update);
    markAvailability(selectedOptions());
  });

  /* ---------- Barra acquisto fissa ---------- */
  document.querySelectorAll('[data-sticky-atc]').forEach((bar) => {
    const target = bar.closest('[data-section]').querySelector('.product-info__buy');
    if (!target || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', String(!show));
    }).observe(target);
  });

  /* ---------- Login: mostra recupero password ---------- */
  document.querySelectorAll('[data-recover-toggle]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('[data-recover]').classList.toggle('is-hidden');
      document.querySelector('[data-login]').classList.toggle('is-hidden');
    });
  });
  if (window.location.hash === '#recover') {
    const r = document.querySelector('[data-recover]');
    if (r) { r.classList.remove('is-hidden'); document.querySelector('[data-login]').classList.add('is-hidden'); }
  }
})();
