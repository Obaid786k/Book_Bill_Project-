# Bill Book — Open items, decisions and later work

One list of everything that was **skipped, postponed, or needs your decision**.
Updated every time we work on the app. Newest changes at the top of each section.

**Last updated:** 9 Nov 2026

**Signs:** 🟡 needs your decision · ⏸️ later (agreed to postpone) · 🧑‍💻 your action · ⚠️ known limit / accepted risk · ✅ done (moved to the log at the bottom)

---

## 🧑‍💻 Your actions (pending)

| # | What | Why |
|---|---|---|
| A1 | Run `npx supabase db push` | Applies **0008** (profile photo storage), **0009** (bill saved as Paid/Pending) and **0010** (Super admin numbers). Until then: photo upload fails; Paid status needs one extra server call; Super admin pages say "not set up yet". |
| A5 | ~~Make your account super admin~~ **Done 10 Nov 2026** (set `is_super_admin = true` in Supabase → Table Editor → profiles). | To add/remove an admin later: same place, true / false, then log out and in. |
| A2 | Check Supabase project **region** (Project Settings → General) | If it is not **Mumbai (ap-south-1)**, every call is ~150–250 ms slower. (Speed item F) |
| A3 | Supabase Auth → enable **"Secure email change"** (confirm on both old and new email) | Used by My profile → Change email. |
| A4 | Confirm with your CA: tobacco / special goods slab (old 28% vs new 40%) | GST rate list in `src/utils/constants.js`. |

---

## 🟡 Needs your decision

