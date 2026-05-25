/* Fix #3: remove sticky header shadow line across pages */
(function(){
  var knownSelectors = [
    '#header',
    '.header-nav',
    '.header-nav-wrapper',
    '.navbar-scrolltofixed',
    '.scroll-to-fixed-fixed',
    '.scroll-to-fixed-placeholder',
    '.inner-sticky-wrapper'
  ].join(',');

  function clearShadows(el) {
    el.style.setProperty('box-shadow', 'none', 'important');
    el.style.setProperty('filter', 'none', 'important');
    el.style.setProperty('border', '0', 'important');
    el.style.setProperty('border-bottom', '0', 'important');
    el.style.setProperty('background', 'transparent', 'important');
    el.style.setProperty('background-image', 'none', 'important');
    el.style.setProperty('outline', 'none', 'important');
  }

  function nukeKnown() {
    var nodes = document.querySelectorAll(knownSelectors);
    for (var i = 0; i < nodes.length; i++) {
      clearShadows(nodes[i]);
    }
  }

  function nukeFixedBars() {
    var vw = window.innerWidth || document.documentElement.clientWidth || 0;
    var nodes = document.querySelectorAll('body *');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el || el.nodeType !== 1) continue;
      var cs;
      try { cs = window.getComputedStyle(el); } catch (e) { continue; }
      if (!cs) continue;

      var pos = cs.position;
      var isFixed = (pos === 'fixed' || pos === 'sticky');
      var isKnown = false;
      if (!isFixed) {
        try { isKnown = el.matches(knownSelectors); } catch (e) { isKnown = false; }
      }
      if (!isFixed && !isKnown) continue;

      var r = el.getBoundingClientRect();
      if (r.width < vw * 0.8) continue;
      if (r.height > 240) continue;

      if ((cs.boxShadow && cs.boxShadow !== 'none') ||
          (cs.filter && cs.filter !== 'none') ||
          (cs.borderBottomWidth && cs.borderBottomWidth !== '0px')) {
        clearShadows(el);
      }
    }
  }

  function run() {
    nukeKnown();
    nukeFixedBars();
  }

  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', run);
  window.addEventListener('scroll', run, {passive:true});
  window.addEventListener('resize', run);

  if (window.MutationObserver) {
    var mo = new MutationObserver(run);
    mo.observe(document.documentElement, {attributes:true, childList:true, subtree:true});
  }
})();
