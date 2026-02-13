import asyncio
from typing import List
from playwright.async_api import async_playwright
from sqlalchemy.orm import Session
from scrapers.base import BaseScraper
from models import Company

class AVScraper(BaseScraper):
    async def fetch_data(self) -> List[dict]:
        companies = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            print("Scraping Alumni Ventures Portfolio...")
            await page.goto("https://www.av.vc/portfolio", wait_until="networkidle")
            
            # Scroll to load the list
            for _ in range(5):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(1000)

            # Find all company links in the grid
            # Selector: .portfolio_list__Tjcpw li a
            links = await page.locator('.portfolio_list__Tjcpw li a, [class*="portfolio_list"] li a').all()
            print(f"Found {len(links)} interactive company items")
            
            # Since we need to click each one, let's limit to 30 for performance/demo
            for link in links[:30]:
                try:
                    name = await link.inner_text()
                    if not name: continue
                    
                    # Click to open modal
                    await link.click()
                    await page.wait_for_timeout(1500) # Wait for modal
                    
                    # Extract from modal
                    # Selectors based on research
                    modal = page.locator('[class*="modal_body"], .modal-content').first
                    if await modal.count() > 0:
                        desc_el = modal.locator('[class*="portfolio_description"], p').first
                        one_liner = await desc_el.inner_text() if await desc_el.count() > 0 else ""
                        
                        web_el = modal.locator('[class*="portfolio_companylink"] a, a[href^="http"]').first
                        website = await web_el.get_attribute("href") if await web_el.count() > 0 else None
                        
                        logo_el = modal.locator('img[class*="portfolio_logo"], .portfolio_logo img, img').first
                        logo_url = await logo_el.get_attribute("src") if await logo_el.count() > 0 else None
                        
                        # Extra fields in modal
                        # ul.portfolio_companyprops__fmCm3 li
                        industry = ""
                        props = await modal.locator('ul[class*="portfolio_companyprops"] li').all()
                        for prop in props:
                            p_text = await prop.inner_text()
                            if ":" in p_text:
                                key, val = p_text.split(":", 1)
                                if "Sector" in key or "Industry" in key:
                                    industry = val.strip()

                        companies.append({
                            "name": name,
                            "logo_url": logo_url,
                            "one_liner": one_liner,
                            "website": website,
                            "industry": industry,
                            "source": "AV",
                            "batch": "AV Portfolio",
                            "funding_raised": "AV Funded"
                        })
                        
                        # Close modal
                        close_btn = page.locator('[class*="modal_close"], button.close').first
                        if await close_btn.count() > 0:
                            await close_btn.click()
                        else:
                            # Try Esc key
                            await page.keyboard.press("Escape")
                        await page.wait_for_timeout(500)
                except Exception as e:
                    print(f"Error scraping AV item: {e}")
                    # Try to reset by pressing escape
                    await page.keyboard.press("Escape")
                    continue
                    
            await browser.close()
        return companies

    async def process_data(self, data: List[dict]):
        print(f"Processing {len(data)} Alumni Ventures companies...")
        for item in data:
            existing = self.db.query(Company).filter(Company.name == item["name"], Company.source == "AV").first()
            if not existing:
                company = Company(**item)
                self.db.add(company)
            else:
                for key, value in item.items():
                    if value: setattr(existing, key, value)
        self.db.commit()
        print("AV data committed successfully.")
