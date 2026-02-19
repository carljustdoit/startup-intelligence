import requests
from typing import List
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from scrapers.base import BaseScraper
from models import Company
from logs import add_scrape_log

class StartXScraper(BaseScraper):
    async def fetch_data(self) -> List[dict]:
        """Fetch StartX company data using requests + BeautifulSoup (no browser needed)."""
        companies = []
        add_scrape_log("Scraping StartX with requests...")
        
        try:
            resp = requests.get(
                "https://startx.com/companies",
                timeout=30,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Find company links - adapt selectors to the page structure
            links = soup.select('a[href^="http"]')
            seen_names = set()
            
            for link in links:
                try:
                    href = link.get("href", "")
                    if not href or "startx.com" in href:
                        continue
                    
                    # Try to get name from img alt text or link text
                    name = None
                    img = link.find("img")
                    logo_url = None
                    if img:
                        name = img.get("alt", "")
                        logo_url = img.get("src", "")
                        if logo_url and logo_url.startswith("/"):
                            logo_url = f"https://startx.com{logo_url}"
                    
                    if not name:
                        name = link.get_text(strip=True)
                    
                    if not name:
                        # Parse from domain
                        domain_parts = href.split("//")[-1].split(".")
                        interesting = [p for p in domain_parts if p.lower() not in ["www", "com", "org", "net", "io"]]
                        name = interesting[0].capitalize() if interesting else "Unknown"
                    
                    if name in seen_names or name == "Unknown":
                        continue
                    seen_names.add(name)
                    
                    companies.append({
                        "name": name,
                        "logo_url": logo_url,
                        "website": href,
                        "source": "StartX",
                        "batch": "StartX Alum",
                        "funding_raised": "StartX Portfolio"
                    })
                except Exception:
                    continue
            
            add_scrape_log(f"Found {len(companies)} StartX companies")
        except Exception as e:
            add_scrape_log(f"Error scraping StartX: {e}")
        
        return companies[:30]  # Limit for MVP

    async def process_data(self, data: List[dict]):
        add_scrape_log(f"Processing {len(data)} StartX companies...")
        for item in data:
            existing = self.db.query(Company).filter(Company.name == item["name"], Company.source == "StartX").first()
            if not existing:
                company = Company(**item)
                self.db.add(company)
        self.db.commit()
        add_scrape_log("StartX data committed.")
