#!/bin/bash
# MatchDay Live Scores Daemon Runner
# Runs the scrape_matches.py loop and auto-restarts in case of crashes.

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "[MatchDay Daemon] Starting live scores scraper loop (10s intervals)..."

# Configure git identity locally if not already set globally
git config --global user.name "Matchday VM Bot"
git config --global user.email "bot@matchday.com"

# Keep track of loop iteration count
counter=0

while true; do
  # Run the matches scraper every 10 seconds
  python3 -u scrape_matches.py
  
  # Check if any files inside the data/ folder have changed
  if [ -n "$(git status --porcelain data/)" ]; then
    echo "[MatchDay Daemon] New data detected! Committing and pushing to GitHub..."
    git add data/
    git commit -m "Sync scores and news feeds [skip ci]"
    
    # Push the changes to GitHub
    if git push origin main; then
      echo "[MatchDay Daemon] Successfully pushed updates to GitHub Pages."
    else
      echo "[MatchDay Daemon] Error: Git push failed. Verify your VM's GitHub credentials."
    fi
  else
    echo "[MatchDay Daemon] No new data found. Skipping git push."
  fi
  
  # Increment loop counter and sleep for 10 seconds before next check
  counter=$((counter + 1))
  sleep 10
done
