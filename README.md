# GraceShare · 恩典流转站

> **Share the love, save the earth.** · 传递爱心，做资源的好管家

A bilingual (English / 中文) community lending platform where neighbours share household items instead of buying new ones — reducing waste, saving money, and passing on abundance to one another.

**Live site → [kitchenlib.netlify.app](https://kitchenlib.netlify.app)**

---

## Features

- **Browse & search** items available to borrow in your community
- **List items** with up to 4 photos, title auto-translated EN ↔ ZH
- **AI descriptions** — Gemini 2.0 Flash auto-generates a short bilingual description from the item title
- **Borrow flow** — contact the owner directly via email
- **Google Sign-In** — one-click, no passwords
- **Bilingual UI** — full English / Chinese with locale switching
- **Admin panel** — manage all items and users, promote/demote admins

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v4 · Google OAuth |
| Database | PostgreSQL (Neon) · Prisma ORM |
| File storage | UploadThing (up to 4 photos per item) |
| i18n | next-intl (EN / ZH) |
| AI | Google Gemini 2.0 Flash |
| Deployment | Netlify |

---

## Getting Started

```bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Run locally
npm run dev
```

### Required environment variables (`.env.local`)

```env
DATABASE_URL=          # PostgreSQL connection string (Neon recommended)
NEXTAUTH_SECRET=       # Random secret — openssl rand -base64 32
NEXTAUTH_URL=          # http://localhost:3000 (locally)
GOOGLE_CLIENT_ID=      # Google OAuth — console.cloud.google.com
GOOGLE_CLIENT_SECRET=
UPLOADTHING_TOKEN=     # UploadThing dashboard token (starts with eyJ...)
GEMINI_API_KEY=        # Google AI Studio — aistudio.google.com
```

### Making yourself an Admin

After signing in once, run this SQL on your database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Project Structure

```
app/
  [locale]/           # All pages (en / zh routing)
    page.tsx          # Home — browse items
    my-items/         # Manage your listings
    items/[id]/       # Item detail
    admin/            # Admin dashboard
  api/
    items/            # CRUD + Gemini description generation
    admin/users/      # User management (admin only)
    translate/        # MyMemory bilingual translation proxy
components/
  items/              # ItemCard, ItemForm, ItemFilters, MyItemsList, etc.
  layout/             # Navbar, Footer, ToastProvider
messages/
  en.json             # English strings
  zh.json             # Chinese strings
lib/
  gemini.ts           # Gemini AI description generator
  translate.ts        # MyMemory translation utility
prisma/
  schema.prisma       # Database schema
```

---

## Contact

**Paul Liu · 刘苏阳**
[Paul.sy.liu@gmail.com](mailto:Paul.sy.liu@gmail.com)

---

## License

Personal / community project. Free to fork and adapt for your own community.
