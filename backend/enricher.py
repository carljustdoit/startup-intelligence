import requests
from typing import Optional, List
from sqlalchemy.orm import Session
from models import Company, Founder
from bs4 import BeautifulSoup

class EnrichmentService:
    def __init__(self, db: Session):
        self.db = db

    async def enrich_company(self, company_id: int):
        company = self.db.query(Company).filter(Company.id == company_id).first()
        if not company or not company.website:
            return

        print(f"Enriching company: {company.name} ({company.website})")
        
        try:
            resp = requests.get(
                company.website,
                timeout=10,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                allow_redirects=True
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # 1. Get Title and Meta Description
            title_tag = soup.find("title")
            title = title_tag.get_text(strip=True) if title_tag else None
            
            meta_desc_tag = soup.find("meta", attrs={"name": "description"})
            meta_desc = meta_desc_tag.get("content", "") if meta_desc_tag else ""
            
            if meta_desc and (not company.one_liner or len(meta_desc) > len(company.one_liner)):
                company.one_liner = meta_desc[:255]
            
            if not company.description:
                company.description = meta_desc or title

            self.db.commit()
            print(f"Enriched {company.name} with meta data.")

        except Exception as e:
            print(f"Error enriching {company.name}: {e}")

    async def enrich_all_new(self):
        # Find companies with no description
        companies = self.db.query(Company).filter(Company.description == None).all()
        for company in companies:
            await self.enrich_company(company.id)
