# Competitor Intelligence Operations Manual

**Purpose**: Step-by-step operational procedures for building and running the competitor intelligence system
**Status**: Operational guide
**Last Updated**: 2026-03-24

---

## Table of Contents

1. Getting Started
2. Setting Up Infrastructure
3. Data Collection Procedures
4. Processing & Analysis
5. Storage & Retrieval
6. Reporting & Dashboards
7. Troubleshooting

---

## Part 1: Getting Started

### Step 1: Define Your Competitor Universe

**Task**: Identify and categorize competitors

**Process**:

```
Research Phase (2-3 days):

1. Market Research
   └─ Search: "OpenDash alternatives", "analytics dashboard tools", "BI software"
   └─ Sources: G2, Capterra, Gartner, industry analysts
   └─ Result: 30-40 candidate competitors

2. Competitive Category Analysis
   ├─ Category 1: Direct competitors (same market)
   ├─ Category 2: Feature overlap (analytics, dashboards)
   ├─ Category 3: Adjacent (CRM, marketing automation)
   └─ Category 4: Emerging (YC startups, GitHub trending)

3. Validation
   ├─ Is it actually competing with OpenDash?
   ├─ Is it still active? (check last updates)
   ├─ Market traction? (search results, mentions)
   └─ Worth monitoring? (threat, inspiration, learning)

4. Tier Assignment
   └─ Use tiers from COMPETITOR-INTELLIGENCE-SYSTEM.md
   └─ Tier 1: Direct competitors → Daily monitoring
   └─ Tier 2: Feature overlap → 2-3x weekly
   └─ Tier 3: Adjacent → Weekly
   └─ Tier 4: Emerging → Bi-weekly
   └─ Tier 5: Inspirational → Monthly
```

**Output**: CSV/spreadsheet with columns:

```
Competitor,Category,Tier,Website,GitHub,Twitter,LinkedIn,Monitoring_Frequency,Why_Relevant
Metabase,Direct,1,metabase.com,github.com/metabase,@metabase,metabase,Daily,Same market
Grafana,Feature,2,grafana.com,github.com/grafana,@grafana,grafana,2x/week,Strong analytics UX
Cube.js,Feature,2,cube.dev,github.com/cube-js,@cubejs,cube-js,2x/week,Semantic layer
Looker,Adjacent,3,lookerstudio.google.com,[none],-,-,Weekly,Feature comparison
[...]
```

**Time**: 2-3 days research

---

### Step 2: Set Up Your Infrastructure

#### 2A: Create PostgreSQL Database

**Option 1: Self-Hosted (Recommended for learning)**

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database
createdb competitor_intelligence

# Connect
psql competitor_intelligence
```

**Option 2: Managed (Production)**

```bash
# AWS RDS
# Azure Database for PostgreSQL
# Railway.app (simple, good for prototyping)
# Render.com (generous free tier)

# Example: Railway.app via CLI
railway login
railway init
railway add postgresql
railway up
```

#### 2B: Create Tables

```sql
-- Competitors table
CREATE TABLE competitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  tier INT (1-5),
  website_url VARCHAR(255),
  github_url VARCHAR(255),
  twitter_handle VARCHAR(100),
  linkedin_url VARCHAR(255),
  founded_year INT,
  team_size INT,
  funding_status VARCHAR(50),
  last_updated TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- Daily metrics
CREATE TABLE competitor_metrics (
  id SERIAL PRIMARY KEY,
  competitor_id INT REFERENCES competitors(id),
  metric_date DATE NOT NULL,
  website_traffic INT,  -- from SimilarWeb
  github_stars INT,  -- from GitHub API
  github_forks INT,
  social_followers INT,
  organic_keywords INT,  -- from Semrush
  blog_posts_count INT,
  created_at TIMESTAMP DEFAULT NOW(),
  data_source VARCHAR(100),
  confidence_score FLOAT
);

-- Website snapshots
CREATE TABLE website_snapshots (
  id SERIAL PRIMARY KEY,
  competitor_id INT REFERENCES competitors(id),
  snapshot_date TIMESTAMP DEFAULT NOW(),
  screenshot_url VARCHAR(500),  -- S3 path
  homepage_text TEXT,
  pricing_data JSONB,
  features TEXT[],
  page_load_time_ms INT,
  http_status INT,
  checksum VARCHAR(64)  -- for change detection
);

