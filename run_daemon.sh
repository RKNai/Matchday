#!/bin/bash
# MatchDay Live Scores Daemon Runner
# Runs the scrape_matches.py loop and auto-restarts in case of crashes.

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "[MatchDay Daemon] Starting live scores scraper loop (10s intervals)..."

while true; do
  # Run the python script in loop mode
  python3 scrape_matches.py --loop
  
  # If the python script exits (e.g. due to syntax error or unhandled exceptions),
  # wait 5 seconds and restart the daemon loop.
  echo "[MatchDay Daemon] Scraper loop process exited. Auto-restarting in 5 seconds..."
  sleep 5
done
