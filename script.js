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

  /* TODO: Klaviyo (zapis subskrybenta do listy „Przewodnik"):
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
