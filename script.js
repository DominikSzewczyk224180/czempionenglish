/* ===========================================================
   Czempion English - wspólny skrypt
   =========================================================== */

/* --- KONFIGURACJA: tu w przyszłości podłączysz backend / Klaviyo ---
   Backend Flask (Python App na seohost, konto Justyny) wystawiony pod osobną subdomeną. */
const API_BASE = "https://api.czempionenglish.pl";
/* Po założeniu konta Klaviyo wstaw publiczny identyfikator firmy: */
// const KLAVIYO_COMPANY_ID = "XXXXXX";

(function () {
  /* Nawigacja: tło po przewinięciu */
  const nav = document.getElementById("nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Menu mobilne (burger) */
  const burger = document.getElementById("burger");
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-menu-open");
      burger.setAttribute("aria-expanded", open);
    });
    document.querySelectorAll(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => document.body.classList.remove("nav-menu-open"))
    );
  }

  /* Pojawianie się elementów przy przewijaniu */
  const reveals = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    reveals.forEach((el) => el.classList.add("revealed"));
  } else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }
})();

/* ===========================================================
   Formularz „Wyślij przewodnik" + newsletter
   Teraz: pokazuje potwierdzenie (wersja poglądowa).
   Docelowo: zapis do Klaviyo (lista newslettera + automatyczny mail z przewodnikiem)
   ALBO POST do backendu Flask, który dalej woła Klaviyo.
   =========================================================== */
function handleLead(form) {
  const payload = {
    name: (form.querySelector('[name="name"]') || {}).value || "",
    email: (form.querySelector('[name="email"]') || {}).value || "",
  };

  /* TODO: Klaviyo (zapis do listy newslettera + automatyczny mail z przewodnikiem):
     fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${KLAVIYO_COMPANY_ID}`, {...});
     LUB przez backend Flask:
     fetch(`${API_BASE}/api/lead`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) }); */

  const card = form.closest("[data-lead]");
  if (card) {
    card.querySelector(".lead-form-wrap").style.display = "none";
    card.querySelector(".lead-success").style.display = "block";
  }
  return false;
}

/* ===========================================================
   Sklep - przyciski „Kup"
   Teraz: informacja, że płatności są w przygotowaniu.
   Docelowo: backend tworzy transakcję w Przelewy24 i zwraca link do płatności.
   =========================================================== */
