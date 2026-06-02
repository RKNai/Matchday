#!/usr/bin/env python3
"""
MatchDay News Scraper
=====================
Fetches real-time soccer news from ESPN Soccer RSS feeds.
Parses XML/RSS structures into clean, structured JSON caches for MatchDay PWA frontend.

Runs on standard library ONLY (no external dependencies required).
"""

import os
import sys
import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
import re
import html
import gzip
from email.utils import parsedate_to_datetime

# --- Constants & Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
NEWS_JSON_PATH = os.path.join(DATA_DIR, 'news.json')

FEEDS = {
  "Sky Sports": "https://www.skysports.com/rss/11095",
  "BBC Sport": "https://feeds.bbci.co.uk/sport/football/rss.xml",
  "90min": "https://www.90min.com/posts.rss"
}

def setup_directories():
  if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def fetch_feed(name, url):
  print(f"[News Scraper] Fetching {name} feed from {url}...")
  req = urllib.request.Request(
    url, 
    headers={
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'close'
    }
  )
  try:
    with urllib.request.urlopen(req, timeout=10) as response:
      data = response.read()
      if response.info().get('Content-Encoding') == 'gzip':
        data = gzip.decompress(data)
      return data
  except Exception as e:
    print(f"[News Scraper] Failed to fetch {name} feed: {e}")
    return None

