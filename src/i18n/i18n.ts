import { translations, type Lang } from "./translations";

const DEFAULT_LANG: Lang = "el";
const STORAGE_KEY = "stoa60-lang";

export function getLang(): Lang {
  if (typeof localStorage === "undefined") return DEFAULT_LANG;
  return (localStorage.getItem(STORAGE_KEY) as Lang) || DEFAULT_LANG;
}

export function setLang(lang: Lang): void {
  localStorage.setItem(STORAGE_KEY, lang);
  applyTranslations(lang);
  updateToggle(lang);
}

export function toggleLang(): void {
  const current = getLang();
  setLang(current === "el" ? "en" : "el");
}

export function applyTranslations(lang: Lang): void {
  // Swap textContent for elements with data-i18n
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n")!;
    const t = translations[key];
    if (t?.[lang]) el.textContent = t[lang];
  });

  // Swap placeholder for inputs with data-i18n-placeholder
  document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder")!;
    const t = translations[key];
    if (t?.[lang]) el.placeholder = t[lang];
  });

  // Swap alt text for images with data-i18n-alt
  document.querySelectorAll<HTMLImageElement>("[data-i18n-alt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-alt")!;
    const t = translations[key];
    if (t?.[lang]) el.alt = t[lang];
  });

  // Update html lang attribute
  document.documentElement.lang = lang;
}

function updateToggle(lang: Lang): void {
  document.querySelectorAll<HTMLElement>(".lang-toggle-el").forEach((el) => {
    el.classList.toggle("opacity-100", lang === "el");
    el.classList.toggle("opacity-40", lang !== "el");
  });
  document.querySelectorAll<HTMLElement>(".lang-toggle-en").forEach((el) => {
    el.classList.toggle("opacity-100", lang === "en");
    el.classList.toggle("opacity-40", lang !== "en");
  });
}
