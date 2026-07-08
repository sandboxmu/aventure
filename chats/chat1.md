# Aventure du Sucre Landing Page

_Started 2026-07-08 16:05 UTC_

---

## User

I want to design 1 landing page for https://aventuredusucre.com/fr/ their current home page is not really invinting for tourists. It is a sugar museam where you can learn experience a lot of things and drink various rhum. I want  a design that would make tourist want to go there

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: list_files]_

The attached design system is empty, so I'll treat this as a from-scratch design. Let me get a few things clear before building.

_[tool: questions_v2]_

## User

Questions answered:
- audience: International tourists visiting Mauritius, Families with kids, Couples / rum & tasting enthusiasts
- language: Bilingual (FR + EN toggle)
- goal: Book / buy tickets
- sections: Hero with strong imagery, Rum tasting & degustation, The museum experience / what you'll see, Practical info (hours, prices, map)
- tone: Playful & family-friendly
- scope: Single long scrolling homepage

## Assistant

_[tool: read_skill_prompt]_

Design system is empty and the project is fresh, so I'm designing from scratch. Here's my direction:

**Concept** — "The sweetest adventure in Mauritius." Warm, sensory, editorial-tropical. Raw-cane-sugar cream backgrounds, deep molasses ink, rum-caramel and tropical-green accents. Playful yet premium so it appeals to families *and* rum-tasting couples. Bilingual FR/EN toggle, ticket-booking as the hero action.

_[tool: update_todos]_

_[tool: copy_starter_component]_

No stock-photo tool available, so I'll use drag-and-drop image slots the user fills with real photos. Building the full bilingual landing page now.

_[tool: dc_write]_

_[tool: tool_search_tool_bm25]_

_[tool: update_todos]_

_[tool: show_html]_

The page is built. Let me hand off to verification.

_[tool: ready_for_verification]_

Done. Built a single scrolling bilingual (FR/EN toggle) landing page for L'Aventure du Sucre, tourist-focused with ticket booking as the hero action.

**What's there:** sticky nav with language toggle + Book CTA, a full-bleed photo hero, a stats band (260 years, 5,000 m², 11 rums, 20+ sugars), the museum experience in 4 cards, a dark sensory section for rum + sugar tastings (plus restaurant & boutique), and a practical-info block with hours, prices, and a map slot.

Two things to note:
- **Photos** — every image is a drag-and-drop slot. Drop in real photos of the factory, tastings, and a map; they persist.
- **Prices are placeholders** (Rs 425 / Rs 215 / under-6 free) — confirm the current rates and I'll update.

Tweak panel lets you flip the default language and recolor the accent/green. Want me to add a section (reviews, events/private hire) or wire the Book button to the real ticketing URL?

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Fixed — the image-slot script now loads in the helmet, so the stray placeholder is gone and the hero sits at the top as intended.

## User

mors spacing at the top beau plan northen mauritius is stuck to the header and can you add this photo as the headeR?

## Assistant

_[tool: copy_files]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Done — the factory photo is now the hero image, and I added breathing room at the top so the "Beau Plan · Northern Mauritius" eyebrow no longer sits against the header.

## User

Send this design to Canva: Aventure du Sucre.dc.html

