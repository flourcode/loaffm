/* Loaf FM · analytics (switched OFF until you add an ID)
 *
 * Every page loads this file, so this is the only place to change. To turn on Google Analytics 4:
 *   1. Create a GA4 property and web data stream, and copy its Measurement ID (it looks like G-XXXXXXXXXX).
 *   2. Paste it between the quotes below.
 *   3. Update privacy.html first (README.md, "Turning on analytics", has the wording), then deploy.
 * While the ID is empty, this file does nothing at all: no requests, no cookies.
 *
 * What it does once switched on:
 *   - Loads Google's gtag.js and counts page views. Pages swapped in without a reload are counted by GA4's enhanced
 *     measurement (leave "page changes based on browser history events" switched on in the data stream settings).
 *   - Uses Google Consent Mode: advertising storage is always denied, and in the EEA, the UK and Switzerland
 *     analytics storage is denied too (Google then sends cookieless pings), because there's no consent banner.
 *     If you later add a certified consent banner (needed anyway for AdSense in those regions), let it update consent.
 *   - IP addresses aren't stored by GA4; Google Signals and ad personalisation stay off.
 */
(function () {
  var GA_MEASUREMENT_ID = 'G-0Y62CW4XDM'; // e.g. 'G-XXXXXXXXXX'

  if (!GA_MEASUREMENT_ID) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return; // honour browser privacy signals
  if (/^(localhost|127\.|192\.168\.)/.test(location.hostname)) return; // don't count your own testing

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  var EEA_UK_CH = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH'];
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', region: EEA_UK_CH });

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { allow_google_signals: false, allow_ad_personalization_signals: false, send_page_view: true });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(s);

  // Pages Loaf FM swaps in without reloading (so the board keeps running) change the address with history.pushState
  // after updating the title, so GA4's enhanced measurement ("page changes based on browser history events", on by
  // default) counts them on its own. Don't also send page_view here, or swapped pages would be counted twice.
})();
