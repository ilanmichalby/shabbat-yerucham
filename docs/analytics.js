/* Google Analytics 4 for "מתי שבת בירוחם". */
(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-T0VDNZYFQP';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    'anonymize_ip': true,
    'allow_google_signals': false,
    'allow_ad_personalization_signals': false,
  });

  // Send a page_view event
  window.gtag('event', 'page_view', {
    'page_path': window.location.pathname,
    'page_title': document.title
  });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  script.onload = function() {
    console.log('[GA4] Google Tag Manager script loaded successfully');
  };
  script.onerror = function() {
    console.error('[GA4] Failed to load Google Tag Manager script');
  };
  document.head.appendChild(script);

  console.log('[GA4] Analytics initialized with Measurement ID:', MEASUREMENT_ID);
})();
