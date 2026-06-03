#!/bin/bash
# MatchDay Live Scores Daemon Runner
# Runs the scrape_matches.py loop and auto-restarts in case of crashes.

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "[MatchDay Daemon] Starting live scores scraper loop (10s intervals)..."

# Configure git identity locally if not already set globally
git config --global user.name "Matchday VM Bot"
git config --global user.email "bot@matchday.com"

while true; do
  # Run the python script once to check and update live scores
  python3 -u scrape_matches.py
  
  # Check if matches.json has changed
  if [ -n "$(git status --porcelain data/matches.json)" ]; then
    echo "[MatchDay Daemon] Scoreboard changed! Committing and pushing to GitHub..."
    git add data/matches.json
    git commit -m "Sync live scores [skip ci]"
    
    # Push the changes to GitHub
    if git push origin main; then
      echo "[MatchDay Daemon] Successfully pushed updates to GitHub Pages."
    else
      echo "[MatchDay Daemon] Error: Git push failed. Verify your VM's GitHub authentication credentials."
    fi
  fi
  
  # Sleep for 10 seconds before the next iteration
  sleep 10
done
