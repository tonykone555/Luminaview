# Lumina View Live

Production-oriented static frontend connected to the existing Lumina Supabase backend.

## Live capabilities
- Supabase Auth with first-user owner bootstrap
- RLS-protected internal View access
- Live merchant graph
- CSV merchant import
- Merchant 360
- Evidence-backed scoring through `view-ops`
- Personalized outreach drafting
- Human approval queue
- Resend delivery hook (activates only when server-side Resend secrets are configured)
- Booking feed from the existing Lumina website
- Partnerships, catalog, revenue, jobs and source registry views
- View AI command layer
- Shared demo + booking settings
- AI Visibility prospect engine with competitor visibility, buyer-intent gaps, report structure and outreach preview

Do not place service-role keys or email provider secrets in this frontend.

The AI Visibility screen only treats competitor data as real after evidence has been captured from connected providers. Example data is explicitly labeled.