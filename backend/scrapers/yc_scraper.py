import requests
from typing import List, Optional
from sqlalchemy.orm import Session
from scrapers.base import BaseScraper
from models import Company, Founder

class YCScraper(BaseScraper):
    def __init__(self, db: Session, batches: List[str] = ["S2026", "X2026", "W2026", "F2025", "S2025", "X2025", "W2025"]):
        super().__init__(db)
        self.batches = batches

    async def fetch_data(self) -> List[dict]:
        """Fetch YC company data from the free yc-oss JSON API (no browser needed)."""
        all_companies = []
        print("Fetching YC data from yc-oss API...")
        
        try:
            resp = requests.get(
                "https://yc-oss.github.io/api/companies/all.json",
                timeout=30,
                headers={"User-Agent": "StartupIntelligence/1.0"}
            )
            resp.raise_for_status()
            data = resp.json()
            print(f"Fetched {len(data)} total YC companies from API")
        except Exception as e:
            print(f"Error fetching YC API: {e}")
            return []
        
        # Filter by target batches
        for company in data:
            batch = company.get("batch", "")
            if batch and batch in self.batches:
                # Map API fields to our model
                industries = company.get("industries", [])
                industry_str = ", ".join(industries) if industries else company.get("industry", "")
                
                all_companies.append({
                    "name": company.get("name", ""),
                    "logo_url": company.get("small_logo_thumb_url", ""),
                    "website": company.get("website", ""),
                    "one_liner": company.get("one_liner", ""),
                    "industry": industry_str,
                    "problem": (company.get("long_description", "") or "")[:2000],
                    "batch": batch,
                    "source": "YC",
                    "founded_at": str(company.get("launched_at", "")),
                    "team_size": company.get("team_size"),
                    "funding_raised": company.get("status", "Active"),
                    "founders_list": []  # API doesn't include founder details
                })
        
        print(f"Filtered to {len(all_companies)} companies in target batches: {self.batches}")
        return all_companies

    async def process_data(self, data: List[dict]):
        print(f"Integrating {len(data)} YC records...")
        for item in data:
            if not item.get("name"): continue
            founders_data = item.pop("founders_list", [])

            existing = self.db.query(Company).filter(Company.name == item["name"], Company.source == "YC").first()
            if not existing:
                company = Company(**item)
                self.db.add(company)
                self.db.flush() 
            else:
                for key, value in item.items():
                    if value:
                        setattr(existing, key, value)
                company = existing
            
            for f_data in founders_data:
                existing_f = self.db.query(Founder).filter(Founder.name == f_data["name"], Founder.company_id == company.id).first()
                if not existing_f:
                    founder = Founder(**f_data, company_id=company.id)
                    self.db.add(founder)
                else:
                    for key, value in f_data.items():
                        setattr(existing_f, key, value)
        
        self.db.commit()
        print("YC records saved.")
