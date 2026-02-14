import asyncio
from typing import List
from playwright.async_api import async_playwright
from sqlalchemy.orm import Session
from scrapers.base import BaseScraper
from models import Company

class StartXScraper(BaseScraper):
    async def fetch_data(self) -> List[dict]:
        companies = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # StartX companies page
            print("Scraping StartX...")
            await page.goto("https://startx.com/companies", wait_until="networkidle")
            
            # The page has a grid of logos. Let's try to find them.
            # Based on research, it's often a series of containers with images and links.
            # Search for a[href] inside specific divs or just all links that are likely companies.
            
            # Scroll to load everything
            for _ in range(5):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(1000)

            # Selector based on common logo grid structures
            cards = await page.locator('div.logo-container, div.company-logo, div.community-card').all()
            if not cards:
                # Fallback: just find all image links in a main container
                cards = await page.locator('a[href*="http"]').all()
            
            print(f"Found {len(cards)} potential StartX items")
            
            for card in cards[:30]: # Limit for MVP
                try:
                    href = await card.get_attribute("href")
                    if not href or "startx.com" in href: continue
                    
                    # Try to get Name from alt text of img inside or title
                    name = None
                    img = card.locator('img').first
                    logo_url = await img.get_attribute("src") if await img.count() > 0 else None
                    if logo_url and logo_url.startswith('/'):
                        logo_url = f"https://startx.com{logo_url}"
                    if await img.count() > 0:
                        name = await img.get_attribute("alt")
                    
                    if not name:
                         # try parsing text from sibling or the link itself
                         domain_parts = href.split('//')[-1].split('.')
                         # Filter out common subdomains like 'www'
                         interesting_parts = [p for p in domain_parts if p.lower() not in ['www', 'com', 'org', 'net', 'io']]
                         name = interesting_parts[0].capitalize() if interesting_parts else "Unknown"

                    companies.append({
                        "name": name,
                        "logo_url": logo_url,
                        "website": href,
                        "source": "StartX",
                        "batch": "StartX Alum",
                        "funding_raised": "StartX Portfolio"
                    })
                except:
                    continue
                    
            await browser.close()
        return companies

    async def process_data(self, data: List[dict]):
        print(f"Processing {len(data)} StartX companies...")
        for item in data:
            existing = self.db.query(Company).filter(Company.name == item["name"], Company.source == "StartX").first()
            if not existing:
                company = Company(**item)
                self.db.add(company)
        self.db.commit()
        print("StartX data committed.")
