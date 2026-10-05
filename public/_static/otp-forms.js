/* Phone OTP gate for the main site's contact forms (Contact Form 7 markup).
 * Same MSG91 widget and flow as the Coco Verde landing page: on submit the visitor
 * verifies their phone by OTP; only then is the form handed on to CF7's normal submit
 * (-> /wp-json/contact-form-7/... -> cf7feedback function -> CRM + Slack). */
(function () {
  var WIDGET_ID = '356844694444383834333338';
  var TOKEN_AUTH = '466799TwbvCuEjh68b2c585P1';

  function ensureMsg91Loaded(callback) {
    if (window.initSendOTP) { callback(); return; }
    var s = document.createElement('script');
    s.onload = callback;
    s.onerror = function () { callback(new Error('otp-provider failed to load')); };
    s.src = 'https://verify.msg91.com/otp-provider.js';
    document.body.appendChild(s);
  }

  function field(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? String(el.value || '').trim() : '';
  }

  // The forms have no country-code box: 10 digits = Indian mobile, longer = already has one.
  function toE164(phone) {
    var digits = phone.replace(/\D+/g, '').replace(/^0+/, '');
    return '+' + (digits.length === 10 ? '91' + digits : digits);
  }

  // Only start OTP for a form CF7 would accept; otherwise let CF7 show its own field errors.
  function looksComplete(form) {
    var digits = field(form, 'party_phone').replace(/\D+/g, '');
    return field(form, 'party_name') && field(form, 'party_remarks') &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field(form, 'party_email')) &&
      digits.length >= 8 && digits.length <= 15;
  }

  function showMessage(form, text) {
    var out = form.querySelector('.wpcf7-response-output');
    if (!out) return;
    out.innerText = text;
    out.style.display = 'block';
    form.setAttribute('data-status', text ? 'invalid' : 'init');
  }

  function setToken(form, token) {
    var input = form.querySelector('input[name="otp_access_token"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'otp_access_token';
      form.appendChild(input);
    }
    input.value = token || 'verified';
  }

  function startOtp(form, submitter, phone) {
    form.__otpBusy = true;
    setTimeout(function () { form.__otpBusy = false; }, 3000); // guard against double clicks only
    var configuration = {
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      identifier: phone,
      exposeMethods: false,
      success: function (data) {
        var token = (data && (data.token || data['access-token'] || data.accessToken)) || '';
        if (!token && data && typeof data.message === 'string' && data.message.length > 10) {
          token = data.message; // MSG91 sometimes returns the JWT in `message`
        }
        setToken(form, token);
        form.__otpVerifiedPhone = phone;
        showMessage(form, '');
        if (form.requestSubmit) form.requestSubmit(submitter && submitter.form === form ? submitter : undefined);
        else form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      },
      failure: function () {
        showMessage(form, 'We could not verify your number. Please try again.');
      }
    };
    ensureMsg91Loaded(function (err) {
      try {
        if (err) throw err;
        window.initSendOTP(configuration);
      } catch (e) {
        showMessage(form, 'Phone verification is unavailable right now. Please try again in a moment.');
      }
    });
  }

  // Capture phase on document runs before CF7's own submit handler on the form.
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.matches || !form.matches('form.wpcf7-form')) return;
    if (!looksComplete(form)) return;

    var phone = toE164(field(form, 'party_phone'));
    if (form.__otpVerifiedPhone === phone) return; // already verified this number -> CF7 submits

    e.preventDefault();
    e.stopImmediatePropagation();
    if (form.__otpBusy) return;
    startOtp(form, e.submitter, phone);
  }, true);

  // A sent enquiry uses up the verification; the next one needs a fresh OTP.
  document.addEventListener('wpcf7mailsent', function (e) {
    var t = e.target; // CF7 fires this on the form (older versions: on its .wpcf7 wrapper)
    var form = t && t.matches && t.matches('form.wpcf7-form') ? t : t && t.querySelector && t.querySelector('form.wpcf7-form');
    if (form) {
      form.__otpVerifiedPhone = null;
      var token = form.querySelector('input[name="otp_access_token"]');
      if (token) token.value = '';
    }
  });
})();
