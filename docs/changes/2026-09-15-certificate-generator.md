# Certificate Generator & Homepage Showcase

## What Changed
- Created a dedicated public Certificate Generator tool (`/certificate-generator`) with a distraction-free 4-step wizard:
  - **Step 1: Select Template**: Filterable template gallery with category pills, orientation switcher, search, and live preview pane.
  - **Step 2: Customize Design**: Hybrid editor featuring a Quick-Form panel (Title, Recipient merge tags, Issuer name, Date, Signatory) plus direct click-and-drag Fabric.js canvas editing with typography controls, zoom, undo/redo, signature drawing pad, signature upload, and logo upload.
  - **Step 3: Add Recipients**: Quota-tracked recipient manager capped at 10 free recipients per batch with manual entry, Excel/CSV spreadsheet importing (`xlsx`), and interactive chip deletion.
  - **Step 4: Download & Delivery**: Lead capture gate with client-side PDF generation using `jsPDF` for instantaneous downloads without server compute load, plus post-download upgrade prompts to full Zikoro workspaces.
- Added public lead capture API route `POST /api/generator/download`.
- Added interactive `<CertificateGeneratorSection />` between `<Section1 />` and `<Section2 />` on the homepage (`src/app/page.tsx`).
- Added "Certificate Maker" links to desktop and mobile navigation in `src/components/home/Navbar.tsx`.
- Updated `next.config.mjs` to alias `canvas` to `false` during server-side compilation to prevent native module version conflicts with Fabric.js.

## Why
- Inspired by the top-performing VirtualBadge certificate maker funnel, providing prospective users with a zero-friction, 100% free way to personalize and generate certificates right in their browser.
- Serves as a high-converting lead generation tool and organic SEO driver for search traffic while showcasing Zikoro's design and credentialing capabilities.

## Files Touched
- `src/app/api/generator/download/route.ts`
- `src/app/certificate-generator/page.tsx`
- `src/components/certificate-generator/GeneratorHeader.tsx`
- `src/components/certificate-generator/TemplateSelector.tsx`
- `src/components/certificate-generator/CanvasEditor.tsx`
- `src/components/certificate-generator/RecipientManager.tsx`
- `src/components/certificate-generator/DownloadGate.tsx`
- `src/components/home/CertificateGeneratorSection.tsx`
- `src/components/home/Navbar.tsx`
- `src/app/page.tsx`
- `next.config.mjs`

## Follow-ups / Known Issues
None

## Commit Message
feat: add public certificate generator wizard and homepage interactive showcase
