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
function buyProduct(btn) {
  /* TODO: start płatności przez backend:
     const r = await fetch(`${API_BASE}/api/checkout`, { method:"POST", body: JSON.stringify({ productId: btn.dataset.productId }) });
     const { redirectUrl } = await r.json();
     window.location = redirectUrl; */
  const body = btn.closest(".product-body");
  const note = body && body.querySelector(".coming-note");
  if (note) note.textContent = "Płatności online wkrótce. Napisz do nas, żeby kupić już teraz.";
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
    kbGrid.innerHTML = items.length
      ? items.map((it) => {
          const link = it.link
            ? `<a class="kb-link" href="${esc(it.link)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg> Otwórz</a>`
            : "";
          return `<article class="kb-card reveal revealed"><span class="kb-tag">${esc(it.tag || "Materiał")}</span><h3>${esc(it.title)}</h3><p>${esc(it.desc || "")}</p>${link}</article>`;
        }).join("")
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
          return `<article class="product-card reveal revealed">${media}<div class="product-body"><span class="product-tag">${esc(it.tag || "Produkt")}</span><h3>${esc(it.title)}</h3><p>${esc(it.desc || "")}</p><div class="product-foot"><span class="product-price">${esc(it.price || "")}</span><button class="cta-primary" onclick="buyProduct(this)">Kup</button></div><p class="coming-note"></p></div></article>`;
        }).join("")
      : `<p class="kb-empty" style="grid-column:1/-1">Brak produktów. Wkrótce dodamy nowe.</p>`;
  }
})();
