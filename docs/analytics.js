/* Cookieless Google Analytics for "מתי שבת בירוחם". */
(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-T0VDNZYFQP';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Keep analytics and advertising storage disabled. GA4 receives only
  // cookieless measurement pings, without personalized advertising signals.
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  script.setAttribute('data-sy-google-tag', '');
  document.head.appendChild(script);
})();
