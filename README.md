# Sales Sheet Builder (MVP+)

This version now supports your requested workflow:

- **Kit Builder + single-part builder** from searchable product cards.
- **AI chat flow that does not guess**: it prompts for missing decisions (PAPR type, filter setup, airline length) before building a kit.
- **Distributor-specific pricing** with:
  - a main list (Main/FNL/Grainger), and
  - ability to add less-popular distributors manually.
- **Dual output mode**:
  - Customer view (no cost)
  - Distributor view (with distributor-specific cost)
- **Sales sheet preview** and **Print/PDF export**.

## Run
Open `index.html` in a browser.

## Next integrations
1. Replace static `products` with dispatch/pivot/catalog/photo APIs.
2. Plug the chat panel into your AI backend + RAG over your documents.
3. Add account templates that lock branding and distributor rules.
