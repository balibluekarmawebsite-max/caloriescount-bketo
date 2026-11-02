# Deploying to `caloriecounterbketo.bluekarmasecrets.com`

Target host: **Bluehost Standard Dedicated (cPanel on AlmaLinux 9)**, IP `129.121.74.170`.

This is a **static site** — once built, it's just HTML/CSS/JS files. The server
needs **no Node.js at runtime**. Node is only used to *build* the site.

Pick **Method A** (simplest) or **Method B** (git pull + build on the server).

---

## Step 1 — Create the subdomain (do this once, either method)

1. Log in to **cPanel** (from the Bluehost dashboard → Hosting → your plan → **cPanel**).
2. Open **Domains** (newer cPanel) or **Subdomains** (older).
3. Create:
   - **Subdomain:** `caloriecounterbketo`
   - **Domain:** `bluekarmasecrets.com`
   - **Document Root:** note the path cPanel fills in — usually
     `/home/<cpanel-user>/caloriecounterbketo.bluekarmasecrets.com`
     (older cPanel may suggest `public_html/caloriecounterbketo`).
4. Save. **Write that Document Root down** — both methods need it.

**DNS:** if `bluekarmasecrets.com`'s DNS is managed at Bluehost, the subdomain
resolves automatically. If DNS is elsewhere (e.g. Cloudflare), add an **A record**:
`caloriecounterbketo` → `129.121.74.170`.

**SSL:** after the files are live, go to **cPanel → SSL/TLS Status**, tick the
subdomain, and **Run AutoSSL**. Then the site works on `https://`.

---

## Method A — Build locally, upload the files (recommended, no SSH)

On your own computer:

```bash
npm install      # first time only
npm run build    # creates the dist/ folder
```

Then:

1. Zip the **contents** of `dist/` (not the `dist` folder itself) — so the zip
   contains `index.html`, `assets/`, `logo.png`, `favicon.png`, `.htaccess` at
   its top level. (I can also hand you this zip ready-made.)
2. **cPanel → File Manager** → open the subdomain's **Document Root** (Step 1).
3. **Upload** the zip there, then right-click it → **Extract**.
4. Make sure the files land **directly** in the Document Root, not inside a
   nested `dist/` folder. Turn on **Settings → Show Hidden Files** so you can
   confirm `.htaccess` is present.
5. Visit `https://caloriecounterbketo.bluekarmasecrets.com`.

To update later: rebuild, re-zip, re-upload, extract (overwrite).

---

## Method B — Pull from GitHub and build on the server (SSH)

Your dedicated server has shell access, so you can pull the repo and build there.

**1. Connect** (cPanel → **Terminal**, or SSH):

```bash
ssh <cpanel-user>@129.121.74.170
```

**2. Install Node.js once** (via nvm, no root needed):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
```

**3. Clone the repo** (it's private, so use a GitHub
[Personal Access Token](https://github.com/settings/tokens) with `repo` scope as
the password when prompted):

```bash
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/balibluekarmawebsite-max/caloriescount-bketo.git
cd caloriescount-bketo
```

**4. Build and publish** using the helper script — point it at your Document Root:

```bash
DOCROOT="/home/<cpanel-user>/caloriecounterbketo.bluekarmasecrets.com" ./scripts/deploy.sh
```

That runs `npm ci && npm run build` and copies `dist/` into the Document Root.

**To update later:**

```bash
cd ~/apps/caloriescount-bketo
git pull
DOCROOT="/home/<cpanel-user>/caloriecounterbketo.bluekarmasecrets.com" ./scripts/deploy.sh
```

> Tip: instead of copying, you can set the subdomain's Document Root directly to
> `~/apps/caloriescount-bketo/dist` in cPanel. Then `git pull && npm run build`
> alone publishes the update.

---

## Checklist

- [ ] Subdomain created, Document Root noted
- [ ] DNS resolves (`caloriecounterbketo.bluekarmasecrets.com` → your server)
- [ ] Files in the Document Root (incl. `.htaccess`)
- [ ] AutoSSL run → `https://` works
- [ ] Page loads and the WhatsApp button opens WhatsApp
