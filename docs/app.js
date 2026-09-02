/* PWA install prompt + Android tester signup — "מתי שבת בירוחם" */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuration
  //
  // The embeddable form that collects tester Gmail addresses lives in
  // form-config.js, so the URL can be swapped without touching this file.
  // Works with any form that allows embedding, e.g.
  //   Google Forms: https://docs.google.com/forms/d/e/<id>/viewform?embedded=true
  //   Fillout:      https://forms.fillout.com/t/<formId>
  //   Airtable:     https://airtable.com/embed/<formId>
  // Leave it empty and the button falls back to a pre-filled email instead.
  // ---------------------------------------------------------------------------
  var TESTER_FORM_URL = window.SY_TESTER_FORM_URL || '';
  var FALLBACK_EMAIL = 'mindcetdev@gmail.com';

  var STORE = {
    installDismissed: 'sy:install-dismissed-at',
    testerDismissed: 'sy:tester-dismissed-at',
    testerSignedUp: 'sy:tester-signed-up',
    visits: 'sy:visits',
  };
  var DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

  // localStorage throws in some privacy modes; never let that break the page.
  function get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  function dismissedRecently(key) {
    var at = parseInt(get(key) || '0', 10);
    return at > 0 && Date.now() - at < DISMISS_COOLDOWN_MS;
  }

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.startsWith('android-app://')
    );
  }

  function isIos() {
    return (
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      // iPadOS 13+ reports as a Mac; the touch points give it away.
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------
  var CSS = [
    '.sy-sheet{position:fixed;inset-inline:0;bottom:0;z-index:120;padding:16px;',
    'padding-bottom:calc(16px + env(safe-area-inset-bottom));display:flex;justify-content:center;',
    'transform:translateY(120%);transition:transform .32s cubic-bezier(.2,.8,.25,1);pointer-events:none}',
    '.sy-sheet.sy-open{transform:translateY(0);pointer-events:auto}',
    '@media (max-width:767px){.sy-sheet{bottom:64px}}',
    '.sy-card{width:100%;max-width:560px;background:rgba(23,30,57,.96);backdrop-filter:blur(12px);',
    'border:1px solid rgba(232,182,90,.28);border-radius:20px;padding:18px 20px;',
    'box-shadow:0 18px 48px rgba(0,0,0,.5);color:#f5f1e6;font-family:Heebo,Rubik,sans-serif;',
    'display:flex;gap:14px;align-items:flex-start}',
    '.sy-card img{width:48px;height:48px;border-radius:12px;flex:0 0 auto}',
    '.sy-body{flex:1;min-width:0}',
    '.sy-title{font-size:16px;font-weight:700;color:#ffd388;margin:0 0 4px}',
    '.sy-text{font-size:13px;line-height:1.55;color:#d3c5b2;margin:0}',
    '.sy-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
    '.sy-btn{font:inherit;font-size:14px;font-weight:600;border-radius:999px;padding:9px 18px;',
    'border:0;cursor:pointer;background:#e8b65a;color:#422d00;transition:filter .15s}',
    '.sy-btn:hover{filter:brightness(1.08)}',
    '.sy-btn-ghost{background:transparent;color:#9b8f7e;border:1px solid rgba(155,143,126,.35)}',
    '.sy-btn-ghost:hover{color:#d3c5b2}',
    '.sy-close{position:absolute;inset-inline-end:14px;top:12px;background:none;border:0;color:#9b8f7e;',
    'font-size:22px;line-height:1;cursor:pointer;padding:4px}',
    '.sy-steps{margin:10px 0 0;padding-inline-start:18px;font-size:13px;line-height:1.9;color:#d3c5b2}',
    '.sy-steps b{color:#ffd388}',
    '.sy-modal{position:fixed;inset:0;z-index:200;background:rgba(5,12,39,.82);backdrop-filter:blur(6px);',
    'display:none;align-items:center;justify-content:center;padding:16px}',
    '.sy-modal.sy-open{display:flex}',
    '.sy-modal-card{position:relative;width:100%;max-width:640px;height:min(86vh,760px);',
    'background:#131a35;border:1px solid rgba(232,182,90,.25);border-radius:20px;overflow:hidden;',
    'display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.6)}',
    '.sy-modal-head{padding:16px 52px 14px 20px;border-bottom:1px solid rgba(79,69,55,.4)}',
    '.sy-modal-head h2{margin:0 0 4px;font-size:18px;font-weight:700;color:#ffd388;',
    'font-family:Heebo,Rubik,sans-serif}',
    '.sy-modal-head p{margin:0;font-size:13px;color:#d3c5b2;font-family:Heebo,Rubik,sans-serif;line-height:1.5}',
    '.sy-modal-card iframe{flex:1;width:100%;border:0;background:#fff}',
    '.sy-fab{background:none;border:0;padding:0;font:inherit;color:#ffd388;cursor:pointer;',
    'text-decoration:underline;text-underline-offset:3px}',
  ].join('');

  function injectStyles() {
    var el = document.createElement('style');
    el.id = 'sy-pwa-styles';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  // ---------------------------------------------------------------------------
  // Bottom sheet
  // ---------------------------------------------------------------------------
  function buildSheet(opts) {
    var sheet = document.createElement('div');
    sheet.className = 'sy-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-live', 'polite');
    sheet.dir = 'rtl';

    var card = document.createElement('div');
    card.className = 'sy-card';
    card.style.position = 'relative';

    var icon = document.createElement('img');
    icon.src = 'icons/icon-192.png';
    icon.alt = '';
    card.appendChild(icon);

    var body = document.createElement('div');
    body.className = 'sy-body';
    body.innerHTML =
      '<p class="sy-title">' + opts.title + '</p>' +
      '<p class="sy-text">' + opts.text + '</p>' +
      (opts.extraHtml || '');
    card.appendChild(body);

    var actions = document.createElement('div');
    actions.className = 'sy-actions';
    body.appendChild(actions);

    (opts.buttons || []).forEach(function (spec) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sy-btn' + (spec.ghost ? ' sy-btn-ghost' : '');
      btn.textContent = spec.label;
      btn.addEventListener('click', spec.onClick);
      actions.appendChild(btn);
    });

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'sy-close';
    close.setAttribute('aria-label', 'סגירה');
    close.innerHTML = '&times;';
    close.addEventListener('click', function () { opts.onDismiss(); });
    card.appendChild(close);

    sheet.appendChild(card);
    document.body.appendChild(sheet);
    // Next frame, so the transition actually runs.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { sheet.classList.add('sy-open'); });
    });
    return sheet;
  }

  function closeSheet(sheet) {
    if (!sheet) return;
    sheet.classList.remove('sy-open');
    setTimeout(function () { sheet.remove(); }, 350);
  }

  // ---------------------------------------------------------------------------
  // Tester signup
  // ---------------------------------------------------------------------------
  var testerModal = null;

  function openTesterForm() {
    set(STORE.testerSignedUp, '1');

    if (!TESTER_FORM_URL) {
      var subject = encodeURIComponent('רוצה להיות בודק/ת של אפליקציית "מתי שבת בירוחם"');
      var body = encodeURIComponent(
        'היי,\n\nאשמח להצטרף כבודק/ת לאפליקציית האנדרואיד.\n\n' +
        'כתובת הג\'ימייל שלי (זו שאיתה אני מחובר/ת ל-Google Play):\n\n\nתודה!'
      );
      window.location.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + subject + '&body=' + body;
      return;
    }

    if (!testerModal) {
      testerModal = document.createElement('div');
      testerModal.className = 'sy-modal';
      testerModal.dir = 'rtl';
      testerModal.innerHTML =
        '<div class="sy-modal-card">' +
          '<button type="button" class="sy-close" aria-label="סגירה">&times;</button>' +
          '<div class="sy-modal-head">' +
            '<h2>הרשמה כבודק/ת לאפליקציית האנדרואיד</h2>' +
            '<p>השאירו את כתובת הג\'ימייל שאיתה אתם מחוברים ל-Google Play — נשלח אליכם קישור להתקנה.</p>' +
          '</div>' +
          '<iframe title="טופס הרשמה כבודקים" loading="lazy"></iframe>' +
        '</div>';

      testerModal.addEventListener('click', function (e) {
        if (e.target === testerModal || e.target.classList.contains('sy-close')) {
          testerModal.classList.remove('sy-open');
        }
      });
      document.body.appendChild(testerModal);
    }

    var frame = testerModal.querySelector('iframe');
    if (!frame.src) frame.src = TESTER_FORM_URL;
    testerModal.classList.add('sy-open');
  }

  function maybeShowTesterInvite() {
    if (!isStandalone()) return;               // only for people who installed
    if (get(STORE.testerSignedUp)) return;
    if (dismissedRecently(STORE.testerDismissed)) return;

    var sheet;
    setTimeout(function () {
      sheet = buildSheet({
        title: 'רוצים את זה כאפליקציית אנדרואיד?',
        text: 'אנחנו מגישים את האפליקציה ל-Google Play וצריכים בודקים. ההרשמה לוקחת חצי דקה — רק כתובת ג\'ימייל.',
        buttons: [
          { label: 'אני רוצה להירשם', onClick: function () { closeSheet(sheet); openTesterForm(); } },
          { label: 'לא עכשיו', ghost: true, onClick: function () {
              set(STORE.testerDismissed, String(Date.now()));
              closeSheet(sheet);
            } },
        ],
        onDismiss: function () {
          set(STORE.testerDismissed, String(Date.now()));
          closeSheet(sheet);
        },
      });
    }, 4000);
  }

  // ---------------------------------------------------------------------------
  // Install invitation
  // ---------------------------------------------------------------------------
  var deferredPrompt = null;
  var installSheet = null;

  function showInstallSheet() {
    if (installSheet) return;
    installSheet = buildSheet({
      title: 'התקינו את "מתי שבת בירוחם"',
      text: 'הוסיפו את האפליקציה למסך הבית — זמני השבת נפתחים מיד, גם בלי אינטרנט.',
      buttons: [
        { label: 'התקנה', onClick: runInstall },
        { label: 'לא תודה', ghost: true, onClick: dismissInstall },
      ],
      onDismiss: dismissInstall,
    });
  }

  function showIosInstructions() {
    if (installSheet) return;
    installSheet = buildSheet({
      title: 'הוסיפו למסך הבית',
      text: 'ב-Safari אפשר להוסיף את האפליקציה למסך הבית בשני צעדים:',
      extraHtml:
        '<ol class="sy-steps">' +
          '<li>הקישו על כפתור <b>שיתוף</b> בסרגל התחתון</li>' +
          '<li>בחרו <b>הוספה למסך הבית</b></li>' +
        '</ol>',
      buttons: [{ label: 'הבנתי', ghost: true, onClick: dismissInstall }],
      onDismiss: dismissInstall,
    });
  }

  function dismissInstall() {
    set(STORE.installDismissed, String(Date.now()));
    closeSheet(installSheet);
    installSheet = null;
  }

  function runInstall() {
    closeSheet(installSheet);
    installSheet = null;
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function (choice) {
      if (choice.outcome !== 'accepted') set(STORE.installDismissed, String(Date.now()));
      deferredPrompt = null;
    });
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (dismissedRecently(STORE.installDismissed)) return;
    setTimeout(showInstallSheet, 2500);
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    closeSheet(installSheet);
    installSheet = null;
    maybeShowTesterInvite();
  });

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function boot() {
    injectStyles();

    var visits = parseInt(get(STORE.visits) || '0', 10) + 1;
    set(STORE.visits, String(visits));

    if (isStandalone()) {
      maybeShowTesterInvite();
    } else if (isIos() && visits >= 2 && !dismissedRecently(STORE.installDismissed)) {
      // iOS never fires beforeinstallprompt, so we explain it by hand — but not
      // on someone's very first look at the site.
      setTimeout(showIosInstructions, 3500);
    }

    // Any "הירשמו כבודקים" link on the page opens the same form.
    document.querySelectorAll('[data-sy-tester]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openTesterForm();
      });
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
  }

  // Expose for manual triggering from a page.
  window.syOpenTesterForm = openTesterForm;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
