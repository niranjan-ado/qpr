# qprindia.com

Hand-written HTML, CSS and JavaScript. No framework, no CMS, no build step, no
dependencies. Deploys to Azure Static Web Apps on push, served through Cloudflare.

## Why static

The previous site was a WordPress install compromised since May 2024 through a
plugin vulnerability, serving roughly 12,000 injected spam pages. There is now no
database, no admin login, no plugins and no server-side code, so that class of
attack cannot recur.

## Structure

```
├── index.html            home
├── courses.html          catalogue
├── institutions.html     group and cohort training
├── about.html            what QPR is, evidence
├── become-an-instructor.html
├── contact.html
├── terms.html · refunds.html · privacy-policy.html · accessibility.html
├── 404.html
├── assets/css/main.css   all styles, design tokens at the top
├── assets/js/main.js     collapses the mobile nav; not required
└── staticwebapp.config.json   routing, 410s, 301s, security headers
```

## Design

The palette is drawn from the chakras, and the mapping is structural rather
than decorative:

| Chakra | Colour | Maps to |
|---|---|---|
| Vishuddha (throat) | `#0D6474` | **Question** — speech, saying the unsayable |
| Anahata (heart) | `#2E7D5B` | **Persuade** — compassion, staying with someone |
| Ajna (third eye) | `#2C2E5E` | **Refer** — perception, pointing toward help |
| Sahasrara (crown) | `#F7F5FA` | the ground the page sits on |

Muladhara's root red is deliberately absent, including from the crisis line.
Alarm and blood have no place on a suicide prevention site; the crisis bar
reads through weight and clarity instead of alarm colour.

Vishuddha carries the site. Anahata and Ajna appear only where the three steps
are actually named, so the palette never gets loud.

Literata for display, Public Sans for body.

## Themes

Three states — system, light, dark — cycled by the control in the header and
stored in `localStorage`. Dark resolves through a `prefers-color-scheme` media
query, so it is correct before any script runs and stays correct if none does.
Every colour pairing on every page was measured for WCAG AA contrast in both
themes.

Navigation needs no JavaScript. On narrow screens the nav renders as a stacked
list by default; the collapse-to-hamburger behaviour is added only once a script
has confirmed JS is available. So every link stays reachable if the script fails,
is blocked, or the file is opened straight from disk.

The crisis line is the first element in the DOM on every page, so it is the
first thing a screen reader announces and the first stop when tabbing, even
though it sits at the top of the screen visually. It is a `tel:` link.

## Still to do before launch

- **Confirmed prices.** The old site listed the same course at three different
  prices. Nothing goes live until there is one price per course.
- **Razorpay payment buttons.** Markers are in `courses.html` where each button
  goes. Until then every course CTA is an enquiry.
- **Registered address and GSTIN** for the invoicing and payment setup.
- **Photography.** Every usable image salvaged from the old site is American
  stock. Real photographs from the Andhra Pradesh trainings would replace the
  typographic treatment where it makes sense.
- **Impact figures** confirmed by the client before they go on the homepage.

## Cache busting

`/assets/*` is served with `max-age=31536000, immutable`, so CSS and JS are
cached for a year. The HTML always revalidates.

**When you change `main.css` or `main.js`, bump the version in every page:**

```bash
sed -i '' 's|main.css?v=2|main.css?v=3|g; s|main.js?v=2|main.js?v=3|g' *.html
```

Without that bump the change will not reach anyone, including through a
private window, because the stale copy sits at the CDN edge rather than in
the browser. If you forget, purge the Cloudflare cache.

## Deployment

There is no workflow file in this repo on purpose. Azure Static Web Apps
generates its own on first connect, with a deployment-token secret name
matching the app. Keep that file; do not replace it.

## Local

```bash
python3 -m http.server 8080
```

Clean URLs are resolved by Azure at the edge, so local links may need `.html`.
