# MatchDay 🏆 — FIFA World Cup 2026 Live PWA

MatchDay is a premium, zero-dependency, progressive web app (PWA) designed to track the FIFA World Cup 2026. Built with standard HTML5, modern responsive vanilla CSS Grid/Flexbox, and a custom JavaScript state engine, it achieves instant load times, seamless vertical/horizontal resizing, offline functionality, and real-time live tickers.

---

## 🌟 Key Features

### 1. Draggable Split-Screen Layout
* **Mobile Stacked Resize**: Drag the partition divider vertically to adjust the height ratio of the matches panel and the news feed.
* **Desktop Grid Columns**: Automatically shifts to a side-by-side layout, swapping the divider to horizontal resizing coordinates.
* **Layout Presets**: Double-click or double-tap the resizer knob to cycle snaps through layout presets (even split, maximize matches, or maximize news).

### 2. Live World Cup Simulation Engine
* **Real-time Live Ticker**: Simulates live tournament progression with matching broadcast tickers.
* **Dynamic Matches Ticker**: Periodically triggers goals, yellow cards, and final whistles, flashing team scores in gold during matches.
* **Broadcast Light Dot**: Active live matches display a soft red pulsing animation (`@keyframes match-pulse-red`) showing live telemetry status.

### 3. Integrated Football Scraping Engine
* **Fixture Tracker (`scrape_matches.py`)**: A lightweight script running in python standard library to pull real tournament schedules, match numbers, stage headers, and flags.
* **Football News (`scrape_news.py`)**: A news scraper pointing to Sky Sports Football category RSS. It uses regular expressions to clean up HTML-tagged metadata and unescapes entities to output clean, structured summaries.
* **6-Way Data Categorization**: News items are parsed, sorted chronological-first, and categorized:
  1. **Injuries** (`injury`): 🩺 (Red tag)
  2. **Squads & Lineups** (`lineup`): 📋 (Blue tag)
  3. **Tactics & Previews** (`tactics`): ⚽ (Orange tag)
  4. **Transfers & Rumours** (`transfer`): 🔄 (Purple tag)
  5. **Press Talk & Quotes** (`press`): 🎙️ (Teal tag)
  6. **Rules & VAR** (`rules`): 📺 (Slate tag)

### 4. Push Alerts & Subscriptions Drawer
* **Local Storage Integration**: Subscribe to favorite teams to receive real-time notifications for kickoff, goals, and full-time scores (features backward compatibility for previous app versions).
* **Sidebar Hub Drawer**: A glassmorphic drawer containing native alerts toggle and a searchable index of all active teams.
* **Multi-Layer Push Alerts**:
  * **In-App Toast**: neon bell banner alerts sliding in with screen vibrators.
  * **Native Web Push**: Triggers system-level background notifications through Service Worker sync listeners if granted.

### 5. Detailed Translucent Overlay Modals
* **Match Detail Card**: Dynamic scale animation overlay containing tab sheets for match events timeline, colored statistics charts, and an **Interactive Visual Soccer Pitch** mapping starting lineups dynamically onto 4-3-3 positions with country colors and Home/Away selection buttons.
* **News Details Card**: Popups displaying high-res article covers, publisher branding, relative time elapsed, news tag, full snippets, and a "Read Full Story ↗" redirect button.

### 6. Personalization & Light Mode
* **Light Theme Option**: Switch color styles on-the-fly to a clean slate-gray light mode featuring Slate-900 typography, custom translucent cards, and high contrast.
* **Layout Toggle Filters**: Toggle the matches panel or news grid visibility on/off. Hiding a panel stretches the remaining active panel to full screen and hides partition resizer handles automatically.
* **Smart Visibility Guards**: Prevents users from hiding both layout panels simultaneously, popping an in-app warning toast.
* **Persistent Preferences**: Saves active language, theme choice, and visible layout modes inside `localStorage` to restore configurations on page loads.

### 7. Fluid Micro-Animations & Staggered Transitions
* **Staggered Entrance Transitions**: Cards (Matches and News) scale-in and fade-in dynamically using individual CSS transform properties (`scale` and `translate`) and `--card-index` delay offsets.
* **Transform Isolation**: Keeps entry animations separate from hover state translations (`transform: translateY(-2px)`), avoiding layout locks.

---

