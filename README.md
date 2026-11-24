# Blazly

A free directory where people can discover AI tools, software, startups, and businesses, and submit their own listing for review.

Submissions are free. There is no checkout, subscription, or paid placement.

Listings, categories, and accounts are stored in Cloud Firestore for the Firebase project `blazly-founding-member`. Passwords are handled by Firebase Authentication, not stored in the directory database.

## Run it

```bash
npm install
npm run db:setup
npm run dev
```

Open http://localhost:3000.

Before the first seed, in the Firebase console:

1. Create a Firestore database.
2. Enable Authentication → Email/Password.
3. Publish `firestore.rules` (Firestore → Rules). The rules file in this project keeps pending listings private and limits writes to the account that owns them.

## Admin page

Open `/admin` and enter the `ADMIN_PASSWORD` from `.env`. That page lists every submitted listing. From there you can approve, reject, edit, or feature a listing. New submissions stay pending until they are approved. Only approved listings are public.

Password reset emails are sent by Firebase Authentication.