function escHtml(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* Sklep - ekran zamówienia (checkout).
   Teraz: pokazuje cały przepływ płatności (wersja demonstracyjna).
   Docelowo: backend rejestruje transakcję w Przelewy24 i przekierowuje na bramkę. */
function buyProduct(btn) {
  const card = btn.closest(".product-card");
  const name = card && card.querySelector("h3") ? card.querySelector("h3").textContent : "Produkt";
  const price = card && card.querySelector(".product-price") ? card.querySelector(".product-price").textContent : "";
  openCheckout(name, price);
}
function openCheckout(name, price) {
  closeCheckout();
  const ov = document.createElement("div");
  ov.className = "checkout-overlay";
  ov.id = "checkoutOverlay";
  ov.innerHTML = `
    <div class="checkout-card" role="dialog" aria-modal="true" aria-label="Zamówienie">
      <button class="checkout-close" aria-label="Zamknij" onclick="closeCheckout()">&times;</button>
      <div class="checkout-eyebrow">Zamówienie</div>
      <h3 class="checkout-name">${escHtml(name)}</h3>
      <div class="checkout-row"><span>Do zapłaty</span><strong>${escHtml(price)}</strong></div>
      <label class="checkout-label" for="coEmail">E-mail (tu wyślemy materiał po opłaceniu)</label>
      <input id="coEmail" class="checkout-input" type="email" placeholder="twoj@email.pl" autocomplete="email">
      <button class="cta-primary full checkout-pay" onclick="payP24()">Zapłać przez Przelewy24</button>
      <div class="checkout-trust"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg> Bezpieczna płatność: BLIK, karta, szybki przelew</div>
      <div class="checkout-note" id="checkoutNote"></div>
    </div>`;
  document.body.appendChild(ov);
  document.body.classList.add("modal-open");
  ov.addEventListener("click", (e) => { if (e.target === ov) closeCheckout(); });
  document.addEventListener("keydown", escClose);
  const em = document.getElementById("coEmail"); if (em) em.focus();
}
function escClose(e) { if (e.key === "Escape") closeCheckout(); }
function closeCheckout() {
  const ov = document.getElementById("checkoutOverlay");
  if (ov) ov.remove();
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", escClose);
}
function payP24() {
  /* DOCELOWO (z backendem):
     const email = document.getElementById("coEmail").value;
     const r = await fetch(`${API_BASE}/api/checkout`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ product: ..., email }) });
     const { redirectUrl } = await r.json();   // backend rejestruje transakcję w P24 i zwraca token
     window.location = redirectUrl;            // przekierowanie na https://secure.przelewy24.pl/trnRequest/{token} */
  const note = document.getElementById("checkoutNote");
  if (note) {
    note.classList.add("show");
    note.textContent = "To wersja demonstracyjna. Po podłączeniu backendu ten przycisk przeniesie Cię prosto do Przelewy24 (BLIK, karta, przelew), a po zaksięgowaniu wpłaty materiał automatycznie trafi na Twój e-mail.";
  }
}

/* ===========================================================
   Treści Baza wiedzy / Sklep
   Startowo wgrywane są poniższe pozycje (te same, które były na stronie).
   Właścicielka zarządza nimi w panelu (admin.html), a tu pojawiają się na żywo.
   To rozwiązanie tymczasowe (localStorage). Docelowo dane przyjdą z backendu Flask.
   =========================================================== */
(function () {
  const KB_KEY = "cze_kb";
  const SHOP_KEY = "cze_shop";
  const SEED_FLAG = "cze_seeded";

  const KB_DEFAULTS = [
    { tag: "PDF", title: "5 powodów, dlaczego Twój angielski stoi w miejscu", desc: "Krótki przewodnik, który pokazuje, co naprawdę blokuje Twoje postępy i jak to odblokować.", link: "" },
    { tag: "Wideo", title: "Czasy w angielskim bez wkuwania", desc: "Mini-lekcja, w której tłumaczymy logikę czasów. Raz zrozumiesz, na zawsze zapamiętasz.", link: "" },
    { tag: "Ćwiczenia", title: "50 zdań na spotkanie po angielsku", desc: "Zestaw gotowych zwrotów do wydrukowania. Idealny przed ważnym callem albo prezentacją.", link: "" },
    { tag: "Audio", title: "Wymowa: dźwięki, których nie ma w polskim", desc: "Nagranie z ćwiczeniami wymowy. Posłuchaj i powtarzaj, aż zabrzmi naturalnie.", link: "" },
    { tag: "PDF", title: "Phrasal verbs, których używasz w pracy", desc: "Lista najważniejszych czasowników frazowych z przykładami z prawdziwego życia, nie z podręcznika.", link: "" },
    { tag: "Wideo", title: "Jak myśleć po angielsku, zamiast tłumaczyć", desc: "Pokazujemy konkretny nawyk, który sprawia, że przestajesz układać zdania w głowie po polsku.", link: "" }
  ];
  const SHOP_DEFAULTS = [
    { tag: "E-book", title: "Gramatyka, która ma sens", desc: "Cały system angielskiej gramatyki wytłumaczony przez logikę, nie przez tabelki. PDF, 80 stron.", price: "49 zł", img: "" },
    { tag: "Kurs wideo", title: "Mów płynnie: 10 lekcji wideo", desc: "Dziesięć nagrań, które krok po kroku przeprowadzą Cię od blokady do swobodnej rozmowy.", price: "199 zł", img: "" },
    { tag: "Pakiet", title: "E-book + kurs wideo", desc: "Wszystko razem, taniej. Najlepszy start, jeśli chcesz ogarnąć temat kompleksowo.", price: "219 zł", img: "" }
  ];

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* jednorazowe wgranie startowych treści (potem zarządzane w panelu) */
  try {
    if (!localStorage.getItem(SEED_FLAG)) {
      if (localStorage.getItem(KB_KEY) === null) localStorage.setItem(KB_KEY, JSON.stringify(KB_DEFAULTS));
      if (localStorage.getItem(SHOP_KEY) === null) localStorage.setItem(SHOP_KEY, JSON.stringify(SHOP_DEFAULTS));
      localStorage.setItem(SEED_FLAG, "1");
    }
  } catch (e) {}

  const read = (k, def) => { try { const r = localStorage.getItem(k); return r === null ? def : JSON.parse(r); } catch (e) { return def; } };

  const kbGrid = document.getElementById("kb-grid");
  if (kbGrid) {
    const items = read(KB_KEY, KB_DEFAULTS);
    const linkKind = (u) => {
      u = (u || "").toLowerCase();
      if (/youtube\.com|youtu\.be|vimeo\.com|wistia/.test(u)) return "video";
      if (/spotify\.com|soundcloud\.com|music\.apple|anchor\.fm|podbean/.test(u)) return "audio";
      return "open";
    };
    const ICON = {
      download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>',
      video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none"/></svg>',
      audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14v-1a8 8 0 0116 0v1"/><rect x="3.5" y="14" width="4" height="6" rx="1.6"/><rect x="16.5" y="14" width="4" height="6" rx="1.6"/></svg>',
      open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 5h5v5M19 5l-8 8M11 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4"/></svg>'
    };
    const action = (it) => {
      if (it.file) {
        const label = it.tag === "PDF" ? "Pobierz PDF" : "Pobierz plik";
        return `<a class="kb-link" href="${esc(it.file)}" download="${esc(it.fileName || "material")}">${ICON.download} ${label}</a>`;
      }
      if (it.link) {
        const k = linkKind(it.link);
        const label = k === "video" ? "Obejrzyj wideo" : k === "audio" ? "Posłuchaj" : "Otwórz materiał";
        return `<a class="kb-link" href="${esc(it.link)}" target="_blank" rel="noopener">${ICON[k]} ${label}</a>`;
      }
      return `<span class="kb-soon">Dostępne wkrótce</span>`;
    };
    kbGrid.innerHTML = items.length
      ? items.map((it) =>
          `<article class="kb-card reveal revealed"><span class="kb-tag">${esc(it.tag || "Materiał")}</span><h3>${esc(it.title)}</h3><p>${esc(it.desc || "")}</p>${action(it)}</article>`
        ).join("")
      : `<p class="kb-empty" style="grid-column:1/-1">Brak materiałów. Wkrótce dodamy nowe.</p>`;
  }

  const shopGrid = document.getElementById("shop-grid");
  if (shopGrid) {
    const items = read(SHOP_KEY, SHOP_DEFAULTS);
    shopGrid.innerHTML = items.length
      ? items.map((it) => {
          const media = it.img
            ? `<div class="product-media" style="background:#0c1220"><img src="${esc(it.img)}" alt="${esc(it.title)}" style="width:100%;height:100%;object-fit:cover"></div>`
            : `<div class="product-media"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5a2 2 0 012-2h11a1 1 0 011 1v15a1 1 0 01-1 1H6a2 2 0 01-2-2V5z"/><path d="M4 19a2 2 0 012-2h12"/></svg></div>`;
          return `<article class="product-card reveal revealed">${media}<div class="product-body"><span class="product-tag">${esc(it.tag || "Produkt")}</span><h3>${esc(it.title)}</h3><p>${esc(it.desc || "")}</p><div class="product-foot"><span class="product-price">${esc(it.price || "")}</span><button class="cta-primary" onclick="buyProduct(this)">Kup</button></div></div></article>`;
        }).join("")
      : `<p class="kb-empty" style="grid-column:1/-1">Brak produktów. Wkrótce dodamy nowe.</p>`;
  }
})();

/* ===========================================================
   Hero - rotująca karta z hasłami (baza wiedzy / sklep / opinie / podcast)
   Klik przenosi do odpowiedniej sekcji/strony.
   =========================================================== */
(function () {
  const rotator = document.getElementById("heroRotator");
  if (!rotator) return;
  const elMain = document.getElementById("rotMain");
  const elSub = document.getElementById("rotSub");
  const items = [
    { main: "Ucz się za darmo", sub: "baza wiedzy: PDF-y, wideo, audio", href: "baza-wiedzy.html" },
    { main: "Gotowe e-booki i kursy", sub: "w sklepie, już od 49 zł", href: "sklep.html" },
    { main: "Zobacz, kto już mówi", sub: "prawdziwe opinie uczniów", href: "#social" },
    { main: "Angielski na rozum", sub: "posłuchaj naszego podcastu", href: "#podcast" }
  ];
  let i = 0;
  function apply(idx) {
    elMain.textContent = items[idx].main;
    elSub.textContent = items[idx].sub;
    rotator.setAttribute("href", items[idx].href);
  }
  apply(0);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(() => {
    rotator.classList.add("rot-swap");
    setTimeout(() => {
      i = (i + 1) % items.length;
      apply(i);
      rotator.classList.remove("rot-swap");
    }, 300);
  }, 3200);
})();
