# AS Hosting

Private club management + public static hosting for Ashford School Hack Club.

## What is AS Hosting?

AS Hosting is a management platform for Ashford School Hack Club with a public static website hosting layer. Club leaders can manage users, deploy static websites from Git repositories, and track hosting usage.

### Features

- **User Management**: Main leader, co-leaders, and ambassadors with role-based permissions
- **Website Hosting**: Deploy static sites from public Git repositories
- **Public URLs**: Hosted sites are publicly accessible at `/<slug>/`
- **Archive/Relaunch**: Stop serving without deleting, restore when needed
- **Expiry**: Optional expiration dates for hosted sites
- **Storage Tracking**: Monitor disk usage across all hosted sites
- **Audit Log**: Track all administrative actions
- **Slack Notifications**: Get notified about deployments and account changes

## Tech Stack

- **Frontend**: SvelteKit, TypeScript, Tailwind CSS
- **Backend**: SvelteKit (Node.js adapter)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Argon2id password hashing, secure HTTP-only sessions
- **Deployment**: Git clone + static file serving

## Local Mac Setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd as-hosting

# Install dependencies
npm install

# Start PostgreSQL
docker compose up -d

# Set up environment
cp .env.example .env

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

Open http://localhost:5173 to see the first-run setup.

### Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/as_hosting
SESSION_SECRET=change-this-to-a-random-string
PUBLIC_BASE_URL=http://localhost:5173
NODE_ENV=development
PORT=5173

# Optional: Slack bot for notifications
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
```

## First-Run Setup

When you first open AS Hosting with an empty database:

1. Enter your name, Slack ID, and password
2. You become the **Main Leader** with full control
3. The club "Ashford School Hack Club" is initialized automatically

## Creating Users

### Co-Leaders (max 2)

1. Go to Settings → People
2. Click "+ Add co-leader"
3. Enter their name and Slack ID
4. They create their own password on first login

### Ambassadors

1. Go to Settings → People
2. Click "+ Add ambassador"
3. Enter name, Slack ID, and permission level:
   - **Viewer**: Can view dashboard and websites
   - **Leader-equivalent**: Can also deploy and manage websites

## Deploying Websites

### Create a Website

1. Click "+ Add website" on the dashboard
2. Enter:
   - **Website name**: Display name
   - **Git repository URL**: Public HTTPS URL (e.g., `https://github.com/user/project`)
   - **Project slug**: URL path (auto-generated from name)
   - **Expiry date**: Optional

3. Click "Deploy website"

### Requirements

- Repository must be publicly accessible
- Must contain `index.html` at root
- No build step required (static files only)

### Public URL

Once deployed, your site is live at:

```
https://your-domain.com/<project-slug>/
```

## Managing Websites

- **Redeploy**: Pull latest changes from Git
- **Archive**: Stop serving (files retained)
- **Relaunch**: Restore archived site
- **Delete**: Permanently remove archived files

## Production Deployment

### Debian Server Setup

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql

# Create database
sudo -u postgres createdb as_hosting

# Clone and build
git clone <repo-url>
cd as-hosting
npm install
npm run build

# Set up environment
cp .env.example .env
# Edit .env with production values

# Run migrations
npm run db:push

# Start with PM2
pm2 start build/index.js --name as-hosting
pm2 save
```

### Reverse Proxy (Caddy)

```
as-hosting.dino.icu {
    reverse_proxy localhost:5173
}
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name as-hosting.dino.icu;

    ssl_certificate /etc/letsencrypt/live/as-hosting.dino.icu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/as-hosting.dino.icu/privkey.pem;

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### DNS Configuration

Point your domain to the server:

```
as-hosting.dino.icu.  IN  A      <server-ip>
as-hosting.dino.icu.  IN  AAAA   <server-ipv6>
```

## Backups

### Database

```bash
pg_dump -U postgres as_hosting > backup_$(date +%Y%m%d).sql
```

### Hosting Storage

```bash
tar -czf hosting_backup_$(date +%Y%m%d).tar.gz data/websites/
```

### Automated Backups

Add to crontab:

```bash
# Daily at 2am
0 2 * * * cd /path/to/as-hosting && pg_dump -U postgres as_hosting | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
0 2 * * * tar -czf /backups/hosting_$(date +\%Y\%m\%d).tar.gz /path/to/as-hosting/data/websites/
```

## Security

- Passwords hashed with Argon2id
- HTTP-only, Secure, SameSite cookies
- Rate limiting on login attempts
- Path traversal prevention for hosted files
- CSRF protection
- No secrets exposed to hosted websites
- Audit logging for all admin actions

## API Endpoints

- `GET /health` - Health check
- `GET /health/db` - Database health check
- `POST /api/auth/logout` - Logout
- `POST /api/settings/password` - Change password

## License

Ashford School Hack Club
