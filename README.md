# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 1 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/Aventure du Sucre.dc.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `Aventure du Sucre landing page` project files (HTML prototypes, assets, components)

## Booking form (Brevo)

The booking modal in `index.html` posts JSON to `/api/booking`, a Netlify
function (`netlify/functions/booking.mjs`) that calls the Brevo API. The API key
lives only in the function's environment, never in the page.

On each submission the function:

1. emails the reservation team a transactional message, with the visitor's
   address set as `Reply-To`;
2. adds the visitor to a Brevo list, if they ticked consent and `BREVO_LIST_ID`
   is set;
3. emails the visitor a confirmation, if `BREVO_SEND_CONFIRMATION` is `true`.

Emails are sent in the language the visitor used on the site.

### Setup

1. In Brevo, create an API key (SMTP & API → API keys) and validate the sender
   address you intend to send from (Senders).
2. Copy `.env.example` to `.env` and fill it in for local development; add the
   same variables in Netlify → Site settings → Environment variables for
   production. `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` are required; the rest
   have defaults.
3. Run locally with `netlify dev` (plain `file://` or a static server will not
   serve the function, and the form will show its error message).

Steps 2 and 3 fail loudly rather than silently: with the two required variables
missing the function returns 500 and the form tells the visitor to email the
team directly.
