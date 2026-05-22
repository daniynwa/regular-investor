# Deployment Guide — aaPanel + Node.js + MySQL

## Prerequisites
- aaPanel installed on your VPS
- Node.js 20+ (install via aaPanel → App Store → Node.js)
- MySQL / MariaDB (install via aaPanel → App Store)
- PM2 (install via aaPanel → App Store or `npm i -g pm2`)

---

## 1. Database Setup

In aaPanel → Database → MySQL, create:
- **Database name**: `regular_investor`
- **User**: `ri_user`
- **Password**: *(choose a strong password)*

Then import the schema and seed data:

```bash
mysql -u ri_user -p regular_investor < database/schema.sql
mysql -u ri_user -p regular_investor < database/seed.sql
```

---

## 2. Environment Variables

Copy and edit the `.env` file on the server:

```bash
cp .env .env.production
nano .env
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=ri_user
DB_PASSWORD=your_strong_password
DB_NAME=regular_investor

ADMIN_PASSWORD=choose_a_strong_admin_password
ADMIN_SECRET=generate_32char_random_string_here
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Build the App

```bash
# On your local machine or server
npm install
npm run build
```

This outputs to `dist/` — the `dist/server/entry.mjs` is the Node.js server entry point.

---

## 4. Upload to Server

Upload the entire project directory (or just `dist/`, `node_modules/`, `.env`) to your server.

Recommended path: `/www/wwwroot/regular-investor/`

---

## 5. Start with PM2

```bash
cd /www/wwwroot/regular-investor

# Start the app
pm2 start dist/server/entry.mjs \
  --name regular-investor \
  --env production \
  -- --host 127.0.0.1 --port 3000

# Save PM2 config (auto-restart on reboot)
pm2 save
pm2 startup
```

The app runs on `http://127.0.0.1:3000` internally.

---

## 6. Nginx Reverse Proxy (aaPanel)

In aaPanel → Website → Add Site:
- Domain: `regular-investor.com`
- Root: `/www/wwwroot/regular-investor/dist/client` *(for static files)*

Then in **Site Settings → Reverse Proxy**, add:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

Or paste this directly into the site's Nginx config file.

---

## 7. SSL Certificate

In aaPanel → Website → SSL → Let's Encrypt — issue a free certificate for your domain.

---

## 8. Verify

- Site: `https://regular-investor.com`
- Admin: `https://regular-investor.com/admin`
- Dashboard: `https://regular-investor.com/admin/dashboard`

---

## Common Commands

```bash
# View logs
pm2 logs regular-investor

# Restart after update
npm run build
pm2 restart regular-investor

# Stop
pm2 stop regular-investor

# Monitor
pm2 monit
```

---

## Admin Panel

| URL | Description |
|-----|-------------|
| `/admin` | Login page |
| `/admin/dashboard` | Article list + stats |
| `/admin/articles/new` | Create new article |
| `/admin/articles/:id` | Edit / delete article |

Default admin password is set in `.env` → `ADMIN_PASSWORD`.
