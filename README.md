# AI Infrastructure Demand Scenario Analysis

A static educational website for understanding AI data-center architecture, component attach ratios, and hypothetical supplier allocation. The site includes Traditional Chinese reference pages and a bilingual English / Traditional Chinese AWS example.

## Pages

- `docs/index.html`: server-to-leaf optical-module and DSP demand model.
- `docs/map.html`: Marvell products, system layers, public customer collaborations, and illustrative supply-chain roles.
- `docs/aws.html`: an AWS public-plan example with adjustable architecture, Marvell unit share, sensitivity, inventory, and timing assumptions.

- `docs/capex.html`: bilingual customer-capex evidence, a hypothetical optical-DSP spending funnel, sensitivity and timing / inventory conversion. Published November 11, 2026. Source material and assumptions are separated. The +20% input is an explicit scenario relative to the selected baseline, not a current company announcement.

## Evidence and limitations

This is an independent public-source learning and discussion project, not an official AWS or Marvell website. It does not contain customer-confidential BOMs, actual orders, supplier allocations, or non-public pricing. Example values are explicitly labeled assumptions. Announced plans and collaborations do not establish orders, shipments, exclusivity, or revenue. Source links and their evidence boundaries are shown on the pages.

All calculations run in the visitor's browser. Inputs are neither saved nor uploaded by this application. There are no API keys, authentication, external application calls, analytics, or backend services.

## Run and test

No build or dependency installation is required. Open `docs/index.html` in a browser, or serve the `docs` folder with any static HTTP server.

With Node.js installed, run:

```sh
npm test
```

## GitHub Pages

Set the repository's **Settings → Pages → Build and deployment** to **Deploy from a branch**, branch **main**, folder **/docs**. The `.nojekyll` file allows the static assets to be served as-is. Relative page and asset URLs support a project-site path.

Content source: the existing AI infrastructure site, reviewed on 2026-11-04. Publication does not imply the public plans have been completed.

