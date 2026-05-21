# Sales Sheet Builder (MVP+)

This version supports your requested workflow:

- **Kit Builder + single-part builder** from searchable product cards.
- **AI chat flow that does not guess**: it prompts for missing decisions (PAPR type, filter setup, airline length) before building a kit.
- **Distributor-specific pricing** with:
  - a main list (Main/FNL/Grainger), and
  - ability to add less-popular distributors manually.
- **Dual output mode**:
  - Customer view (no cost)
  - Distributor view (with distributor-specific cost)
- **Sales sheet preview** and **Print/PDF export**.

## Start the site

```bash
npm start
```

Then open:

- `http://localhost:4173`

If that port is busy, the server will automatically try the next port (for example `4174`) and print the URL in terminal.

## Next integrations
1. Replace static `products` with dispatch/pivot/catalog/photo APIs.
2. Plug the chat panel into your AI backend + RAG over your documents.
3. Add account templates that lock branding and distributor rules.


## Troubleshooting

If you see this line when using `npm start`:

- `npm warn Unknown env config "http-proxy"`

that is an environment warning from npm, not an app failure.
The app is running if you also see:

- `Sales Sheet Builder running at http://localhost:4173` (or another printed port).

If you prefer no npm warning, run the server directly:

```bash
node server.js
```

If you still get an issue, verify the server with:

```bash
curl -I http://localhost:4173
```

(or the fallback port printed in terminal).


### If you get `ENOENT` for `package.json`

That error means npm is being run from the wrong folder (your log shows `/workspaces/Product-List`, while some environments use `/workspace/Product-List`).

Use one of these:

```bash
cd /workspace/Product-List && npm start
```

or (Codespaces-style path):

```bash
cd /workspaces/Product-List && npm start
```

or run the helper script from this repo root:

```bash
./start-site.sh
```
