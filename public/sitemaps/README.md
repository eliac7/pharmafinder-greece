# Sitemap artifacts

This directory contains the generated static sitemap files
(`sitemap-index.xml`, `sitemap-static.xml`, `sitemap-cities.xml`,
`sitemap-pharmacies-*.xml`). `/sitemap.xml`, `/robots.txt`, and the index all
point here.

The `Update sitemap artifacts` GitHub Actions workflow generates these files
from the production database on demand and twice daily after the scraper
windows.
It commits changes to the frontend repository so the connected Vercel project
deploys the updated artifacts.

The workflow requires these repository secrets:

- `BACKEND_REPOSITORY` (private backend repository in `OWNER/REPOSITORY` form)
- `BACKEND_REPO_READ_TOKEN` (fine-grained token with read-only Contents access
  to that private backend repository)
- `SITEMAP_PGHOST`
- `SITEMAP_PGPORT`
- `SITEMAP_PGDATABASE`
- `SITEMAP_PGUSER`
- `SITEMAP_PGPASSWORD`

Run it manually from the frontend repository's Actions tab after configuring
the secrets. The production database must be reachable from the GitHub
runner; otherwise use a self-hosted runner or an approved SSH tunnel.

For a manual local generation, run from the backend repository with the API
environment configured for the target database:

```bash
python scripts/generate_sitemap_artifacts.py \
  --output-dir ../pharmafinder-greece/public/sitemaps \
  --base-url https://www.pharmafinder.app
```
