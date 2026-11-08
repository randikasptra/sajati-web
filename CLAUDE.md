# SAJATI — Project Instructions for Claude

## Project overview

SAJATI means **Sistem Jejaring Sampah Bernilai dan Terintegrasi**. It is a planned waste-management innovation for Kabupaten Tasikmalaya, designed to connect residents, village waste managers, subdistrict coordinators, the regency-level BUMD, buyers/processors, and Kopdes (Koperasi Desa/Kelurahan Merah Putih) in one coordinated system.

This project is currently a **static frontend prototype**. Its purpose is to demonstrate the proposed workflows and user experience. It is not a launched public service.

## Non-negotiable implementation scope

- Build the prototype with frontend-only behavior and illustrative local/mock data.
- Do not connect to a backend, database, API, payment gateway, real Kopdes service, government system, or external authentication provider.
- Do not add secret keys, production credentials, or pretend external integrations are working.
- Use realistic demo interactions in the browser: navigation, filters, forms, dialogs, status changes, and totals should work against local mock data. Use local state and, when useful, `localStorage` so a demo action remains visible after refresh.
- Clearly label sample figures and records as **Data ilustrasi** or **Prototype**. Never imply that displayed money has been transferred or that a real reward is available.
- Do not fabricate official partner names, government endorsements, seals, or approvals. Use generic role names and neutral sample identities.
- Inspect the existing repository and follow its installed framework, package manager, and conventions. If this is a fresh repository, choose a simple maintainable frontend setup and explain the choice before adding unnecessary dependencies.

## System flow and business rules

### 1. Resident setoran and incentive balance

1. A resident sorts recyclable waste and brings it to the village collection point, or an assigned village operator collects it.
2. The village operator records the resident, waste category, measured weight, quality/verification, and calculated illustrative value.
3. The resident can review the setoran status, history, and balance in the Android-style resident experience.
4. In the proposed design, the village confirms the incentive balance after a setoran is verified, subject to available program funds. The prototype may update this balance immediately for demonstration, but must label the action as simulated.
5. The balance is intended to be redeemed for basic necessities through Kopdes. It is not a cash-withdrawal wallet in this design.

### 2. Material capacity and escalation

- The village first decides whether it can accept and manage the material.
- If the village cannot accept/manage it, the material may be offered to the subdistrict coordinator.
- If the subdistrict also cannot accept/manage it, the county BUMD is the final fallback route.
- Escalation is conditional on capacity; do not imply every load must pass through all three levels.
- Keep this capacity/escalation workflow distinct from the marketplace sale workflow.

### 3. Marketplace and downstream processing

- The marketplace is a separate route for matching available, sorted material with buyers or processing partners.
- Listings should show material type, volume, quality, location, availability, and order/delivery status using illustrative data.
- A completed marketplace order should show a clear receipt/confirmation state in the prototype.

### 4. Illustrative fund flow

The proposal describes program funds flowing **BUMD → Kecamatan → Desa → Resident incentive balance**. Show this as a recorded allocation/disbursement chain in dashboards and history. A simulated instant balance update is only a prototype interaction; do not confuse it with real-time inter-institution bank settlement or claim funds are actually available.

### 5. User roles and their main tasks

This promotional prototype focuses on exactly **four roles**. Do not build the full county-wide system or add separate buyer, subdistrict, BUMD, or county oversight logins in this first version. Those wider roles may be mentioned as future connections, but they are outside the demo flow.

- **Warga (Android/mobile-first):** see how to sort and submit waste, view setoran status and history, check the illustrative saldo manfaat, browse Kopdes necessities, and make a simulated redemption request.
- **Petugas/operator desa:** receive the resident's waste, record category and measured weight, verify or reject the setoran with a reason, and submit the verified record for saldo processing.
- **Admin desa:** review verified setoran, approve the illustrative incentive credit, view the resident balance and transaction record, and manage the sample Kopdes redemption record. Keep the operator's physical weighing/verification task distinct from the admin's approval/recording task.
- **Kopdes:** view a sample catalogue and stock, receive a simulated redemption request, mark it as prepared/handed over, and show redemption history. This is a mock experience, not a real Kopdes integration.

## Prototype experience

Create a coherent, clickable promotional demo rather than a collection of disconnected static screens. Provide an obvious way to explore the four roles: Warga, Petugas Desa, Admin Desa, and Kopdes. Keep role boundaries understandable and make each main action lead to a visible result. Prioritize the resident-facing app and the setoran-to-saldo story; keep administrative screens simple enough to support that story.

