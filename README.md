# Wok & Roll 🎸

A bilingual community appliance-sharing platform built for the **MCDC church community**. Members can list household appliances they're willing to lend, and others can browse and borrow them — helping reduce waste and build community.

**Live site:** [kitchenlib.netlify.app](https://kitchenlib.netlify.app)

---

## Features

- **Browse & search** available items by name or category
- **List items** to share with the community (with photo upload)
- **Google sign-in** — no password needed
- **Bilingual** — full English and Chinese (中文) support
- **Admin dashboard** — manage all listings and users
- **Role-based access** — USER and ADMIN roles

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | [NextAuth.js v4](https://next-auth.js.org) + Google OAuth |
| Database | PostgreSQL ([Neon](https://neon.tech)) |
| ORM | [Prisma v7](https://www.prisma.io) |
| Image uploads | [UploadThing](https://uploadthing.com) |
| i18n | [next-intl](https://next-intl-docs.vercel.app) |
| Deployment | [Netlify](https://netlify.com) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech) free tier)
- A Google OAuth app ([console.cloud.google.com](https://console.cloud.google.com))
- An UploadThing account ([uploadthing.com](https://uploadthing.com))

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/SuyangLiuPaul/mcdc-kitchen-lib.git
   cd mcdc-kitchen-lib
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   UPLOADTHING_TOKEN="..."
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Making Yourself an Admin

After signing in once, run this SQL on your database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
```

The Admin Dashboard will then appear in the navbar.

---

## Google OAuth — Authorized Redirect URIs

In [Google Cloud Console](https://console.cloud.google.com), add these redirect URIs to your OAuth client:

```
http://localhost:3000/api/auth/callback/google
https://kitchenlib.netlify.app/api/auth/callback/google
```

---

## Deployment

The app is deployed on Netlify with automatic deploys from the `main` branch. Set these environment variables in **Netlify → Site → Environment variables**:

```
NEXTAUTH_URL=https://kitchenlib.netlify.app
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DATABASE_URL=...
UPLOADTHING_TOKEN=...
```

---

## Project Structure

```
app/
  [locale]/           # All pages (en/zh routing)
    page.tsx          # Home — browse items
    my-items/         # Manage your listings
    items/[id]/       # Item detail
    admin/            # Admin dashboard
  api/
    auth/             # NextAuth handler
    items/            # CRUD API routes
components/
  items/              # ItemCard, ItemForm, ItemFilters, etc.
  layout/             # Navbar, SessionProvider
messages/
  en.json             # English translations
  zh.json             # Chinese translations
prisma/
  schema.prisma       # Database schema
```

---

## License

Built with love for the MCDC community.
