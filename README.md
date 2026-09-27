# casabrolin.com

The Casa Brolin website, hosted on Firebase (project `casa-brolin`).
Live at https://www.casabrolin.com (preview: https://casa-brolin.web.app).

## What's where

| Folder | What it is |
|---|---|
| `public/` | **The website itself** — exactly what Firebase serves. Edit files here. |
| `public/landing/cocoverde/` | Coco Verde landing page (`/landing/cocoverde/`) |
| `functions/` | Server code: main contact form → CRM webhook + Firestore log (`cf7feedback`), landing-page OTP check (`verifyOtp`) |
| `scripts/landing/` | Gallery tools for the landing page |
| `landing-media/pending/` | Drop new villa photos here before publishing (not published) |
| `firebase.json` | Hosting config: redirects for old WordPress URLs, form rewrites, cache headers |

## Everyday tasks

Publish website changes:

```bash
firebase deploy --only hosting --project casa-brolin
git add -A && git commit -m "Describe the change" && git push
```

Add photos to the landing page gallery:

```bash
scripts/landing/publish_gallery.sh
```

Deploy form/server code (only when `functions/` changed):

```bash
firebase deploy --only functions --project casa-brolin
```

## Enquiries

Both forms send leads to the CRM (`createPartyFromWebhook` in the `attendance-system-e312c`
project), which creates the party and posts to Slack. Main-site enquiries are also kept in
Firestore (`leads` collection) as a backup.

## DNS

DNS is at Cloudflare (DNS-only, proxy off); the domain is registered at GoDaddy.
See `DNS-ROLLBACK.md`.

## Backups

GitHub: https://github.com/gagansawhney/casabrolinsite (private). `main` mirrors what is
deployed; push after every deploy. The branch `old-landingpage` holds the landing page's
history from before the move (last updated Sep 2025).