Use Indonesian for interface copy. Prefer concise, natural Indonesian and clear status labels for the main demo such as **Menunggu verifikasi**, **Perlu persetujuan admin**, **Saldo ditambahkan (simulasi)**, **Menunggu penukaran**, **Disiapkan Kopdes**, and **Selesai**. Avoid bureaucratic filler and generic marketing copy.

Primary demo scenario:

1. Warga brings sorted waste → Petugas Desa weighs and records it → Admin Desa approves the verified setoran and adds an illustrative saldo manfaat → warga sees the updated balance → warga submits a simulated redemption request → Kopdes prepares/marks the goods as handed over.

Keep the capacity escalation, marketplace, and county-wide oversight flows out of the main promotional prototype. They can be noted as future development, but do not let them distract from the four-role demo.

## Brand and asset handling

- Product name: **SAJATI**.
- Full name/tagline: **Sistem Jejaring Sampah Bernilai dan Terintegrasi**.
- The approved SAJATI logo already exists and will be manually added by the project owner. Do not redraw, replace, or invent a new logo.
- Keep a clear, predictable asset location such as `public/assets/` (or the repository's existing convention). Use a clearly named placeholder path/comment until the owner adds the logo; do not ship a fake logo in its place.
- Use the logo with adequate clear space and preserve its proportions. Do not alter the logo artwork or tagline.
- Visual direction: grounded, trustworthy, civic-minded, and connected to Tasikmalaya. Use a restrained green/neutral palette as a starting point, then establish a consistent design system with intentional contrast, typography, spacing, borders, and states. Avoid turning every surface green.

## Design quality: avoid generic AI output

Treat the following references as design review principles, not as a reason to blindly install dependencies or copy their implementation:

- Anti Slop: https://github.com/miqdadbadjuber/anti-slop
- Impeccable: https://github.com/pbakaus/impeccable
- Taste Skill: https://github.com/leonxlnx/taste-skill

Apply their underlying approach: make deliberate art-direction choices, use project-specific content and real visual context, critique the result, and refine it in a browser. Do not settle for the first generic layout generated from a vague prompt.

Avoid recognizable AI-template patterns unless a specific screen truly benefits from them:

- no default purple/blue gradient hero, glowing gradients, glassmorphism, or decorative blobs;
- no repeated grid of identical rounded cards for every section;
- no oversized marketing headline followed by generic feature cards and fake testimonials;
- no meaningless charts, arbitrary metrics, emoji-heavy navigation, or placeholder filler;
- no excessive pills, shadows, gradients, rounded corners, or icons used only as decoration;
- no fake device frames for every screen and no fabricated partner logos;
- no generic stock imagery unrelated to waste sorting, village operations, or Tasikmalaya.

Instead:

- Give each role a layout suited to its work. Residents need a simple mobile-first task flow; operators need dense but scannable tables and operational status; oversight needs a restrained data overview with useful drill-downs.
- Create hierarchy through typography, spacing, alignment, and a small number of meaningful accent colors, not through decoration everywhere.
- Make sample charts and totals traceable to the mock data. Include units, time ranges, and empty/error/loading states where relevant.
- Use photographs or illustrations only when they add local context. Prefer user-provided assets or appropriately licensed sources, and keep an attribution note when required. Never imply a generated or stock image depicts an actual SAJATI pilot.
- Make the interface feel specific to this waste-management workflow: waste categories, weights, verification, capacity, routing, sale/receipt, incentive allocations, and Kopdes redemption.
- Before finishing, inspect the rendered screens at desktop and mobile widths. Check for overflow, weak contrast, illegible text, inconsistent spacing, dead controls, and visual repetition. Revise the interface based on that review.

## Accessibility and usability

- Use semantic HTML and accessible labels for controls.
- Ensure keyboard navigation and visible focus states.
- Maintain readable contrast and text sizes, especially for operational tables and mobile screens.
- Do not communicate status by color alone; pair color with text or an icon label.
- Confirm destructive or consequential demo actions before changing state, and provide clear feedback after actions.

## Engineering expectations

- Keep components and mock data organized by domain/role; avoid one giant page/component.
- Use consistent formatting, reusable primitives where they improve consistency, and responsive layouts.
- Keep all mock data local and easy to replace later with API calls, without adding a backend abstraction that is unnecessary for this prototype.
- Add no dependency unless it materially helps the prototype and fits the current project stack.
- Run the available lint/build/type checks after implementation. Resolve issues caused by the changes.
- Summarize what works as a prototype and explicitly state that no backend or real financial integration is connected.
