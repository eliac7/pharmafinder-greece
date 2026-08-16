function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderHttpStatusDocument({
  title,
  heading,
  message,
}: {
  title: string;
  heading: string;
  message: string;
}): string {
  return `<!doctype html>
<html lang="el">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex">
    <title>${escapeHtml(title)}</title>
    <style>
      :root{color-scheme:light dark;font-family:Arial,sans-serif;background:#f4f8f7;color:#17332f}
      body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}
      main{width:min(560px,100%);text-align:center;background:#fff;border:1px solid #d9e7e3;border-radius:24px;padding:48px 32px;box-shadow:0 18px 60px rgba(23,51,47,.1)}
      h1{font-size:clamp(1.75rem,5vw,2.5rem);margin:0 0 16px}p{line-height:1.65;color:#526a66;margin:0 0 28px}
      a{display:inline-block;padding:12px 20px;border-radius:12px;background:#26675d;color:#fff;text-decoration:none;font-weight:700}
      @media(prefers-color-scheme:dark){:root{background:#101817;color:#edf7f5}main{background:#172220;border-color:#2b403c}p{color:#afc3bf}}
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(heading)}</h1>
      <p>${escapeHtml(message)}</p>
      <a href="/">Επιστροφή στο PharmaFinder</a>
    </main>
  </body>
</html>`;
}
