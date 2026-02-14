import math
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, nullslast
import models, schemas
from database import SessionLocal, engine
from scrapers.yc_scraper import YCScraper
from scrapers.startx_scraper import StartXScraper
from scrapers.av_scraper import AVScraper
from enricher import EnrichmentService

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Startup Intelligence Platform API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Global state for scraping progress
SCRAPE_STATUS = {
    "is_running": False,
    "current_step": "Idle",
    "progress": 0,
    "total_steps": 4, # YC, StartX, AV, Enrichment
    "last_run": None
}

async def run_scrapers_task():
    global SCRAPE_STATUS
    db = SessionLocal()
    SCRAPE_STATUS["is_running"] = True
    SCRAPE_STATUS["progress"] = 0
    SCRAPE_STATUS["last_run"] = datetime.now().isoformat()
    
    try:
        # 1. YC Scraper
        SCRAPE_STATUS["current_step"] = "Scraping YC Batches..."
        yc = YCScraper(db, batches=["Summer 2026", "Spring 2026", "Winter 2026", "Summer 2025", "Winter 2025"])
        await yc.run()
        SCRAPE_STATUS["progress"] = 25
        
        # 2. StartX Scraper
        SCRAPE_STATUS["current_step"] = "Scraping StartX..."
        startx = StartXScraper(db)
        await startx.run()
        SCRAPE_STATUS["progress"] = 50
        
        # 3. AV Scraper
        SCRAPE_STATUS["current_step"] = "Scraping Alumni Ventures..."
        av = AVScraper(db)
        await av.run()
        SCRAPE_STATUS["progress"] = 75
        
        # 4. Enrichment
        SCRAPE_STATUS["current_step"] = "Enriching Metadata..."
        enricher = EnrichmentService(db)
        await enricher.enrich_all_new()
        SCRAPE_STATUS["progress"] = 100
        SCRAPE_STATUS["current_step"] = "Complete"
        
    except Exception as e:
        print(f"Error in background scrapers: {e}")
        SCRAPE_STATUS["current_step"] = f"Error: {str(e)}"
    finally:
        SCRAPE_STATUS["is_running"] = False
        db.close()

@app.get("/")
def read_root():
    return {"message": "Startup Intelligence Platform API is running"}

@app.get("/scrape/status")
def get_scrape_status():
    return SCRAPE_STATUS

@app.post("/scrape")
async def trigger_scrape(background_tasks: BackgroundTasks):
    if SCRAPE_STATUS["is_running"]:
        return {"message": "Scrape already in progress"}
    background_tasks.add_task(run_scrapers_task)
    return {"message": "Scraping started in background"}

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    from sqlalchemy import extract
    import re

    companies = db.query(models.Company).all()
    
    # Process analytics: Vertical x Year
    # Vertical comes from industry. Year needs to be extracted from batch or founded_at.
    # YC Batch regex: (Summer|Winter|Spring|Fall)\s(\d{4})
    # StartX: often just "StartX Alum", but we'll try to find any 4-digit year in string fields.
    
    data = {} # {year: {vertical: count}}
    
    for c in companies:
        year = None
        # Try to extract year from batch
        if c.batch:
            match = re.search(r'20\d{2}', c.batch)
            if match:
                year = match.group(0)
        
        if not year and c.founded_at:
            match = re.search(r'20\d{2}', c.founded_at)
            if match:
                year = match.group(0)
        
        # Fallback for AV: look in logo_url
        if not year and c.source == "AV" and c.logo_url:
            match = re.search(r'/20(\d{2})/', c.logo_url)
            if match:
                year = f"20{match.group(1)}"
        
        if not year:
            year = "Unknown"
            
        verticals = [v.strip() for v in (c.industry or "General").split(",")]
        
        if year not in data:
            data[year] = {}
        
        for v in verticals:
            data[year][v] = data[year].get(v, 0) + 1
            
    # Flatten for frontend
    # [{year: 2024, verticals: {AI: 10, SaaS: 5}}]
    result = []
    for year, verticals in sorted(data.items(), reverse=True):
        result.append({
            "year": year,
            "verticals": verticals
        })
        
    return result

@app.get("/companies", response_model=schemas.PaginatedCompanies)
async def get_companies(
    search: Optional[str] = None,
    source: Optional[str] = None,
    sort_by: str = "id",
    order: str = "desc",
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(models.Company)
    
    if search:
        search_filter = or_(
            models.Company.name.ilike(f"%{search}%"),
            models.Company.problem.ilike(f"%{search}%"),
            models.Company.industry.ilike(f"%{search}%"),
            models.Company.one_liner.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
        
    if source and source != "All":
        query = query.filter(models.Company.source == source)
    
    # Sorting logic
    sort_attr = getattr(models.Company, sort_by, models.Company.id)
    if order.lower() == "asc":
        query = query.order_by(nullslast(sort_attr.asc()))
    else:
        query = query.order_by(nullslast(sort_attr.desc()))
        
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@app.get("/companies/{company_id}", response_model=schemas.Company)
def read_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