| # | Topic | Options / my suggestion |
|---|---|---|
| D1 | **Super admin open to everyone** (testing mode) | Sidebar shows it to all, `/admin` route guard is off. Close before real users: set `ADMIN_OPEN_FOR_TESTING = false` in `src/components/shell/Sidebar.jsx` and re-enable the guard in `SuperAdminRoute.jsx`. *(was #9)* |
| D2 | **Invoice date rule** (past / future) | Now any date is allowed. GST says invoice on or before the date of supply. Suggestion: allow a few days either way, or warn instead of block. |
| D3 | **Due Date visibility** | Shows only for Pending bills (paid bills have no due date). Option (a) small hint under Status, or (b) always show the row greyed "—" when Paid. |
| D4 | **Correcting an issued invoice** | Today: edit + "Update & print" (with a warning). GST-correct way: **credit / debit note**, and lock bills once that month's GSTR-1 is filed. Bigger feature. |
| D5 | **Account delete** | Did not exist before. Can add under Account → Security with "type your email to confirm". Needs migration (server-side delete of login + business data). |
| D6 | **Unused database objects** (from earlier phases) | `notifications` table, alert toggles, audit-log timeline, `admin_platform_stats` exist but are not shown in the app. Keep for later or drop in a new migration. |
| D7 | **Old cash-memo bills marked Pending with a due date** | Bills saved before the Paid/Pending fix may show as Overdue. Fix by hand in Bill History, or a one-time cleanup migration. |
| D8 | **Product price includes GST?** | Products have no "price includes GST" flag. With "Incl. GST" bills, catalog rate is read as GST-inclusive. Option: add a flag per product. |
| D9 | **Remembered values not cleared on logout** (your choice) | Kept 7 days in this browser, bank numbers never stored. Revisit if shop computers are shared. |
| D10 | **Profit report** | Needs a **cost / purchase price** per product (not stored today). Revenue page now shows Revenue + GST instead of the old fake Profit line. |

---

## ⏸️ Later (agreed to postpone)

| # | Item | Notes |
|---|---|---|
| L1 | **Saved customers** (customer list in the database) | New Bill #18. Partly covered by the 7-day recall + customers from saved bills. Full version needs a `customers` table. |
| L2 | **"New invoice" after opening an old bill keeps that bill's shop details** | New Bill #24 — excluded by you. Fix: reload shop details from Business profile on reset. |
| L3 | **Shorter animations** (fade 250 → 120 ms) | Speed item E. |
| L4 | **Search / Ctrl+K command palette** | To be designed later. Removed from sidebar for now. |
| L6 | **Bill list paging** (20 at a time + search/filter) | Only matters with hundreds of bills. *(was #26)* |
| L7 | **RLS speed tweak** (faster database row rules) | Same rules, faster on big tables; re-creates every rule. *(was #27)* |
| L8 | **Error-logger limit** | Rate-limit `log_client_event`. Low risk. *(was #12)* |
| L9 | **Google sign-in** | Not built. My profile already falls back to Google name/photo when it exists. |
| L10 | **Partial payment status** | Only Paid / Pending today. |
| L11 | **Keyboard shortcuts screen** + proper **Help & support** page | Help currently opens the FAQ page. |
| L12 | **Coming soon features** | Appearance settings, CSV export, custom report builder, product import/export, GST "auto" mode. |
| L13 | **Old lint warnings (10)** | Unused vars in `SuperAdminRoute.jsx`, `EmailVerification.jsx`, `EmailConfirmed.jsx`, `Contact.jsx`, and hook-dependency warnings in a few list pages. Harmless. |
| L14 | **Server-side totals for reports** | Dashboard / Insights now calculate from all your bills in the browser (fine for thousands of bills). For very large shops, move these sums into database functions. |
| L15 | **"After printing" setting** | Option in Invoice preferences: stay on the bill (now) or start a new bill automatically. |
| L16 | **Super admin: backup list** | Backup list/schedule is only in the Supabase Management API (needs a secret token, so a server-side Edge Function). Page shows real database size + link to Supabase for now. |
| L17 | **Super admin role** | Decided 10 Nov 2026: role = `profiles.is_super_admin` (default false for every user, new sign-ups too). Changed only from the Supabase dashboard; every change is in the activity log. |

---

## ⚠️ Known limits / accepted risks

- **Marketing home page** still shows a demo dashboard with sample numbers (`src/services/sampleData.js`) — visitors have no data. The real app never uses it.
- **Account → Storage** is an estimate from the size of your saved records; the plan limit lives in Supabase.
- **Data cache:** pages remember loaded data for up to 3 minutes; changes from another device show after that (any save in this app refreshes at once). `src/lib/dataCache.js`
- **Profile photos** are in a public bucket: anyone with the exact link can see the photo. Normal for avatars.
- **Printed invoice changes** from recent work: Status line, due date only on Pending bills, icons instead of emojis, Indian number format, Discount line, rounded item box, "Rate incl. GST" header when prices include GST, dates as "09 Nov 2026", table amounts in black (was navy), darker grey for small text.

---

## ✅ Done log (short)

- **10 Nov 2026** — Super admin closed for normal users: sidebar item + /admin pages only when `profiles.is_super_admin = true`. Others see "Permission denied".
- **9 Nov 2026** — Super admin pages restored to their old layout with **real** numbers (migration **0010**): Platform health (users, businesses, bills, errors 24h, database uptime), User statistics (registered, verified, active 24h / 7 days, 7-day sign-ups), Database health (status, cache hit, connections, size, rows read/written, tables), Storage (database + file buckets), Performance (query time, error rate, queries/min, heaviest app queries), System logs (activity log of all businesses, Error/Warn/Info). Backups: real size + link.
- **9 Nov 2026** — All sample data removed from the app: Dashboard, Insights (Overview, Revenue, Bills, GST, Payments), Product analytics, Account (overview, storage, usage, security) and Super admin now use real data (`src/services/analytics.js`). Empty states for new accounts.
- **9 Nov 2026** — After printing: green "INV-… saved" bar with New bill (Alt+N), Reprint, View in Bill History.
- **9 Nov 2026** — App not loading: `index.html` had become empty (0 bytes, 17:42). Restored from the project zip copy; login and home pages render again.
- **9 Nov 2026** — Invoice look: dates shown as "09 Nov 2026" on the same right edge as the invoice number (click to type, icon for calendar); one colour scale (navy headings · ink values · ink2 labels · darker muted helper text) and one line-height; empty-field hints no longer print.
- **9 Nov 2026** — New Bill shows what you are working on: "Edit bill · INV-…" / "Draft · …" title, coloured label under it, "Update & print" button, one-time warning before changing an issued invoice.
- **9 Nov 2026** — Discount total line; Round off explained (works, 0 when total is whole rupees).
- **9 Nov 2026** — Items box rounded on all corners; Unit column wider; default 0/1 replaced when typing.
- **9 Nov 2026** — Suggestions from earlier bills (customers auto-fill, phone, GSTIN, UPI, IFSC, HSN); 7-day browser memory; bank numbers only from saved bills.
- **9 Nov 2026** — One draft per bill (updates in place, deleted after print); drafts left→right; Add item under the table + optional Quick bar (5 s auto-hide, not sticky); Ctrl+Enter / Enter / Ctrl+S / Ctrl+P; typeable dates + app calendar; bullet terms (max 6) and growing text boxes (nothing cut in print).
- **9 Nov 2026** — New Bill audit fixes 1–23 (except 18, 24): Paid/Pending status (0009), dates, qty 0, cancelled bills view-only, GSTIN checks, shared dialogs, no emojis, new settings bar, Indian number format, etc.
- **9 Nov 2026** — Speed: removed fake waits, data cache, per-page code splitting (first download 1.46 MB → 269 KB), one login query. *(earlier #23, #28, #29 covered)*
- **9 Nov 2026** — New app shell, sidebar, profile popup, notifications, page headers, Dashboard redesign, shared charts, My profile page (0008).
