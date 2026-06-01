// ModaUI AI customer widget stub
// This placeholder prevents 404 errors while the AI customer widget asset is not installed.
(function () {
  if (typeof window === 'undefined') {
    return;
  }

  window.ModauiAiWidget = window.ModauiAiWidget || {
    initialized: true,
    init: function () {
      if (window.console && window.console.debug) {
        window.console.debug('ModaUI AI widget stub loaded.');
      }
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.ModauiAiWidget.init();
    });
  } else {
    window.ModauiAiWidget.init();
  }
})();
