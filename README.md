# GraceShare · 恩典流转站

> **Share the love, save the earth.** · 传递爱心，做资源的好管家

A bilingual (English / 中文) community lending platform where neighbours share household items instead of buying new ones — reducing waste, saving money, and passing on abundance to one another.

Built for **MCDC** (Melbourne Chinese Discipleship Community).

**Live site → [kitchenlib.netlify.app](https://kitchenlib.netlify.app)**

---

## Features

| Feature | Details |
|---|---|
| **Browse & Search** | Home page grid with keyword search across EN and ZH titles + descriptions |
| **Item Listings** | Up to 4 photos per item, availability badge, owner info |
| **Add / Edit Items** | Photo upload via UploadThing; title auto-translated EN ↔ ZH |
| **AI Descriptions** | Gemini auto-generates bilingual descriptions when an item is created |
| **Borrow Flow** | Contact the owner directly via email from the item detail page |
| **Google Sign-In** | NextAuth.js with Google OAuth — one-click, no passwords |
| **Bilingual UI** | Full English / Chinese toggle, all strings i18n'd via next-intl |
| **Admin Dashboard** | Edit/delete any item, manage users, promote/demote admins, bulk AI description generation |
| **Activity Log** | Admin-only audit trail (logins, item changes, user actions) — filterable by date and action type |
| **Share Buttons** | WhatsApp and WeChat QR share on every item detail page |
| **PWA** | Installable on Android/iOS via "Add to Home Screen" |
| **Auto Cron** | Netlify scheduled function runs every 2 hours to generate missing descriptions and prune logs older than 90 days |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) — App Router, TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Auth | [NextAuth.js v4](https://next-auth.js.org/) — Google OAuth, JWT strategy |
| Database | [PostgreSQL](https://neon.tech/) via Neon (serverless) |
| ORM | [Prisma 5](https://www.prisma.io/) |
| File Uploads | [UploadThing](https://uploadthing.com/) — up to 4 photos per item |
| AI | [Google Gemini](https://ai.google.dev/) (`gemini-flash-latest`) — bilingual description generation |
| i18n | [next-intl v4](https://next-intl-docs.vercel.app/) — EN + ZH |
| Translation | [MyMemory API](https://mymemory.translated.net/) — auto title translation |
| Hosting | [Netlify](https://www.netlify.com/) |
| Cron Jobs | Netlify Scheduled Functions |

---

## Project Structure

```
mcdc-kitchen-lib/
├── app/
│   ├── [locale]/                       # All pages under /en or /zh
│   │   ├── page.tsx                    # Home page — browse & search items
│   │   ├── items/[id]/page.tsx         # Item detail + share buttons
│   │   ├── my-items/page.tsx           # Manage your own listings
│   │   └── admin/page.tsx             # Admin dashboard (ADMIN role only)
│   ├── api/
│   │   ├── items/route.ts              # POST — create item (+ auto-translate + Gemini)
│   │   ├── items/[id]/route.ts         # PUT (edit), PATCH (toggle status), DELETE
│   │   ├── admin/
│   │   │   ├── generate-description/   # Gemini single + bulk description generation
│   │   │   ├── users/[id]/             # Role toggle, user delete
│   │   │   └── activity/              # Activity log API — date/action filter, paginated
│   │   └── cron/
│   │       └── generate-descriptions/  # Called by Netlify scheduled function
│   └── layout.tsx                      # Root layout — PWA manifest, favicon, meta tags
├── components/
│   ├── items/
│   │   ├── ItemCard.tsx                # Home page card (photo, title, description, status)
│   │   ├── ItemForm.tsx                # Add/edit modal — supports bothLanguages admin mode
│   │   ├── ItemFilters.tsx             # Search bar + results count
│   │   ├── MyItemsList.tsx             # User's item list with status toggle
│   │   ├── AdminItemsTable.tsx         # Admin items + users + AI generation panel
│   │   ├── ImageGallery.tsx            # Interactive photo gallery (item detail page)
│   │   ├── ContactOwnerButton.tsx      # Email copy button
│   │   └── ShareButtons.tsx            # WhatsApp + WeChat QR + copy link
│   ├── admin/
│   │   └── ActivityLogPanel.tsx        # Audit log with date/action filters + pagination
│   ├── layout/
│   │   ├── Navbar.tsx                  # Responsive nav, locale switcher, auth buttons
│   │   ├── Footer.tsx
│   │   ├── SessionProvider.tsx         # NextAuth session wrapper
│   │   └── ToastProvider.tsx           # Global toast notifications
│   └── ui/
│       └── ConfirmDialog.tsx           # Reusable confirm modal
├── lib/
│   ├── auth.ts                         # NextAuth config + login event logging
│   ├── prisma.ts                       # Prisma client singleton
│   ├── gemini.ts                       # Gemini API wrapper — returns { result } | { error }
│   ├── translate.ts                    # MyMemory EN↔ZH title translation
│   └── activity.ts                     # Fire-and-forget activity logger
├── messages/
│   ├── en.json                         # All English UI strings
│   └── zh.json                         # All Chinese UI strings
├── prisma/
│   └── schema.prisma                   # Full DB schema
├── netlify/
│   └── functions/
│       └── generate-descriptions.mts   # Netlify cron — runs every 2 hours
└── public/
    ├── favicon.svg
    ├── icon-192.png                    # PWA icon
    ├── icon-512.png                    # PWA icon
    └── manifest.json                   # PWA manifest
```

---

## Database Schema

```prisma
model User {
  id    String  @id @default(cuid())
  name  String?
  email String? @unique
  role  String  @default("USER")   // "USER" | "ADMIN"
  items Item[]
  activityLogs ActivityLog[]
}

model Item {
  id            String   @id @default(cuid())
  title         String
  titleZh       String?
  description   String?             // Auto-generated by Gemini
  descriptionZh String?
  imageUrls     String[]            // Up to 4 UploadThing URLs
  status        String   @default("AVAILABLE")  // "AVAILABLE" | "BORROWED"
  createdAt     DateTime @default(now())
  ownerId       String
  owner         User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
}

model ActivityLog {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  userId    String?                 // SetNull on user delete — logs survive
  userName  String?                 // Snapshot at log time
  userEmail String?
  action    String                  // LOGIN | ITEM_CREATE | ITEM_EDIT | ITEM_DELETE
                                    // STATUS_CHANGE | USER_ROLE_CHANGE | USER_DELETE
                                    // DESCRIPTION_GENERATE
  target    String?                 // Item title or affected user name
  detail    String?                 // e.g. "AVAILABLE → BORROWED"
}
```

---

## Getting Started (Local Dev)

### 1. Clone and install

```bash
git clone https://github.com/SuyangLiuPaul/mcdc-kitchen-lib.git
cd mcdc-kitchen-lib
npm install
```

### 2. Set up environment variables

Create `.env.local`:

```env
# PostgreSQL (Neon recommended)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=         # openssl rand -base64 32

# Google OAuth — console.cloud.google.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# UploadThing — uploadthing.com dashboard
UPLOADTHING_TOKEN=

# Google Gemini — aistudio.google.com
GEMINI_API_KEY=

# Cron endpoint protection (any random string)
CRON_SECRET=
```

### 3. Push database schema

```bash
npx prisma db push
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it will redirect to `/en`.

---

## User Roles

| Role | Permissions |
|---|---|
| **Guest** | Browse all items, view item details |
| **User** | Above + add/edit/delete own items, toggle borrow status |
| **Admin** | Above + edit/delete any item, manage users, bulk AI descriptions, view activity log |

The first admin must be set directly in the database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

After that, admins can promote others from the dashboard.

---

## How AI Descriptions Work

1. User adds an item with a title (e.g. "Drill")
2. On save, the server calls Gemini with a prompt requesting a raw JSON `{ "en": "...", "zh": "..." }`
3. The result is saved to `description` and `descriptionZh` — no extra step needed
4. If generation fails (quota, network), the item saves without a description and the cron will retry within 2 hours
5. Admins can manually edit or regenerate any description from the dashboard

---

## Cron Job

A Netlify Scheduled Function (`netlify/functions/generate-descriptions.mts`) runs every 2 hours:

1. Finds all items with `description = null`
2. Calls Gemini for each (600ms delay between requests to respect rate limits)
3. Deletes `ActivityLog` entries older than 90 days

The cron hits `GET /api/cron/generate-descriptions?secret=CRON_SECRET` — the `CRON_SECRET` env var must be set in both Netlify and your `.env.local`.

---

## Deployment (Netlify)

1. Connect the GitHub repo in the Netlify dashboard
2. Set all environment variables under **Site Settings → Environment Variables**
3. Build command: `npm run build`
4. Publish directory: `.next`
5. The Netlify Next.js plugin is auto-detected

---

## Contact

Built and maintained by **Paul Liu · 刘苏阳**
[Paul.sy.liu@gmail.com](mailto:Paul.sy.liu@gmail.com)

---

## License

Personal / community project. Free to fork and adapt for your own community.
