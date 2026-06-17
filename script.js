/* ===========================================================
   Czempion English: wspólny skrypt
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
   Formularz „Wyślij przewodnik"
   Teraz: pokazuje potwierdzenie (wersja poglądowa).
   Docelowo: zapis do Klaviyo (lista + automatyczny mail z przewodnikiem)
   ALBO POST do backendu Flask, który dalej woła Klaviyo.
   =========================================================== */
function handleLead(form) {
  const payload = {
    name: (form.querySelector('[name="name"]') || {}).value || "",
    email: (form.querySelector('[name="email"]') || {}).value || "",
  };

  /* TODO: Klaviyo (zapis do listy newslettera + automatyczny mail z przewodnikiem):
     fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${KLAVIYO_COMPANY_ID}`, {
       method: "POST",
       headers: { "Content-Type": "application/json", revision: "2024-10-15" },
       body: JSON.stringify({ ...payload })
     });

     LUB przez backend Flask:
     fetch(`${API_BASE}/api/lead`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(payload)
     }); */

  const card = form.closest("[data-lead]");
  if (card) {
    card.querySelector(".lead-form-wrap").style.display = "none";
    card.querySelector(".lead-success").style.display = "block";
  }
  return false;
}

/* ===========================================================
   Sklep: przyciski „Kup"
   Teraz: informacja, że płatności są w przygotowaniu.
   Docelowo: backend tworzy transakcję w Przelewy24 i zwraca link do płatności.
   =========================================================== */
function buyProduct(btn) {
  /* TODO: start płatności przez backend:
     const id = btn.dataset.productId;
     const r = await fetch(`${API_BASE}/api/checkout`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ productId: id })
     });
     const { redirectUrl } = await r.json();
     window.location = redirectUrl;   // przekierowanie do Przelewy24 */

  const body = btn.closest(".product-body");
  const note = body && body.querySelector(".coming-note");
  if (note) note.textContent = "Płatności online wkrótce. Napisz do nas, żeby kupić już teraz.";
}

/* ===========================================================
   Baza wiedzy / Sklep: ładowanie treści z backendu (na przyszłość)
   Teraz strony mają treść statyczną (placeholdery). Gdy backend ruszy,
   można odkomentować i wypełniać siatki danymi z panelu admina:

   async function loadKnowledge() {
     const r = await fetch(`${API_BASE}/api/knowledge`);
     const items = await r.json();
     // renderuj karty .kb-card do #kb-grid
   }
   async function loadProducts() {
     const r = await fetch(`${API_BASE}/api/products`);
     const items = await r.json();
     // renderuj karty .product-card do #shop-grid
   }
   =========================================================== */

/* ===========================================================
   DEMO (tymczasowe): treści dodane w panelu admina
   To, co właścicielka doda w admin.html, zapisuje się lokalnie
   (localStorage) i pojawia się tutaj na stronach Baza wiedzy / Sklep.
   Docelowo zastąpi to backend Flask: poniższe funkcje będą po prostu
   pobierać dane z API zamiast z localStorage.
   =========================================================== */
(function () {
  const KB_KEY = "cze_kb";
  const SHOP_KEY = "cze_shop";
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch (e) { return []; } };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const kbGrid = document.getElementById("kb-grid");
  if (kbGrid) {
    read(KB_KEY).slice().reverse().forEach((it) => {
      const card = document.createElement("article");
      card.className = "kb-card reveal revealed";
      const link = it.link
        ? '<a class="kb-link" href="' + esc(it.link) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg> Otwórz</a>'
        : "";
      card.innerHTML = '<span class="kb-tag">' + esc(it.tag || "Materiał") + "</span><h3>" + esc(it.title) + "</h3><p>" + esc(it.desc || "") + "</p>" + link;
      kbGrid.insertBefore(card, kbGrid.firstChild);
    });
  }

  const shopGrid = document.getElementById("shop-grid");
  if (shopGrid) {
    read(SHOP_KEY).slice().reverse().forEach((it) => {
      const card = document.createElement("article");
      card.className = "product-card reveal revealed";
      const media = it.img
        ? '<div class="product-media" style="background:#0c1220"><img src="' + esc(it.img) + '" alt="' + esc(it.title) + '" style="width:100%;height:100%;object-fit:cover"></div>'
        : '<div class="product-media"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5a2 2 0 012-2h11a1 1 0 011 1v15a1 1 0 01-1 1H6a2 2 0 01-2-2V5z"/><path d="M4 19a2 2 0 012-2h12"/></svg></div>';
      card.innerHTML = media + '<div class="product-body"><span class="product-tag">' + esc(it.tag || "Produkt") + "</span><h3>" + esc(it.title) + "</h3><p>" + esc(it.desc || "") + '</p><div class="product-foot"><span class="product-price">' + esc(it.price || "") + '</span><button class="cta-primary" onclick="buyProduct(this)">Kup</button></div><p class="coming-note"></p></div>';
      shopGrid.insertBefore(card, shopGrid.firstChild);
    });
  }
})();
