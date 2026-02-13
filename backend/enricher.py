import asyncio
from typing import Optional, List
from playwright.async_api import async_playwright
from sqlalchemy.orm import Session
from models import Company, Founder
import bs4

class EnrichmentService:
    def __init__(self, db: Session):
        self.db = db

    async def enrich_company(self, company_id: int):
        company = self.db.query(Company).filter(Company.id == company_id).first()
        if not company or not company.website:
            return

        print(f"Enriching company: {company.name} ({company.website})")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            page = await context.new_page()
            
            try:
                # Set a timeout for enrichment
                await page.goto(company.website, timeout=15000, wait_until="networkidle")
                
                # 1. Get Title and Meta Description
                title = await page.title()
                meta_desc = await page.locator('meta[name="description"]').get_attribute("content")
                
                if meta_desc and (not company.one_liner or len(meta_desc) > len(company.one_liner)):
                    company.one_liner = meta_desc[:255]
                
                if not company.description:
                    company.description = meta_desc or title

                # 2. Try to find LinkedIn / Twitter
                links = await page.locator('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="x.com"]').all()
                for link in links:
                    href = await link.get_attribute("href")
                    # Heuristic: If it contains "company", it's the company page. 
                    # If it's a person name or "in/person", might be a founder.
                    pass

                # 3. Simple Founder Heuristic: Look for "About" or "Team" page
                team_links = await page.locator('a:text-is("Team"), a:text-is("About"), a:text-is("About Us")').all()
                if team_links:
                    # For MVP, we'll just log we found them. Real parsing would visit these.
                    pass

                self.db.commit()
                print(f"Enriched {company.name} with meta data.")

            except Exception as e:
                print(f"Error enriching {company.name}: {e}")
            finally:
                await browser.close()

    async def enrich_all_new(self):
        # Find companies with no description or missing website
        companies = self.db.query(Company).filter(Company.description == None).all()
        for company in companies:
            await self.enrich_company(company.id)
            await asyncio.sleep(2) # Be respectful
