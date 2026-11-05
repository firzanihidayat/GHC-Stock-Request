# Go Hub Capital — Stock Request Management System

Small assignment prototype. Frontend: vanilla HTML/CSS/JavaScript + Vite. Backend: Vercel Functions. Data: Supabase PostgreSQL with 2 existing tables (`item`, `stock_request`).

## Security design
- **No Supabase secret / service role key in the browser.** Both reads and writes go via Vercel `/api` functions.
- Existing database RLS and `REVOKE` settings can remain unchanged; secret key is server-side only.
- Staff request submission requires a shared access code set in Vercel environment variable `STAFF_ACCESS_CODE`. It is a lightweight demo gate, **not individual authentication**; staff identities are self-declared.
- The public `/api/items` endpoint exposes item names, categories, and stock quantities. Do not use for confidential inventory.
- Public endpoints still require production controls such as rate limiting, bot protection, monitoring and (for real company usage) staff authentication. This is a **demonstration prototype**, not production-ready.
- Requests are stored as `Pending`; stock quantity is **not automatically deducted**.

## Setup (online)
1. Download and unzip the project. Create a **GitHub repository** and upload the contents (do not upload secrets).
2. Open `https://stackblitz.com/github/YOUR_USERNAME/YOUR_REPO` to edit in browser. StackBlitz/Vite preview uses **sample items only**; requests are not saved in preview mode because Vercel serverless functions are not running there.
3. Import GitHub repository into Vercel. Framework preset: Vite / Other if detected, build command `npm run build`, output `dist`.
4. In Vercel **Settings > Environment Variables**, configure:
   - `SUPABASE_URL`: your Supabase project URL
   - `SUPABASE_SECRET_KEY`: Supabase secret (`sb_secret_...`) or legacy `service_role` key, **server only**
   - `STAFF_ACCESS_CODE`: a unique shared demo code (do not put in client source)
5. Redeploy after changing environment variables.
6. Open the deployed Vercel URL. Search an item; choose Request; enter name, email, quantity and staff access code.
7. In Supabase Table Editor inspect `stock_request`. Ensure new request appears with `Pending` status.

## Existing SQL schema required
`item`: item_id (bigint PK), item_name (text), category (text), quantity_available (integer).
`stock_request`: request_id (bigint PK), item_id (bigint FK), requester_name (text), requester_email (text), quantity_requested (integer), request_date (timestamptz default now()), request_status (text default 'Pending').

## Limits
No admin dashboard or login. No user-specific request history because no identity verification. No stock deductions or approval workflow. Shared access code does not provide strong authorization. Search uses JavaScript on a small item list. No extra database tables required.
