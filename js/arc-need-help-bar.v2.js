/* =========================================================
   ARC Dialysis - Need Help Bar (Component JS) [UPDATED]
   ---------------------------------------------------------
   Handles:
   - Location popup open/close (uses .active class)
   - Google Translate initialization (loads script only when needed)
   - Restricts Google Translate dropdown to:
     English, French, Haitian Creole, Portuguese, Spanish

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

    var focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Toggle keyboard reachability of all focusable elements inside the popup.
    // When popup is hidden, tabindex="-1" removes them from the Tab sequence.
    function setPopupFocusable(isOpen) {
      var els = popup.querySelectorAll(focusableSelector);
      els.forEach(function (el) {
        if (isOpen) {
          var prev = el.getAttribute('data-prev-tabindex');
          if (prev !== null) {
            el.setAttribute('tabindex', prev);
            el.removeAttribute('data-prev-tabindex');
          } else {
            el.removeAttribute('tabindex');
          }
        } else {
          var current = el.getAttribute('tabindex');
          if (current !== null && current !== '-1') {
            el.setAttribute('data-prev-tabindex', current);
          }
          el.setAttribute('tabindex', '-1');
        }
      });
    }

    // Initialise: popup starts closed, remove from tab order immediately.
    setPopupFocusable(false);

    function openPopup(e) {
      if (e) e.preventDefault();
      popup.classList.add('active');
      popup.setAttribute('aria-hidden', 'false');
      if (openButton) openButton.setAttribute('aria-expanded', 'true');
      setPopupFocusable(true);
      // Prevent background scroll while modal is open
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      // Move focus to close button for keyboard/screen-reader users
      if (closeButton) {
        setTimeout(function () { closeButton.focus(); }, 50);
      }
    }

    function closePopup() {
      popup.classList.remove('active');
      popup.setAttribute('aria-hidden', 'true');
      if (openButton) openButton.setAttribute('aria-expanded', 'false');
      setPopupFocusable(false);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      // Return focus to the button that opened the popup
      if (openButton) openButton.focus();
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

    // ESC closes — only when popup is actually open
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && popup.classList.contains('active')) closePopup();
    });
  }

  function initGoogleTranslate() {
    var el = document.getElementById('google_translate_element');
    if (!el) return;

    // Restrict dropdown list to ONLY these languages:
    // en (English), fr (French), ht (Haitian Creole), pt (Portuguese), es (Spanish)
    var included = 'en,fr,ht,pt,es';

    // If Google Translate is already loaded, just initialize the widget.
    if (window.google && window.google.translate && window.google.translate.TranslateElement) {
      try {
        // eslint-disable-next-line no-new
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: included,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
      } catch (e) {
        // swallow
      }
      return;
    }

    // Global callback for Google's script
    window.googleTranslateElementInit = function () {
      if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) return;
      try {
        // eslint-disable-next-line no-new
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: included,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
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