-- Social posts
CREATE TABLE social_posts (
  id SERIAL PRIMARY KEY,
  competitor_id INT REFERENCES competitors(id),
  platform VARCHAR(50),  -- twitter, linkedin, github
  post_id VARCHAR(255),
  posted_date TIMESTAMP,
  content TEXT,
  engagement_likes INT,
  engagement_shares INT,
  engagement_comments INT,
  sentiment VARCHAR(10),  -- positive, neutral, negative
  scraped_at TIMESTAMP DEFAULT NOW()
);

-- Intelligence reports
CREATE TABLE intelligence_reports (
  id SERIAL PRIMARY KEY,
  competitor_id INT REFERENCES competitors(id),
  report_date DATE,
  report_type VARCHAR(50),  -- daily, weekly, monthly
  significant_changes TEXT[],
  positioning_statement TEXT,
  key_differentiators TEXT[],
  marketing_themes TEXT[],
  recommendations TEXT[],
  generated_by VARCHAR(100),  -- 'claude', 'automated', 'manual'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_competitors_tier ON competitors(tier);
CREATE INDEX idx_metrics_date ON competitor_metrics(metric_date);
CREATE INDEX idx_snapshots_date ON website_snapshots(snapshot_date);
CREATE INDEX idx_posts_date ON social_posts(posted_date);
```

**Time**: 30-60 minutes setup + testing

---

#### 2C: Set Up File Storage

**Option 1: AWS S3**

```bash
# Create S3 bucket
aws s3 mb s3://opendash-competitor-intel

# Create folder structure
# s3://opendash-competitor-intel/
# ├── screenshots/
# │   ├── 2026-03-24/
# │   │   ├── metabase-homepage.png
# │   │   └── grafana-homepage.png
# │   └── 2026-03-25/
# ├── archives/
# ├── reports/
# └── exports/

# Set lifecycle policy (delete old screenshots after 90 days)
# (Configure in AWS console)
```

**Option 2: Local + Git**

```bash
# Create local directory structure
mkdir -p competitor_data/{screenshots,archives,reports}

# For version control: Use Git LFS for large files
git lfs install
git lfs track "*.png" "*.jpg" "*.pdf"
```

---

### Step 3: Organize Your Workspace

**Directory Structure**:

```
opendash-competitor-intel/
├── data/
│   ├── competitors.csv (master list)
│   ├── metrics.db (SQLite for quick checks)
│   └── schemas/ (SQL schemas)
├── scripts/
│   ├── collection/
│   │   ├── screenshot.py (Playwright)
│   │   ├── api_pull.py (Semrush, SimilarWeb)
│   │   ├── github.py (GitHub API)
│   │   └── social.py (Twitter, LinkedIn)
│   ├── processing/
│   │   ├── change_detection.py
│   │   ├── analysis.py (Claude integration)
│   │   └── normalization.py
│   └── jobs/
│       ├── daily.py
│       ├── weekly.py
│       └── monthly.py
├── dashboards/
│   ├── grafana/ (dashboard definitions)
│   └── sql/ (useful queries)
├── notebooks/
│   ├── exploration.ipynb (Jupyter for analysis)
│   └── reports.ipynb (Report generation)
└── config/
    ├── competitors.json (master list + settings)
    ├── api_keys.env (API credentials - NEVER COMMIT)
    └── schedule.yaml (cron job definitions)
```

---

## Part 2: Setting Up Data Collection

### Approach 1: Playwright Screenshots & DOM Extraction

**Installation**:

```bash
# Install Playwright
pip install playwright
python -m playwright install

# Or for Node.js
npm install -D @playwright/test
```

**Basic Script - Homepage Screenshots**:

```python
import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
import boto3
import json

async def screenshot_competitor(competitor):
    """Capture homepage screenshot and extract basic data"""

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            # Navigate with timeout
            await page.goto(competitor['website_url'],
                           wait_until='networkidle',
                           timeout=30000)

            # Capture screenshot
            screenshot_path = f"./screenshots/{competitor['name']}-{datetime.now().strftime('%Y-%m-%d')}.png"
            await page.screenshot(path=screenshot_path, full_page=True)

            # Extract basic metadata
            data = {
                'competitor': competitor['name'],
                'date': datetime.now().isoformat(),
                'title': await page.title(),
                'url': page.url,
                'load_time': page.evaluate("() => window.performance.timing.loadEventEnd - window.performance.timing.navigationStart"),
            }

            # Extract Open Graph meta tags (for positioning)
            og_data = await page.evaluate("""
                () => {
                    return {
                        title: document.querySelector('meta[property="og:title"]')?.content || '',
                        description: document.querySelector('meta[property="og:description"]')?.content || '',
                        image: document.querySelector('meta[property="og:image"]')?.content || '',
                    }
                }
            """)
            data['og'] = og_data

            # Extract pricing if on homepage
            pricing_text = await page.evaluate("""
                () => {
                    // Look for common pricing indicators
                    const priceElements = Array.from(document.querySelectorAll('*'))
                        .filter(el => /\\$|price|pricing|cost|plan/i.test(el.textContent))
                        .slice(0, 5)
                        .map(el => el.textContent.trim());
                    return priceElements;
                }
            """)
            data['potential_pricing'] = pricing_text

            # Upload to S3
            s3 = boto3.client('s3')
            s3.upload_file(screenshot_path, 'opendash-competitor-intel', f"screenshots/{screenshot_path}")

            # Save metadata
            with open(f"./metadata/{competitor['name']}-{datetime.now().strftime('%Y-%m-%d')}.json", 'w') as f:
                json.dump(data, f, indent=2)

            print(f"✅ {competitor['name']}: Screenshot saved")

        except Exception as e:
            print(f"❌ {competitor['name']}: {str(e)}")
        finally:
            await browser.close()

# Run for all competitors
async def main():
    competitors = [
        {'name': 'Metabase', 'website_url': 'https://www.metabase.com'},
        {'name': 'Grafana', 'website_url': 'https://grafana.com'},
        # ... more
    ]

    for competitor in competitors:
        await screenshot_competitor(competitor)

asyncio.run(main())
```

**Run Daily**:

```bash
# Create cron job
crontab -e

# Add this line (runs every morning at 2 AM)
0 2 * * * /usr/bin/python3 /path/to/scripts/collection/screenshot.py >> /var/log/competitor_intel.log 2>&1
```

---

### Approach 2: API Data Collection

**GitHub API - Get Repository Stats**:

```python
import requests
import os
from datetime import datetime

def get_github_metrics(github_username):
    """Get metrics from competitor GitHub repositories"""

    github_token = os.getenv('GITHUB_TOKEN')
    headers = {'Authorization': f'token {github_token}'}

    # Get user data
    user_url = f"https://api.github.com/users/{github_username}"
    user = requests.get(user_url, headers=headers).json()

    # Get repositories
    repos_url = f"https://api.github.com/users/{github_username}/repos"
    repos = requests.get(repos_url, headers=headers, params={'per_page': 100}).json()

    metrics = {
        'github_user': github_username,
        'public_repos': user.get('public_repos'),
        'followers': user.get('followers'),
        'following': user.get('following'),
        'total_stars': sum(r.get('stargazers_count', 0) for r in repos),
        'repositories': [
            {
                'name': r['name'],
                'url': r['html_url'],
                'stars': r['stargazers_count'],
                'forks': r['forks_count'],
                'open_issues': r['open_issues_count'],
                'language': r['language'],
                'last_updated': r['updated_at'],
                'description': r['description'],
            }
            for r in repos[:10]  # Top 10 by activity
        ],
        'collected_at': datetime.now().isoformat()
    }

    return metrics

# Run for all competitors with GitHub
competitors_github = {
    'metabase': 'metabase',
    'grafana': 'grafana',
    'cube-js': 'cube-js',
    # ...
}

for name, github_user in competitors_github.items():
    metrics = get_github_metrics(github_user)
    print(f"{name}: {metrics['total_stars']} stars across {metrics['public_repos']} repos")

    # Save to database
    # INSERT INTO competitor_metrics (competitor_id, github_stars, github_forks, ...)
```

**SimilarWeb API - Website Traffic**:

```python
import requests
import os

def get_traffic_metrics(domain):
    """Get website traffic data from SimilarWeb"""

    api_key = os.getenv('SIMILARWEB_API_KEY')

    url = f"https://api.similarweb.com/v1/website/{domain}/total-traffic-and-engagement/visits"
    params = {
        'api_key': api_key,
        'start_date': '2025-12-01',
        'end_date': '2026-03-01',
        'granularity': 'monthly'
    }

    response = requests.get(url, params=params)
    data = response.json()

    return {
        'domain': domain,
        'monthly_visits': data.get('visits'),  # Estimated monthly visitors
        'metric_source': 'similarweb'
    }

# Get traffic for top competitors
competitors = [
    'metabase.com',
    'grafana.com',
    'looker.com',
    'cube.dev',
]

for domain in competitors:
    traffic = get_traffic_metrics(domain)
    print(f"{domain}: {traffic['monthly_visits']} monthly visits")
```

---

### Approach 3: Social Media Monitoring

**Twitter/X API - Streaming Tweets**:

```python
import requests
import os
from datetime import datetime, timedelta

def get_recent_tweets(twitter_handle):
    """Get recent tweets from competitor account"""

    bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
    headers = {"Authorization": f"Bearer {bearer_token}"}

    # Get user ID first
    user_url = f"https://api.twitter.com/2/users/by/username/{twitter_handle}"
    user_response = requests.get(user_url, headers=headers).json()
    user_id = user_response['data']['id']

    # Get recent tweets (last 7 days)
    tweets_url = f"https://api.twitter.com/2/users/{user_id}/tweets"
    params = {
        'max_results': 100,
        'tweet.fields': 'created_at,public_metrics,author_id',
        'expansions': 'author_id',
        'user.fields': 'username,followers_count'
    }

    tweets_response = requests.get(tweets_url, headers=headers, params=params).json()

    tweets = []
    for tweet in tweets_response.get('data', []):
        tweets.append({
            'tweet_id': tweet['id'],
            'text': tweet['text'],
            'created_at': tweet['created_at'],
            'likes': tweet['public_metrics']['like_count'],
            'retweets': tweet['public_metrics']['retweet_count'],
            'replies': tweet['public_metrics']['reply_count'],
        })

    return {
        'twitter_handle': twitter_handle,
        'tweet_count': len(tweets),
        'tweets': tweets,
        'collected_at': datetime.now().isoformat()
    }

# Monitor competitors
twitter_handles = ['@metabase', '@grafana', '@cubejs']

for handle in twitter_handles:
    tweets = get_recent_tweets(handle.strip('@'))
    print(f"{handle}: {tweets['tweet_count']} recent tweets")
    # Save to database
```

---

## Part 3: Processing & Analysis

### Step 1: Change Detection

**Visual Diff (Screenshots)**:

```python
import hashlib
from PIL import Image, ImageChops
import json
from datetime import datetime

def detect_screenshot_changes(competitor_name, prev_screenshot_path, new_screenshot_path):
    """Detect if website screenshot has changed"""

    try:
        prev_img = Image.open(prev_screenshot_path)
        new_img = Image.open(new_screenshot_path)

        # Calculate difference
        diff = ImageChops.difference(prev_img, new_img)

        # Get bounding box of changes
        diff_bbox = diff.getbbox()

        if diff_bbox:
            # Calculate percentage of image that changed
            change_area = diff_bbox[2] * diff_bbox[3]
            total_area = prev_img.width * prev_img.height
            change_percentage = (change_area / total_area) * 100

            return {
                'changed': True,
                'change_percentage': change_percentage,
                'change_region': diff_bbox,
                'significance': 'HIGH' if change_percentage > 5 else 'MEDIUM' if change_percentage > 1 else 'LOW',
                'timestamp': datetime.now().isoformat()
            }
        else:
            return {
                'changed': False,
                'change_percentage': 0,
                'timestamp': datetime.now().isoformat()
            }

    except Exception as e:
        return {'error': str(e)}

# Usage
change = detect_screenshot_changes('Metabase', 'prev.png', 'current.png')
print(f"Change detected: {change['changed']}, Significance: {change.get('significance')}")
```

---

### Step 2: Claude Analysis - Significance Detection

**Analyze What Changed and Why**:

```python
import anthropic
import json
from datetime import datetime

def analyze_competitor_change(competitor_name, previous_data, current_data, screenshot_description=None):
    """Use Claude to analyze if competitor changes are significant"""

    client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    prompt = f"""Analyze these competitor changes and determine significance for market positioning:

Competitor: {competitor_name}
Previous Data: {json.dumps(previous_data, indent=2)}
Current Data: {json.dumps(current_data, indent=2)}
Screenshot Changes: {screenshot_description or 'No visual changes detected'}

Questions to answer:
1. What changed?
2. Why might this be significant? (or not?)
3. What does this tell us about their strategy?
4. How should we respond?

Format response as JSON:
{{
  "changes_summary": "Brief description",
  "significance_level": "CRITICAL|HIGH|MEDIUM|LOW",
  "strategic_implications": "What this means for positioning",
  "recommended_response": "What OpenDash should do",
  "confidence": 0-100
}}
"""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    response_text = message.content[0].text

    # Parse JSON from response
    analysis = json.loads(response_text)

    return {
        'competitor': competitor_name,
        'analysis': analysis,
        'timestamp': datetime.now().isoformat(),
        'model': 'claude-opus'
    }

# Example usage
previous = {
    'homepage_title': 'Metabase - Open Source Business Intelligence',
    'cta_button': 'Try Metabase Cloud',
    'pricing_visible': False
}

current = {
    'homepage_title': 'Metabase - The simplest way to use data',
    'cta_button': 'Get started for free',
    'pricing_visible': True
}

analysis = analyze_competitor_change('Metabase', previous, current)
print(f"Significance: {analysis['analysis']['significance_level']}")
print(f"Implications: {analysis['analysis']['strategic_implications']}")
```

---

### Step 3: Automated Report Generation

**Generate Daily/Weekly Intelligence Reports**:

```python
import anthropic
from datetime import datetime, timedelta
import json

def generate_intelligence_report(competitor, metrics_history, changes, report_type='daily'):
    """Generate intelligence report using Claude"""

    client = anthropic.Anthropic()

    # Prepare context
    context = {
        'competitor_name': competitor['name'],
        'tier': competitor['tier'],
        'metrics_trend': metrics_history[-7:] if metrics_history else [],  # Last 7 days
        'recent_changes': changes,
        'report_type': report_type,
        'period': f"Last {'day' if report_type == 'daily' else 'week'}"
    }

    prompt = f"""Generate a {report_type} competitive intelligence report:

Competitor: {context['competitor_name']} (Tier {context['tier']})
Period: {context['period']}

Metrics Trend:
{json.dumps(context['metrics_trend'], indent=2, default=str)}

Recent Changes:
{json.dumps(context['recent_changes'], indent=2)}

Create a structured report covering:
1. **Key Changes** - What changed this period?
2. **Strategic Implications** - What does this mean?
3. **Market Positioning** - How does this affect competitive landscape?
4. **Recommendations** - What should OpenDash do?
5. **Risk Assessment** - What threats does this pose?
6. **Opportunity Analysis** - What can we learn?

Format as Markdown with clear sections and bullet points.
Keep it concise: 300-500 words for daily, 800-1200 for weekly.
"""

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2000,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    report = {
        'competitor': competitor['name'],
        'report_type': report_type,
        'generated_at': datetime.now().isoformat(),
        'content': message.content[0].text
    }

    return report

# Usage
competitor = {'name': 'Metabase', 'tier': 1}
metrics_history = [...]  # Last 7 days of metrics
changes = [{'change': 'Updated homepage CTA', 'date': '2026-03-24'}]

report = generate_intelligence_report(competitor, metrics_history, changes, report_type='daily')
print(report['content'])

# Save report to database
# INSERT INTO intelligence_reports (competitor_id, report_type, content, generated_by)
# VALUES (1, 'daily', ..., 'claude')
```

---

## Part 4: Storage & Retrieval

### Storing to PostgreSQL

```python
import psycopg2
import json
from datetime import datetime

def save_competitor_metrics(competitor_id, metrics):
    """Save metrics to PostgreSQL"""

    conn = psycopg2.connect(
        dbname="competitor_intelligence",
        user="postgres",
        password=os.getenv('DB_PASSWORD'),
        host="localhost"
    )

    cur = conn.cursor()

    cur.execute("""
        INSERT INTO competitor_metrics
        (competitor_id, metric_date, website_traffic, github_stars, social_followers,
         organic_keywords, data_source, confidence_score)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        competitor_id,
        datetime.now().date(),
        metrics.get('website_traffic'),
        metrics.get('github_stars'),
        metrics.get('social_followers'),
        metrics.get('organic_keywords'),
        metrics.get('source', 'api'),
        metrics.get('confidence', 0.9)
    ))

    conn.commit()
    cur.close()
    conn.close()

# Usage
metrics = {
    'website_traffic': 500000,
    'github_stars': 45000,
    'social_followers': 35000,
    'organic_keywords': 2500,
    'source': 'similarweb',
    'confidence': 0.95
}

save_competitor_metrics(competitor_id=1, metrics=metrics)
```

---

### Querying the Database

**Find competitors by metric changes**:

```sql
-- Find competitors with significant traffic growth
SELECT
    c.name,
    cm_prev.metric_date as prev_date,
    cm_prev.website_traffic as prev_traffic,
    cm_curr.metric_date as curr_date,
    cm_curr.website_traffic as curr_traffic,
    ROUND(((cm_curr.website_traffic - cm_prev.website_traffic) / cm_prev.website_traffic * 100)::numeric, 2) as growth_pct
FROM competitors c
JOIN competitor_metrics cm_prev ON c.id = cm_prev.competitor_id
JOIN competitor_metrics cm_curr ON c.id = cm_curr.competitor_id
WHERE cm_prev.metric_date = CURRENT_DATE - INTERVAL '7 days'
  AND cm_curr.metric_date = CURRENT_DATE
  AND cm_curr.website_traffic > cm_prev.website_traffic * 1.1  -- 10%+ growth
ORDER BY growth_pct DESC;

-- Find most talked about competitors (social sentiment)
SELECT
    c.name,
    COUNT(sp.id) as post_count,
    ROUND(AVG(CAST(sp.engagement_likes AS FLOAT)), 0) as avg_likes,
    SUM(sp.engagement_likes) as total_engagement
FROM competitors c
JOIN social_posts sp ON c.id = sp.competitor_id
WHERE sp.posted_date > NOW() - INTERVAL '7 days'
GROUP BY c.id, c.name
ORDER BY total_engagement DESC;
```

---

## Part 5: Reporting & Dashboards

### Grafana Dashboard Setup

**Create a Grafana Dashboard**:

```bash
# Install Grafana (Docker)
docker run -d -p 3000:3000 grafana/grafana

# Access at http://localhost:3000
# Default: admin/admin
```

**Add PostgreSQL Data Source**:

```
1. Configuration > Data Sources > Add Data Source
2. Select PostgreSQL
3. Settings:
   - Host: localhost:5432
   - Database: competitor_intelligence
   - User: postgres
   - Password: [your password]
4. Click "Save & Test"
```

**Create Panels**:

```
Panel 1: Traffic Trends
├─ Query: SELECT metric_date, website_traffic FROM competitor_metrics WHERE metric_date > NOW() - INTERVAL '90 days'
├─ Visualization: Time Series
└─ Title: "Website Traffic Trends (Last 90 Days)"

Panel 2: GitHub Stars Growth
├─ Query: SELECT c.name, metric_date, github_stars FROM competitor_metrics cm JOIN competitors c ON cm.competitor_id = c.id
├─ Visualization: Time Series
└─ Group by: competitor name

Panel 3: Competitive Positioning Matrix
├─ Query: Custom query comparing features/pricing
├─ Visualization: Scatter Plot
└─ X-axis: Price, Y-axis: Feature Count

Panel 4: Social Engagement
├─ Query: SELECT c.name, SUM(engagement_likes) as total_engagement FROM social_posts sp JOIN competitors c ON sp.competitor_id = c.id GROUP BY c.id
├─ Visualization: Bar Chart
└─ Sort by: engagement DESC
```

---

## Part 6: Automated Scheduling

### Cron Job Configuration

**Create Daily Collection Job**:

```bash
# Create script at /usr/local/bin/competitor_intel_daily.sh
#!/bin/bash

# Run data collection
/usr/bin/python3 /path/to/scripts/collection/screenshot.py
/usr/bin/python3 /path/to/scripts/collection/api_pull.py
/usr/bin/python3 /path/to/scripts/collection/social.py

# Run processing
/usr/bin/python3 /path/to/scripts/processing/change_detection.py
/usr/bin/python3 /path/to/scripts/processing/analysis.py

# Log results
echo "Competitor intelligence collection completed at $(date)" >> /var/log/competitor_intel.log

# Edit crontab
crontab -e

# Add these lines:
# Daily collection at 2 AM UTC
0 2 * * * /usr/local/bin/competitor_intel_daily.sh >> /var/log/competitor_intel.log 2>&1

# Weekly analysis every Sunday at 6 PM UTC
0 18 * * 0 /usr/bin/python3 /path/to/scripts/jobs/weekly.py >> /var/log/competitor_intel.log 2>&1

# Monthly report first of month at 6 PM UTC
0 18 1 * * /usr/bin/python3 /path/to/scripts/jobs/monthly.py >> /var/log/competitor_intel.log 2>&1
```

---

## Part 7: Troubleshooting

### Common Issues & Solutions

**Issue 1: Playwright timeout errors**

```python
# Solution: Increase timeout and add retries
async def screenshot_with_retry(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            page = await browser.new_page()
            await page.goto(url,
                          wait_until='domcontentloaded',  # Less strict than networkidle
                          timeout=60000)  # 60 seconds
            # ... rest of code
            return
        except Exception as e:
            if attempt < max_retries - 1:
                await asyncio.sleep(5)  # Wait before retry
            else:
                raise
```

**Issue 2: Rate limiting from websites**

```python
# Solution: Add delays between requests
import time
import random

def scrape_with_rate_limiting(urls, min_delay=2, max_delay=5):
    for url in urls:
        delay = random.uniform(min_delay, max_delay)
        time.sleep(delay)  # Wait before request
        # ... make request
```

**Issue 3: Database connection issues**

```python
# Solution: Use connection pool
from psycopg2 import pool

connection_pool = pool.SimpleConnectionPool(
    1, 20,
    dbname="competitor_intelligence",
    user="postgres",
    password=os.getenv('DB_PASSWORD'),
    host="localhost"
)

conn = connection_pool.getconn()
# ... use connection
connection_pool.putconn(conn)
```

**Issue 4: API rate limits**

```python
# Solution: Implement backoff strategy
import time
from functools import wraps

def with_exponential_backoff(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        for attempt in range(3):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if attempt < 2:
                    wait_time = 2 ** attempt  # 1s, 2s, 4s
                    time.sleep(wait_time)
                else:
                    raise
    return wrapper
```

---

## Checklist: Getting Started

- [ ] **Week 1**: Define competitor universe, set up PostgreSQL
- [ ] **Week 2**: Create Playwright scripts, set up API integrations
- [ ] **Week 3**: Test data collection, handle errors
- [ ] **Week 4**: Set up Claude analysis, create first reports
- [ ] **Week 5**: Create Grafana dashboards, schedule daily jobs
- [ ] **Week 6**: Monitor and refine, add more competitors
- [ ] **Week 7**: Create weekly/monthly reports
- [ ] **Week 8+**: Regular maintenance, continuous improvement

---

**Next**: Deploy scripts and monitor for Week 1 of system operation

---

## Appendix: API Credentials Setup

### 1. GitHub API (Free)

```bash
# 1. Go to https://github.com/settings/tokens
# 2. Click "Generate new token"
# 3. Select scopes: public_repo, read:user
# 4. Copy token
# 5. Export: export GITHUB_TOKEN='your_token'
```

### 2. SimilarWeb API

```bash
# 1. Sign up at https://www.similarweb.com/corp/api/
# 2. Get API key from dashboard
# 3. Export: export SIMILARWEB_API_KEY='your_key'
```

### 3. Claude API

```bash
# 1. Go to https://console.anthropic.com
# 2. Create API key
# 3. Export: export ANTHROPIC_API_KEY='your_key'
```

### 4. X/Twitter API

```bash
# 1. Apply at https://developer.twitter.com/
# 2. Wait for approval (may take weeks)
# 3. Get Bearer Token from developer portal
# 4. Export: export TWITTER_BEARER_TOKEN='your_token'
```

---

**Status**: Ready to deploy
**Questions**: Refer to main COMPETITOR-INTELLIGENCE-SYSTEM.md document
