# Sitemap artifacts

This directory contains the generated static sitemap files
(`sitemap-index.xml`, `sitemap-static.xml`, `sitemap-cities.xml`,
`sitemap-pharmacies-*.xml`). `/sitemap.xml`, `/robots.txt`, and the index all
point here.

The `Update sitemap artifacts` GitHub Actions workflow generates these files
from the authenticated public API on demand and twice daily.
It commits changes to the frontend repository so the connected Vercel project
deploys the updated artifacts.

The workflow requires these repository secrets:

- `BACKEND_REPOSITORY` (private backend repository in `OWNER/REPOSITORY` form)
- `BACKEND_REPO_READ_TOKEN` (fine-grained token with read-only Contents access
  to that private backend repository)
- `SITEMAP_API_SECRET_KEY`
- `SITEMAP_ENCRYPTION_SECRET` and `SITEMAP_ENCRYPTION_SALT`

Run it manually from the frontend repository's Actions tab after configuring
the secrets. The `dry_run` input defaults to true: it fetches data and generates
and validates XML in a temporary directory without changing or pushing files.
Choose false only when publication is intended. Scheduled runs publish changes.
The GitHub runner needs HTTPS access to the API, not access to PostgreSQL.

For a manual local dry run, set `API_BASE_URL`, `API_SECRET_KEY`,
`ENCRYPTION_SECRET`, and `ENCRYPTION_SALT` in the environment, then run from
the backend repository:

```bash
python scripts/generate_sitemap_artifacts.py \
  --output-dir ../pharmafinder-greece/public/sitemaps \
  --base-url https://www.pharmafinder.app --dry-run
```
