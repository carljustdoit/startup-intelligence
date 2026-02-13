import asyncio
from typing import List, Optional
from playwright.async_api import async_playwright
from sqlalchemy.orm import Session
from scrapers.base import BaseScraper
from models import Company, Founder

class YCScraper(BaseScraper):
    def __init__(self, db: Session, batches: List[str] = ["Summer 2026", "Spring 2026", "Winter 2026", "Fall 2025", "Summer 2025", "Spring 2025", "Winter 2025"]):
        super().__init__(db)
        self.batches = batches

    async def fetch_data(self) -> List[dict]:
        all_companies = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            page = await context.new_page()

            for batch in self.batches:
                print(f"Scraping YC Batch: {batch}")
                safe_batch = batch.replace(" ", "%20")
                url = f"https://www.ycombinator.com/companies?batch={safe_batch}"
                await page.goto(url, wait_until="domcontentloaded")
                await page.wait_for_timeout(5000)

                for _ in range(3):
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    await page.wait_for_timeout(1000)

                cards = await page.locator('a[href^="/companies/"]').all()
                valid_cards = []
                for card in cards:
                    href = await card.get_attribute("href")
                    if href.count("/") == 2 and not any(x in href for x in ["industry", "location", "batch"]):
                        valid_cards.append(card)

                print(f"Found {len(valid_cards)} potential companies in batch {batch}")

                batch_companies = []
                for card in valid_cards[:20]: # Demo limit
                    try:
                        name_el = card.locator('span[class*="coName"], .font-bold').first
                        name = await name_el.inner_text() if await name_el.count() > 0 else (await card.inner_text()).split("\n")[0].strip()
                        if not name: continue
                        detail_url = f"https://www.ycombinator.com{await card.get_attribute('href')}"
                        batch_companies.append({"name": name, "detail_url": detail_url, "batch": batch, "source": "YC"})
                    except: continue
                
                for comp in batch_companies:
                    detailed_info = await self.fetch_company_details(page, comp["detail_url"])
                    comp.update(detailed_info)
                    all_companies.append(comp)
                
            await browser.close()
        return all_companies

    async def fetch_company_details(self, page, url: str) -> dict:
        print(f"  -> Deep parsing: {url}")
        try:
            await page.goto(url, wait_until="networkidle", timeout=15000)
            
            # Website
            web_el = page.locator('a[href^="http"]').filter(has_text="Visit Website").first
            website = await web_el.get_attribute("href") if await web_el.count() > 0 else None

            # Logo
            logo_el = page.locator('div.flex.flex-row.items-start.gap-x-4 img.rounded-xl').first
            if await logo_el.count() == 0:
                logo_el = page.locator('aside img.rounded-xl').first
            logo_url = await logo_el.get_attribute("src") if await logo_el.count() > 0 else None

            # One-liner & Industry
            one_liner = await page.locator('header div.text-xl').first.inner_text() if await page.locator('header div.text-xl').count() > 0 else None
            industry_els = await page.locator("a[href^='/companies/industry/']").all()
            industry = ", ".join([await el.inner_text() for el in industry_els]) if industry_els else None

            # Problem
            problem_el = page.locator('.whitespace-pre-line').first
            problem = await problem_el.inner_text() if await problem_el.count() > 0 else None

            # Sidebar
            founded_at, team_size, status = None, None, None
            founded_el = page.locator("//span[text()='Founded:']/following-sibling::span").first
            if await founded_el.count() > 0: founded_at = await founded_el.inner_text()
            team_el = page.locator("//span[text()='Team Size:']/following-sibling::span").first
            if await team_el.count() > 0:
                try: team_size = int((await team_el.inner_text()).strip())
                except: team_size = None
            status_el = page.locator("//span[text()='Status:']/following-sibling::span").first
            if await status_el.count() > 0: status = await status_el.inner_text()

            # Founders
            founders = []
            # Find the section for Active Founders specifically
            founder_header = page.locator('h3').filter(has_text="Active Founders").first
            if await founder_header.count() == 0:
                founder_header = page.locator('div').filter(has_text="Active Founders").first

            # Founder cards have h3 names or specific bold text and a bio
            # We look for containers that have a name and the prose bio
            potential_founder_cards = await page.locator('.ycdc-card-new, .flex-row.gap-3').all()
            for card in potential_founder_cards:
                bio_el = card.locator('.prose').first
                if await bio_el.count() > 0:
                    text_content = await card.inner_text()
                    lines = [l.strip() for l in text_content.split("\n") if l.strip()]
                    if not lines: continue
                    
                    # Founder names are usually first or second line if there's an avatar
                    potential_name = lines[0]
                    # Exclude company name or sidebar headers
                    if potential_name in [comp_name for comp_name in ["Company", "Founded", "Batch", "Team Size", "Status", "Location", "Active Founders"]]:
                        continue
                    if len(potential_name) > 50: continue # Likely not a name
                    
                    # Check if this card contains the role
                    role = "Founder"
                    for line in lines[1:4]:
                        if any(x in line for x in ["CEO", "CTO", "Founder", "President", "Engineer"]):
                            role = line
                            break
                    
                    li_link = card.locator('a[href*="linkedin.com/in/"]').first
                    f_li = await li_link.get_attribute("href") if await li_link.count() > 0 else None
                    
                    founders.append({
                        "name": potential_name,
                        "role": role,
                        "bio": await bio_el.inner_text(),
                        "linkedin_url": f_li
                    })

            return {
                "logo_url": logo_url,
                "website": website,
                "one_liner": one_liner,
                "industry": industry,
                "problem": problem[:2000] if problem else None,
                "founded_at": founded_at,
                "team_size": team_size,
                "funding_raised": status or "Active",
                "founders_list": founders
            }
        except Exception as e:
            print(f"    !! Error: {e}")
            return {}

    async def process_data(self, data: List[dict]):
        print(f"Integrating {len(data)} YC records...")
        for item in data:
            if not item.get("name"): continue
            founders_data = item.pop("founders_list", [])
            item.pop("detail_url", None)

            existing = self.db.query(Company).filter(Company.name == item["name"], Company.source == "YC").first()
            if not existing:
                company = Company(**item)
                self.db.add(company)
                self.db.flush() 
            else:
                for key, value in item.items():
                    setattr(existing, key, value)
                company = existing
            
            for f_data in founders_data:
                # Deduplicate founders by name and bio snippet
                existing_f = self.db.query(Founder).filter(Founder.name == f_data["name"], Founder.company_id == company.id).first()
                if not existing_f:
                    founder = Founder(**f_data, company_id=company.id)
                    self.db.add(founder)
                else:
                    for key, value in f_data.items():
                        setattr(existing_f, key, value)
        
        self.db.commit()
        print("YC records with precision founders saved.")
