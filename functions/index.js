/**
 * Replacement back end for the site's Contact Form 7 forms.
 *
 * The static pages still run CF7's own JavaScript, which POSTs multipart form data to
 * /wp-json/contact-form-7/v1/contact-forms/<id>/feedback. Firebase Hosting rewrites that
 * path here; we answer in CF7's response format so the existing UI messages and the
 * "wpcf7mailsent" conversion events (Google Ads / Meta Pixel) keep working unchanged.
 *
 * Each enquiry is sent to the Casa Brolin CRM (same webhook the Coco Verde landing page
 * uses — the CRM creates the party and posts the Slack notification) and also kept in
 * Firestore (collection "leads") as a backup log.
 */
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const Busboy = require("busboy");
const crypto = require("crypto");

initializeApp();

const CRM_WEBHOOK = "https://us-central1-attendance-system-e312c.cloudfunctions.net/createPartyFromWebhook?token=s294";
const FORM_NAMES = { 3108: "website-footer", 3109: "website-contact" };

const FIELDS = ["party_name", "party_email", "party_phone", "party_remarks"];
const TRACKING = ["utm_source", "utm_medium", "utm_campaign", "fbclid", "gclid", "submitted_at"];
const MAX = { party_name: 400, party_email: 400, party_remarks: 2000 };
const MSG = {
  sent: "Thank you for your message. It has been sent.",
  invalid: "One or more fields have an error. Please check and try again.",
  failed: "There was an error trying to send your message. Please try again later.",
  required: "The field is required.",
  email: "The e-mail address entered is invalid.",
  number: "The number format is invalid.",
  tooLong: "The field is too long.",
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const bb = Busboy({ headers: req.headers, limits: { fields: 50, fieldSize: 10000, files: 0 } });
    bb.on("field", (name, val) => { fields[name] = val; });
    bb.on("close", () => resolve(fields));
    bb.on("error", reject);
    bb.end(req.rawBody);
  });
}

function validate(f) {
  const invalid = [];
  const add = (field, message) => invalid.push({ field, message, idref: null, error_id: `${field}-error` });
  for (const k of FIELDS) {
    const v = (f[k] || "").trim();
    if (!v) { add(k, MSG.required); continue; }
    if (MAX[k] && v.length > MAX[k]) add(k, MSG.tooLong);
    else if (k === "party_email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) add(k, MSG.email);
    else if (k === "party_phone" && !/^[+]?[\d\s().-]{5,20}$/.test(v)) add(k, MSG.number);
  }
  return invalid;
}

// Same payload shape the landing page's sendPartyWebhook() sends, so the CRM treats both alike.
function crmPayload(lead, formId, page) {
  let phone = lead.party_phone.replace(/\D+/g, "");
  if (phone.length === 10) phone = "91" + phone; // landing page always sends country code
  const form = FORM_NAMES[formId] || `website-${formId}`;
  return {
    party_name: lead.party_name,
    party_email: lead.party_email,
    party_phone: phone,
    party_remarks: `${lead.party_remarks} (form: ${form})`,
    utm_source: lead.utm_source,
    utm_medium: lead.utm_medium,
    utm_campaign: lead.utm_campaign,
    fbclid: lead.fbclid,
    gclid: lead.gclid,
    landing_page_url: page,
    referrer: "",
    submitted_at: lead.submitted_at || new Date().toISOString(),
  };
}

exports.cf7feedback = onRequest(
  { region: "asia-south1", maxInstances: 5, memory: "256MiB" },
  async (req, res) => {
    if (req.method !== "POST") return res.status(405).json({ code: "method_not_allowed" });

    const formId = (req.path.match(/contact-forms\/(\d+)\/feedback/) || [])[1] || "unknown";
    let f;
    try {
      f = await parseForm(req);
    } catch (e) {
      logger.warn("unparseable submission", e);
      return res.status(400).json({ status: "validation_failed", message: MSG.invalid, invalid_fields: [] });
    }

    const base = { contact_form_id: Number(formId), into: `#${f._wpcf7_unit_tag || ""}` };
    const invalid = validate(f);
    if (invalid.length) {
      return res.json({ ...base, status: "validation_failed", message: MSG.invalid, invalid_fields: invalid });
    }

    const lead = {};
    for (const k of [...FIELDS, ...TRACKING]) lead[k] = (f[k] || "").trim();
    const meta = {
      formId,
      page: req.get("referer") || "",
      userAgent: req.get("user-agent") || "",
      ip: (req.get("x-forwarded-for") || "").split(",")[0].trim(),
      createdAt: FieldValue.serverTimestamp(),
    };
    const hash = crypto.createHash("md5").update(JSON.stringify(lead) + Date.now()).digest("hex");

    // CRM first: it is what creates the party and the Slack notification.
    const crm = { crmStatus: 0, crmResponse: "" };
    try {
      const r = await fetch(CRM_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(crmPayload(lead, formId, meta.page)),
        signal: AbortSignal.timeout(15000),
      });
      crm.crmStatus = r.status;
      crm.crmResponse = (await r.text()).slice(0, 1000);
      if (!r.ok) logger.error(`CRM webhook returned ${r.status}`, crm.crmResponse);
    } catch (e) {
      crm.crmResponse = String(e.message || e);
      logger.error("CRM webhook call failed", e);
    }

    let stored = true;
    try {
      await getFirestore().collection("leads").add({ ...lead, ...meta, ...crm });
    } catch (e) {
      stored = false;
      logger.error("failed to store lead", e);
    }

    // Only tell the visitor it failed if the enquiry reached neither the CRM nor the log.
    if (!stored && !(crm.crmStatus >= 200 && crm.crmStatus < 300)) {
      return res.json({ ...base, status: "mail_failed", message: MSG.failed, invalid_fields: [], posted_data_hash: "" });
    }

    return res.json({ ...base, status: "mail_sent", message: MSG.sent, invalid_fields: [], posted_data_hash: hash });
  }
);

/**
 * Port of landing/cocoverde/assets/api/verify_otp.php (MSG91 OTP access-token check).
 *
 * Behaviour matches the PHP exactly, including the 500 "Server not configured" reply when
 * MSG91_AUTHKEY is unset — the landing page's JS treats that reply as "proceed and send the
 * lead", which is how the live site works today (no key was ever configured there). Put
 * MSG91_AUTHKEY in functions/.env to switch real OTP verification on.
 */
exports.verifyOtp = onRequest(
  { region: "asia-south1", maxInstances: 5, memory: "256MiB" },
  async (req, res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0").set("Pragma", "no-cache");

    const authKey = process.env.MSG91_AUTHKEY || "";
    if (!authKey) {
      return res.status(500).json({ ok: false, error: "Server not configured. Set MSG91_AUTHKEY environment variable." });
    }

    const data = req.body && typeof req.body === "object" ? req.body : {};
    const accessToken = data.access_token || "";
    if (!accessToken) return res.status(400).json({ ok: false, error: "Missing access_token" });

    let status, json;
    try {
      const r = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ authkey: authKey, "access-token": accessToken }),
      });
      status = r.status;
      json = await r.json().catch(() => null);
    } catch (e) {
      return res.status(502).json({ ok: false, error: "Upstream error", detail: String(e.message || e) });
    }

    if (status >= 200 && status < 300 && json) {
      const ok = String(json.type).toLowerCase() === "success" || json.success === true || String(json.status).toLowerCase() === "success";
      if (ok) return res.json({ ok: true });
    }
    return res.status(400).json({ ok: false, error: "Verification failed", response: json, status });
  }
);
