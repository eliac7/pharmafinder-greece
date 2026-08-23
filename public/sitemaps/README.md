# Sitemap artifacts

This directory must contain the generated static sitemap files
(`sitemap-index.xml`, `sitemap-static.xml`, `sitemap-cities.xml`,
`sitemap-pharmacies-*.xml`) before deployment. `/sitemap.xml`,
`/robots.txt`, and the index all point here.

Generate them from the backend repository with the production base URL:

```bash
python scripts/generate_sitemap_artifacts.py \
  --output-dir ../pharmafinder-greece/public/sitemaps \
  --base-url https://<production-domain>
```

The XML files are generated data and are not committed.