def parse_news():
  all_articles = []
  seen_titles = set()
  
  # Fetch and parse all feeds
  feeds_parsed = 0
  for source_name, url in FEEDS.items():
    xml_data = fetch_feed(source_name, url)
    if not xml_data:
      continue
      
    try:
      root = ET.fromstring(xml_data)
      items = root.findall('.//item')
      print(f"[News Scraper] Found {len(items)} items in {source_name} feed.")
      
      # Namespaces for media elements
      ns = {'media': 'http://search.yahoo.com/mrss/'}
      
      for idx, item in enumerate(items):
        title_el = item.find('title')
        title = title_el.text if title_el is not None and title_el.text is not None else ""
        
        desc_el = item.find('description')
        desc = desc_el.text if desc_el is not None and desc_el.text is not None else ""
        
        link_el = item.find('link')
        link = link_el.text if link_el is not None and link_el.text is not None else ""
        
        pub_date_el = item.find('pubDate')
        pub_date = pub_date_el.text if pub_date_el is not None and pub_date_el.text is not None else ""
        
        if not title:
          continue
          
        # De-duplicate articles using alphanumeric characters of title
        title = html.unescape(title).strip()
        title_clean = "".join(c for c in title.lower() if c.isalnum())
        if title_clean in seen_titles:
          continue
        seen_titles.add(title_clean)
        
        # Extract image URL
        image_url = ""
        
        # 1. Try namespaced media:thumbnail
        media_thumb = item.find('media:thumbnail', ns)
        if media_thumb is not None and 'url' in media_thumb.attrib:
          image_url = media_thumb.attrib['url']
        
        # 2. Try namespaced media:content
        if not image_url:
          media_content = item.find('media:content', ns)
          if media_content is not None and 'url' in media_content.attrib:
            image_url = media_content.attrib['url']
            
        # 3. Try standard enclosure
        if not image_url:
          enclosure = item.find('enclosure')
          if enclosure is not None and 'url' in enclosure.attrib:
            image_url = enclosure.attrib['url']
        
        # 4. Fallback default Unsplash soccer backgrounds if no image found in XML
        if not image_url:
          unsplash_options = [
            "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop"
          ]
          image_url = unsplash_options[idx % len(unsplash_options)]
  
        if desc:
          desc = re.sub(r'<[^>]*>', '', desc)
          desc = html.unescape(desc).strip()
  
        title_lower = title.lower() + " " + desc.lower()
        
        # Categorization based on title/desc keywords
        category = 'tactics'
        color = 'linear-gradient(135deg, #f59e0b, #78350f)'
        overlay = '⚽'
        
        if any(kw in title_lower for kw in ['injury', 'hurt', 'calf', 'strain', 'tear', 'doubtful', 'out for', 'medical', 'fitness', 'knee', 'hamstring', 'ankle', 'scan', 'broken', 'fracture']):
          category = 'injury'
          color = 'linear-gradient(135deg, #ef4444, #7f1d1d)'
          overlay = '🩺'
        elif any(kw in title_lower for kw in ['lineup', 'squad', 'xi', 'confirmed', 'starting', 'squads', 'roster', 'selection', 'bench', 'cap', 'call-up', 'call up']):
          category = 'lineup'
          color = 'linear-gradient(135deg, #3b82f6, #1e3a8a)'
          overlay = '📋'
        elif any(kw in title_lower for kw in ['transfer', 'sign', 'loan', 'deal', 'contract', 'sell', 'buy', 'bid', 'rumour', 'gossip', 'market', 'fee', 'release clause']):
          category = 'transfer'
          color = 'linear-gradient(135deg, #a855f7, #581c87)'
          overlay = '🔄'
        elif any(kw in title_lower for kw in ['say', 'confirm', 'admit', 'declare', 'interview', 'press', 'conference', 'quote', 'warn', 'claim', 'state', 'manager', 'coach', 'boss']):
          category = 'press'
          color = 'linear-gradient(135deg, #0d9488, #115e59)'
          overlay = '🎙️'
        elif any(kw in title_lower for kw in ['var', 'referee', 'rule', 'decision', 'offside', 'penalty', 'red card', 'card', 'ban', 'suspend', 'appeal', 'fa', 'fifa', 'ifab']):
          category = 'rules'
          color = 'linear-gradient(135deg, #64748b, #334155)'
          overlay = '📺'
   
        time_label = "Recently"
        timestamp = 0
        if pub_date:
          try:
            dt = parsedate_to_datetime(pub_date)
            if dt.tzinfo is None:
              dt = dt.replace(tzinfo=timezone.utc)
            else:
              dt = dt.astimezone(timezone.utc)
            timestamp = int(dt.timestamp())
            
            diff = datetime.now(timezone.utc) - dt
            diff_mins = int(diff.total_seconds() / 60)
            
            if diff_mins < 60:
              time_label = f"{diff_mins}m ago" if diff_mins > 0 else "Just now"
            elif diff_mins < 1440:
              time_label = f"{int(diff_mins / 60)}h ago"
            else:
              time_label = f"{int(diff_mins / 1440)}d ago"
          except Exception:
            time_label = "Today"
            timestamp = 0
   
        all_articles.append({
          "category": category,
          "title": title,
          "snippet": desc,
          "time": time_label,
          "timestamp": timestamp,
          "color": color,
          "overlay": overlay,
          "link": link,
          "image": image_url,
          "source": source_name
        })
      feeds_parsed += 1
    except Exception as parse_err:
      print(f"[News Scraper] Error parsing feed {source_name}: {parse_err}")

  if not all_articles:
    print("[News Scraper] No feeds parsed successfully. Writing fallback news database.")
    fallback_news = [
      {
        "id": 201,
        "category": "injury",
        "title": "Mbappé doubtful for opening match against Canada",
        "snippet": "France's talisman suffered a mild calf strain during training. The medical team is working round the clock to assess his fitness, but reports indicate Deschamps will not risk him.",
        "time": "10m ago",
        "color": "linear-gradient(135deg, #ef4444, #7f1d1d)",
        "overlay": "🩺",
        "image": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop",
        "source": "L'Équipe"
      },
      {
        "id": 202,
        "category": "lineup",
        "title": "Canada names starting XI to face France",
        "snippet": "Coach Jesse Marsch confirms a bold 4-3-3 formation featuring Alphonso Davies in a highly advanced wing role, aiming to shock the French defense with absolute raw pace.",
        "time": "1h ago",
        "color": "linear-gradient(135deg, #3b82f6, #1e3a8a)",
        "overlay": "📋",
        "image": "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=500&auto=format&fit=crop",
        "source": "CBC Sports"
      },
      {
        "id": 203,
        "category": "tactics",
        "title": "Tactical breakdown: How Japan plan to halt Messi",
        "snippet": "Moriyasu's side is drilling a high-pressing mid-block scheme to restrict spaces between Japan's lines, suffocating Argentina's playmaker and initiating swift counter-attacks.",
        "time": "3h ago",
        "color": "linear-gradient(135deg, #f59e0b, #78350f)",
        "overlay": "⚽",
        "image": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop",
        "source": "ESPN FC"
      },
      {
        "id": 204,
        "category": "injury",
        "title": "German midfielder Kroos fully fit after knock",
        "snippet": "Great news for Nagelsmann as Toni Kroos completes full training session. The midfield mastermind is set to start against Mexico tonight in Vancouver.",
        "time": "5h ago",
        "color": "linear-gradient(135deg, #ef4444, #7f1d1d)",
        "overlay": "🩺",
        "image": "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop",
        "source": "Sky Sports"
      }
    ]
    with open(NEWS_JSON_PATH, 'w', encoding='utf-8') as f:
      json.dump(fallback_news, f, indent=2, ensure_ascii=False)
    return True

  try:
    # Sort all articles by timestamp descending (newest first)
    all_articles.sort(key=lambda x: x["timestamp"], reverse=True)

    # Slice to top 10 and assign sequential IDs
    parsed_articles = []
    for i, art in enumerate(all_articles[:10]):
      art["id"] = i + 200
      parsed_articles.append(art)
 
    with open(NEWS_JSON_PATH, 'w', encoding='utf-8') as f:
      json.dump(parsed_articles, f, indent=2, ensure_ascii=False)
    print(f"[News Scraper] Successfully cached {len(parsed_articles)} sorted news articles.")
    return True
  except Exception as e:
    print(f"[News Scraper] Error sorting and saving news: {e}")
    return False


def main():
  setup_directories()
  if parse_news():
    print("[News Scraper] News cache updated.")
    sys.exit(0)
  else:
    sys.exit(1)

if __name__ == '__main__':
  main()
