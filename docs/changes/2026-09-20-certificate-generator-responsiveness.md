# Certificate Generator Responsiveness Enhancements

## What Changed
- Upgraded the Certificate Generator (`/certificate-generator`) across all 4 wizard steps and the homepage showcase component to provide a responsive, mobile-first experience:
  - **Step 1: Template Selection (`TemplateSelector.tsx`)**:
    - High-density, space-efficient template gallery grid (2-4 columns) with compact card dimensions so browsing requires significantly less vertical scrolling.
    - Added touch-scrollable category pills and responsive search/filter bar.
    - Added a sticky bottom mobile action bar when a template is selected on screens `< lg`, allowing users to proceed directly with 1 tap without scrolling through the entire gallery.
  - **Step 2: Customize Design (`CanvasEditor.tsx`)**:
    - Defaulted view to **Live Canvas** on mobile/tablet devices so users immediately see their design.
    - Fixed canvas offset bug where loaded templates appeared displaced to the top and right: implemented exact workspace/clip rectangle center point alignment via `viewportTransform` during initialization, zoom, undo/redo, and container resize.
    - Replaced the fixed desktop-only layout with a responsive segmented tab switcher on mobile/tablet (`< lg`), allowing users to toggle smoothly between **Live Canvas** and **Quick Form & Assets**.
    - Fixed **Apply Signatory to Canvas**: Implemented dedicated handler updating both signatory name and title with structured positioning in the certificate workspace.
    - Fixed **Draw Signature, Upload Signature, and Upload Organization Logo**: Fixed critical coordinate calculation where display canvas dimensions were erroneously used instead of template workspace coordinates; assets now load reliably via image elements and are placed in correct workspace locations with immediate mobile tab switching.
    - Fixed **Element Deletion for Signatures, Logos, and Objects**: Refactored the toolbar delete button to be universally visible whenever any selectable item (signatures, images, logos, text) is selected (previously hidden inside a text-only condition), and added keyboard `Delete`/`Backspace` shortcut listener support across the canvas.
    - Fixed **Canvas Serialization & Object Metadata**: Passed `JSON_KEYS` to `canvas.toJSON(JSON_KEYS)` during step progression and history pushes so custom properties including the `clip` workspace rectangle, object names, and locked states are preserved in the transferred payload.
    - Added a dedicated, scroll-safe canvas toolbar above the canvas viewport for undo/redo, text insertion, typography formatting, element deletion, and zoom controls.
    - Updated `fitCanvasToContainer` and `ResizeObserver` to auto-calculate canvas scaling on viewport resize and tab switches.
    - Added touch coordinate scaling and scroll suppression for the signature drawing pad to ensure pixel-perfect finger/stylus drawing on all screen resolutions.
  - **Step 3: Add Recipients (`RecipientManager.tsx`)**:
    - Refactored recipient input forms, quota progress banner, and bottom navigation CTAs to stack responsively on narrow viewports.
  - **Step 4: Download & Delivery (`DownloadGate.tsx`)**:
    - Refactored lead capture form and post-download value cards to stack cleanly across mobile and tablet screens.
    - Fixed **Generated Certificate Offset, Blank Borders & Cropping in PDF**: Configured the offscreen rendering pipeline with a large `3600x3600` buffer to house raw unclipped template coordinates, used `getBoundingRect` to extract the exact `clip` workspace bounding box, applied Fabric's sub-rectangle `toDataURL({ left, top, width, height })` extraction, and initialized `jsPDF` matching exact dimensions and orientation, eliminating all white space gaps, offset displacement, and page margins.
  - **Header & Homepage Showcase (`GeneratorHeader.tsx` & `CertificateGeneratorSection.tsx`)**:
    - Compact mobile step badges and overflow-safe horizontal scrolling.
    - Standardized landing page showcase template cards to uniform `aspect-[4/3]` with `object-contain` for compact, consistent height across landscape and portrait certificates.

## Why
- The previous editor layout used desktop-fixed side-by-side containers and single-row unwrapped toolbars, causing severe canvas clipping and unusable UI on mobile devices and tablets.
- Adheres to the requirement that all tools in Zikoro Credentials provide responsive and accessible user experiences across phone, tablet, and desktop viewports.

## Files Touched
- `src/app/certificate-generator/page.tsx`
- `src/components/certificate-generator/GeneratorHeader.tsx`
- `src/components/certificate-generator/TemplateSelector.tsx`
- `src/components/certificate-generator/CanvasEditor.tsx`
- `src/components/certificate-generator/RecipientManager.tsx`
- `src/components/certificate-generator/DownloadGate.tsx`
- `src/components/home/CertificateGeneratorSection.tsx`

## Follow-ups / Known Issues
None

## Commit Message
fix(generator): make certificate generator wizard and canvas editor fully responsive
