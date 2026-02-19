import requests
from typing import List
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from scrapers.base import BaseScraper
from models import Company
from logs import add_scrape_log

class AVScraper(BaseScraper):
    async def fetch_data(self) -> List[dict]:
        """Fetch Alumni Ventures portfolio data using requests + BeautifulSoup (no browser needed)."""
        companies = []
        add_scrape_log("Scraping Alumni Ventures Portfolio with requests...")
        
        try:
            resp = requests.get(
                "https://www.av.vc/portfolio",
                timeout=30,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Find company items in the portfolio listing
            # Try multiple selector strategies
            items = soup.select('[class*="portfolio_list"] li a, [class*="portfolio"] li a, .w-dyn-item a')
            
            if not items:
                # Fallback: find all links that could be company links
                items = soup.select('a[href^="http"]')
            
            seen_names = set()
            add_scrape_log(f"Found {len(items)} raw portfolio items")
            
            for item in items:
                try:
                    name = item.get_text(strip=True)
                    if not name or len(name) > 100:
                        continue
                    
                    href = item.get("href", "")
                    
                    # Skip internal links and social media
                    if any(x in href for x in ["av.vc", "linkedin.com", "twitter.com", "facebook.com", "#"]):
                        continue
                    
                    if name in seen_names:
                        continue
                    seen_names.add(name)
                    
                    # Try to find logo
                    img = item.find("img")
                    logo_url = img.get("src", "") if img else None
                    
                    companies.append({
                        "name": name,
                        "logo_url": logo_url,
                        "website": href if href.startswith("http") else None,
                        "source": "AV",
                        "batch": "AV Portfolio",
                        "funding_raised": "AV Funded"
                    })
                except Exception:
                    continue
            
            add_scrape_log(f"Extracted {len(companies)} Alumni Ventures companies")
        except Exception as e:
            add_scrape_log(f"Error scraping AV: {e}")
        
        return companies[:30]  # Limit for MVP

    async def process_data(self, data: List[dict]):
        add_scrape_log(f"Processing {len(data)} Alumni Ventures companies...")
        for item in data:
            existing = self.db.query(Company).filter(Company.name == item["name"], Company.source == "AV").first()
            if not existing:
                company = Company(**item)
                self.db.add(company)
            else:
                for key, value in item.items():
                    if value: setattr(existing, key, value)
        self.db.commit()
        add_scrape_log("AV data committed successfully.")