## 📁 File Structure

```bash
├── index.html              # Semantic HTML structure, layouts, drawer, and modal frameworks
├── style.css               # Glassmorphic tokens, CSS grid, custom scrollbars, animations
├── app.js                  # Resizer listeners, simulated game engine, alerts state, and modal loaders
├── sw.js                   # Service Worker precaching app shell & handling background push events
├── manifest.json           # PWA properties, maskable icons, and mobile shortcut entrypoints
├── scrape_matches.py       # Tournament live fixture schedule python scraper
├── scrape_news.py          # Real-time multi-feed RSS news parser & World Cup tag classifier
├── run_daemon.sh           # Cloud VM wrapper loop runner & git auto-push script
├── matchday-scraper.service # Systemd service unit template for background cloud VM execution
├── assets/
│   ├── logo.png            # Clean black and white minimalist app logo
│   ├── icon-192.png        # Maskable PWA icon (192x192)
│   └── icon-512.png        # Maskable PWA icon (512x512)
└── data/
    ├── matches.json        # Active fixtures scraper cache
    └── news.json           # Categorized news scraper cache
```

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/RKNai/Matchday.git
cd Matchday
```

### 2. Populate Scraper Cache Feeds
Run the built-in scrapers to pull active live fixtures and breaking football stories:
```bash
# Scrapes schedule fixtures
python3 scrape_matches.py

# Scrapes current football news and categorizes them
python3 scrape_news.py
```

### 3. Spin Up Local Server
Start a lightweight web server to serve static assets and test PWA functions:
```bash
python3 -m http.server 8080
```
Open your browser and navigate to `http://localhost:8080` to experience the app!

---

## ☁️ Automating the Scrapers

To keep the tournament data and news feed updated automatically, you have two primary deployment patterns:

### Option 1: Serverless Actions Scheduler (Every 10+ Minutes)
For serverless hosting (e.g. GitHub Pages, Vercel, Cloudflare Pages), you can automate the updates using a GitHub Actions runner that commits the updated JSON files back to the repository.

Create a workflow file in your repo at `.github/workflows/scraper.yml`:

```yaml
name: Matchday Ticker Scraper

on:
  schedule:
    - cron: '*/10 * * * *' # Runs every 10 minutes
  workflow_dispatch:      # Allows manual trigger

jobs:
  update-feed:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Scrape Matches
        run: python scrape_matches.py

      - name: Scrape News
        run: python scrape_news.py

      - name: Push Data Update
        run: |
          git config --global user.name "Matchday Bot"
          git config --global user.email "bot@matchday.com"
          git add data/
          git diff-index --quiet HEAD || git commit -m "Sync scores and news feeds [skip ci]"
          git push
```

### Option 2: Cloud VM Loop Daemon (Real-Time 10-Second Updates)
For dedicated cloud servers (e.g. AWS EC2, DigitalOcean, Google Compute Engine) where real-time, low-latency match results are desired, run the scraper as a daemon process.

We have included a wrapper script and Systemd service template for this purpose:
1. **Daemon Runner Script (`run_daemon.sh`)**: Executes `scrape_matches.py --loop` in a durable loop. In case of network interruptions or sudden crashes, it will pause for 5 seconds and automatically restart.
2. **Systemd Configuration (`matchday-scraper.service`)**: Daemonizes the scraper runner to start automatically on system boot and restart on failure.

#### Deployment Steps on the VM:
1. Pull the latest code on your VM:
   ```bash
   git pull origin main
   ```
2. Mark the wrapper script as executable:
   ```bash
   chmod +x run_daemon.sh
   ```
3. Copy the systemd service template:
   ```bash
   sudo cp matchday-scraper.service /etc/systemd/system/matchday-scraper.service
   ```
4. Edit `/etc/systemd/system/matchday-scraper.service` to verify `User` (default: `ubuntu`) and `WorkingDirectory` (default: `/home/ubuntu/Matchday`) match your VM user and clone path:
   ```bash
   sudo nano /etc/systemd/system/matchday-scraper.service
   ```
5. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable matchday-scraper.service
   sudo systemctl start matchday-scraper.service
   ```
6. Verify the status and view live telemetry:
   ```bash
   sudo systemctl status matchday-scraper.service
   journalctl -u matchday-scraper.service -f
   ```
