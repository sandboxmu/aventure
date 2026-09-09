/**
 * Booking request handler — forwards the modal form to Brevo.
 *
 * The browser posts JSON to /api/booking; this function calls the Brevo API
 * with the secret key (never exposed to the page) and:
 *   1. sends a transactional email to the reservation team,
 *   2. optionally emails the visitor a confirmation,
 *   3. optionally stores the visitor as a contact when they ticked consent.
 *
 * Environment variables (set them in Netlify → Site settings → Environment):
 *   BREVO_API_KEY             required — Brevo v3 API key
 *   BREVO_SENDER_EMAIL        required — a sender address validated in Brevo
 *   BREVO_SENDER_NAME         optional — defaults to "L'Aventure du Sucre"
 *   BOOKING_RECIPIENTS        optional — comma-separated team inboxes
 *   BREVO_LIST_ID             optional — list id for consenting visitors
 *   BREVO_SEND_CONFIRMATION   optional — "true" to auto-reply to the visitor
 */

const BREVO_API = "https://api.brevo.com/v3";

const DEFAULT_RECIPIENTS = [
  "reservation@aventuredusucre.com",
  "administration@aventuredusucre.com",
];

const COPY = {
  en: {
    subject: (name) => `New reservation request from ${name}`,
    name: "Name",
    email: "Email",
    phone: "Phone",
    message: "Message",
    consent: "Consent given",
    yes: "Yes",
    no: "No",
    confirmSubject: "We have received your request",
    confirmIntro: (name) =>
      `Hello ${name}, thank you for your interest in L'Aventure du Sucre. ` +
      `Our team has received your request and will get back to you shortly.`,
    confirmRecap: "Here is a copy of what you sent us:",
    confirmSignoff: "See you soon at Beau Plan,<br>The L'Aventure du Sucre team",
  },
  fr: {
    subject: (name) => `Nouvelle demande de réservation de ${name}`,
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    message: "Message",
    consent: "Consentement donné",
    yes: "Oui",
    no: "Non",
    confirmSubject: "Nous avons bien reçu votre demande",
    confirmIntro: (name) =>
      `Bonjour ${name}, merci de l'intérêt que vous portez à L'Aventure du Sucre. ` +
      `Notre équipe a bien reçu votre demande et vous répondra très prochainement.`,
    confirmRecap: "Voici une copie de votre message :",
    confirmSignoff: "À très bientôt à Beau Plan,<br>L'équipe de L'Aventure du Sucre",
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Rows shared by the team notification and the visitor confirmation. */
function detailRows(t, fields) {
  return [
    [t.name, fields.name],
    [t.email, fields.email],
    [t.phone, fields.phone],
    [t.message, fields.message],
  ];
}

function detailsHtml(rows) {
  return rows
    .map(
      ([label, value]) =>
        `<tr>` +
        `<td style="padding:6px 12px 6px 0;vertical-align:top;color:#6b6257;">` +
        `<strong>${escapeHtml(label)}</strong></td>` +
        `<td style="padding:6px 0;vertical-align:top;">` +
        `${escapeHtml(value).replace(/\n/g, "<br>")}</td>` +
        `</tr>`
    )
    .join("");
}

function detailsText(rows) {
  return rows.map(([label, value]) => `${label}: ${value}`).join("\n");
}

async function brevo(path, apiKey, payload) {
  const res = await fetch(`${BREVO_API}${path}`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) return null;

  const detail = await res.text();
  return `Brevo ${path} responded ${res.status}: ${detail.slice(0, 500)}`;
}

export default async (req) => {
  if (req.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    console.error("Missing BREVO_API_KEY or BREVO_SENDER_EMAIL");
    return json(500, { error: "not_configured" });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  // Honeypot: real visitors never see this field, bots fill it in.
  if (body["bot-field"]) return json(200, { ok: true });

  const fields = {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim(),
    phone: String(body.phone || "").trim(),
    message: String(body.message || "").trim(),
  };
  const consent = body.consent === true || body.consent === "on";
  const lang = body.lang === "fr" ? "fr" : "en";
  const t = COPY[lang];

  const missing = Object.keys(fields).filter((key) => !fields[key]);
  if (missing.length) return json(400, { error: "missing_fields", fields: missing });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) {
    return json(400, { error: "invalid_email" });
  }

  const sender = {
    email: senderEmail,
    name: process.env.BREVO_SENDER_NAME || "L'Aventure du Sucre",
  };
  const recipients = (process.env.BOOKING_RECIPIENTS || "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  const to = (recipients.length ? recipients : DEFAULT_RECIPIENTS).map((email) => ({ email }));

  const rows = detailRows(t, fields);
  const consentRow = `<tr><td style="padding:6px 12px 6px 0;color:#6b6257;">` +
    `<strong>${escapeHtml(t.consent)}</strong></td>` +
    `<td style="padding:6px 0;">${consent ? t.yes : t.no}</td></tr>`;

  const notifyError = await brevo("/smtp/email", apiKey, {
    sender,
    to,
    replyTo: { email: fields.email, name: fields.name },
    subject: t.subject(fields.name),
    textContent: `${detailsText(rows)}\n${t.consent}: ${consent ? t.yes : t.no}`,
    htmlContent:
      `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#2b241c;">` +
      `<h2 style="margin:0 0 16px;">${escapeHtml(t.subject(fields.name))}</h2>` +
      `<table cellpadding="0" cellspacing="0">${detailsHtml(rows)}${consentRow}</table>` +
      `</div>`,
  });

  if (notifyError) {
    console.error(notifyError);
    return json(502, { error: "brevo_email_failed" });
  }

  // Everything below is best-effort: the request already reached the team, so a
  // failure here must not tell the visitor their booking did not go through.
  if (consent && process.env.BREVO_LIST_ID) {
    const [firstName, ...rest] = fields.name.split(/\s+/);
    const attributes = { FIRSTNAME: firstName, LASTNAME: rest.join(" ") };

    // Brevo rejects the whole contact when SMS isn't in international format,
    // so only send the number when it plausibly is one.
    const phone = fields.phone.replace(/[\s.\-()]/g, "");
    if (/^\+\d{8,15}$/.test(phone)) attributes.SMS = phone;

    const contactError = await brevo("/contacts", apiKey, {
      email: fields.email,
      updateEnabled: true,
      listIds: [Number(process.env.BREVO_LIST_ID)],
      attributes,
    });
    if (contactError) console.error(contactError);
  }

  if (process.env.BREVO_SEND_CONFIRMATION === "true") {
    const confirmError = await brevo("/smtp/email", apiKey, {
      sender,
      to: [{ email: fields.email, name: fields.name }],
      subject: t.confirmSubject,
      textContent: `${t.confirmIntro(fields.name)}\n\n${t.confirmRecap}\n${detailsText(rows)}`,
      htmlContent:
        `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#2b241c;">` +
        `<p>${escapeHtml(t.confirmIntro(fields.name))}</p>` +
        `<p style="color:#6b6257;">${escapeHtml(t.confirmRecap)}</p>` +
        `<table cellpadding="0" cellspacing="0">${detailsHtml(rows)}</table>` +
        `<p style="margin-top:20px;">${t.confirmSignoff}</p>` +
        `</div>`,
    });
    if (confirmError) console.error(confirmError);
  }

  return json(200, { ok: true });
};
