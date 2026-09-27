# casabrolin.com DNS — state before moving to Firebase (captured 2026-09-26)

Cloudflare zone casabrolin.com (registrar GoDaddy, nameservers Cloudflare).

To roll back to AWS, restore these two records in Cloudflare (both Proxied / orange cloud):

| Name | Type  | Content        | Proxy   |
|------|-------|----------------|---------|
| @    | A     | 3.110.0.143    | Proxied |
| www  | CNAME | casabrolin.com | Proxied |

Untouched by the migration: MX (Google Workspace x5), TXT google-site-verification,
erp (CNAME attendance-system-e312c.web.app), gagans-macbook-air (Tunnel),
leftover NS records pointing at awsdns (Route 53).

## Current state (switched to Firebase 2026-09-27 ~12:35 IST)

| Name | Type  | Content             | Proxy    |
|------|-------|---------------------|----------|
| @    | A     | 199.36.158.100      | DNS only |
| www  | CNAME | casa-brolin.web.app | DNS only |

Also added for Firebase: TXT @ hosting-site=casa-brolin, TXT _acme-challenge and
_acme-challenge.www (SSL). Leave them in place.
