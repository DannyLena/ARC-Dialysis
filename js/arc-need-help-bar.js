/* =========================================================
   ARC Dialysis - Need Help Bar (Component JS)
   ---------------------------------------------------------
   Handles:
   - Location popup open/close (uses .active class)
   - Google Translate initialization (loads script only when needed)

   Expected IDs in HTML:
   - openLocationPopup  (button/link that opens popup)
   - locationPopup      (overlay)
   - closePopup         (X close button)

   Expected container for Google Translate:
   - google_translate_element
   ========================================================= */

(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initLocationPopup() {
    var openButton = document.getElementById('openLocationPopup');
    var closeButton = document.getElementById('closePopup');
    var popup = document.getElementById('locationPopup');

    // If the popup markup isn't present on this page, do nothing.
    if (!popup) return;

    function openPopup(e) {
      if (e) e.preventDefault();
      popup.classList.add('active');
      // Prevent background scroll while modal is open
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }

    function closePopup() {
      popup.classList.remove('active');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    if (openButton) {
      openButton.addEventListener('click', openPopup);
    }

    if (closeButton) {
      closeButton.addEventListener('click', function (e) {
        e.preventDefault();
        closePopup();
      });
    }

    // Click outside modal content closes
    popup.addEventListener('click', function (e) {
      if (e.target === popup) closePopup();
    });

    // ESC closes
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePopup();
    });
  }

  function initGoogleTranslate() {
    var el = document.getElementById('google_translate_element');
    if (!el) return;

    // If already initialized by another script, don't reload.
    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      try {
        // eslint-disable-next-line no-new
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
          'google_translate_element'
        );
      } catch (e) {
        // swallow - avoids breaking the page if Google blocks duplicate init
      }
      return;
    }

    // Define global callback for Google's script
    window.googleTranslateElementInit = function () {
      if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) return;
      try {
        // eslint-disable-next-line no-new
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
          'google_translate_element'
        );
      } catch (e) {
        // swallow
      }
    };

    // Avoid injecting the script more than once
    if (document.querySelector('script[data-arc-gt="1"]')) return;

    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    s.defer = true;
    s.setAttribute('data-arc-gt', '1');
    document.head.appendChild(s);
  }

  onReady(function () {
    initLocationPopup();
    initGoogleTranslate();
  });
})();
