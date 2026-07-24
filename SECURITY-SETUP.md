# Security Setup — Required Before Deploying

Code fixes are done. These steps need **your** action; the code cannot do them for itself.

---

## 1. Firestore rules — DO THIS FIRST (critical)

Your `orders` collection is currently readable and writable by anyone who has the
public web API key, and that key is visible in the site's JavaScript. That means
**customer names, emails, phone numbers, and home addresses may be publicly
readable right now.**

Go to **Firebase Console → Firestore Database → Rules** and replace them with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      // No browser may read or write orders. The server uses admin
      // credentials, which bypass these rules.
      allow read, write: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click **Publish**.

After publishing, the server needs credentials to keep working — see step 3.

---

## 2. Admin credentials (required — admin is disabled without these)

The admin email, password, and session secret used to be hardcoded in the source
code, so anyone reading the repo could sign in. They have been removed. Admin now
refuses to run until you set real values.

Add these in **Vercel → Project → Settings → Environment Variables** (and in
`.env.local` for local development):

```
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=<a long random password you have never used elsewhere>
ADMIN_SESSION_SECRET=<paste the output of the command below>
```

Generate the session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Do not reuse the old password (`mahakaswani`).** It has been in source control
and must be considered public. Change it anywhere else you used it.

---

## 3. Firebase server credentials — DONE locally, still needed on Vercel

✅ Rules published (step 1) and the service account is working locally —
verified with a real write/read/patch/list/delete against Firestore.

The credentials are already in your local `.env.local`. **They are not yet on
Vercel**, so production still cannot reach Firestore. Add these three variables
in **Vercel → Settings → Environment Variables** (select all environments):

| Name | Where to get the value |
|---|---|
| `FIREBASE_PROJECT_ID` | `pinak-jewels` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@pinak-jewels.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Copy the exact line from your local `.env.local` |

For `FIREBASE_PRIVATE_KEY`, open `.env.local`, copy everything after
`FIREBASE_PRIVATE_KEY=` **including both double quotes**, and paste it as the
value. It is one long line containing `\n` sequences — that is correct, do not
convert them to real line breaks.

Tokens are now minted automatically from this key and cached until just before
expiry, so nothing needs manual rotation.

### Keep the downloaded key file safe

`pinak-jewels-firebase-adminsdk-*.json` in your Downloads folder grants full
access to your database. Once the Vercel variables are set, move it out of
Downloads into secure storage (a password manager) or delete it — the values
already live in `.env.local` and Vercel. Never commit it.

---

## 4. Rotate anything that leaked

Because credentials were committed to source, rotate:

- [ ] Admin password (step 2)
- [ ] Gmail app password (`EMAIL_PASS`) — Google Account → Security → App passwords
- [ ] Razorpay key secret — Razorpay Dashboard → Settings → API Keys → Regenerate

Rotating the Razorpay secret requires updating `RAZORPAY_KEY_SECRET` in Vercel at
the same time, or payments will fail. Do it during a quiet period.

---

## 5. Verify after deploying

```bash
# Security headers present
curl -I https://pinakjewels.com | grep -i "x-frame-options"

# Price tampering rejected — must NOT return a total of 1
curl -X POST https://pinakjewels.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":55,"quantity":1,"price":1}]}'

# Admin locked without a session — must return 401
curl -o /dev/null -w "%{http_code}" https://pinakjewels.com/api/admin/orders
```

Then place one real ₹11 test order end to end and confirm:

- [ ] Payment succeeds and the confirmation page shows the correct total
- [ ] Confirmation email arrives for the customer
- [ ] Order notification email arrives for you
- [ ] The order appears in the admin dashboard
- [ ] Marking it Packed → Shipped (with tracking) → Delivered works
- [ ] Opening the confirmation link on a *different device* still shows the items

---

## What the code now enforces

| Area | Protection |
|---|---|
| Pricing | Server recomputes every total from `src/data/products.js`; client prices ignored |
| Coupons / shipping / gift wrap | Enforced server-side, cannot be forged |
| Payments | Timing-safe signature check; orders persisted server-side; idempotent on retry |
| Admin | HMAC sessions with 12-hour expiry, no hardcoded credentials, 5-attempt lockout |
| Forms | HTML escaping, header-injection blocking, per-IP rate limits |
| Errors | Internal details logged server-side only, never returned to callers |
| Headers | Clickjacking, MIME-sniffing, HSTS, referrer, permissions policy |
