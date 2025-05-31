const path = require('path');
const fs = require('fs');

let translations = {};
let currentLang = 'en';

function detectSystemLanguage() {
  const lang = Intl.DateTimeFormat().resolvedOptions().locale;
  return lang.split('-')[0]; // es. 'it-IT' => 'it'
}

function loadTranslations() {
  currentLang = detectSystemLanguage();

  const filePath = path.join(__dirname, 'locales', `${currentLang}.json`);
  if (fs.existsSync(filePath)) {
    translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    // fallback to English
    const fallbackPath = path.join(__dirname, 'locales', 'en.json');
    translations = fs.existsSync(fallbackPath)
      ? JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'))
      : {};
  }
}

function t(key) {
  return Object.prototype.hasOwnProperty.call(translations, key)
    ? translations[key]
    : null;
}

function tDom(document) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const labelKey = t(key);
    if (labelKey) {
      el.textContent = labelKey;
    }
  });
}

loadTranslations();

module.exports = {
  t,
  tDom,
  currentLang
};
