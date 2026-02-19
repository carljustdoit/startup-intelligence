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

import os

# CORS Configuration
# Allow local development, your Mac's IP, and the production Vercel URL
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.110:3000",
]
env_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
# Use a more permissive set for production to handle Vercel preview URLs
allowed_origins = [origin.strip() for origin in env_origins if origin.strip()] + default_origins
if not os.getenv("ALLOWED_ORIGINS"):
    allowed_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
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
        yc = YCScraper(db, batches=["Summer 2024"])
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
async def trigger_scrape(background_tasks: BackgroundTasks, admin_key: str = Query(None)):
    expected_key = os.getenv("ADMIN_KEY", "changeme")
    if admin_key != expected_key:
        raise HTTPException(status_code=403, detail="Unauthorized. Invalid admin key.")
    if SCRAPE_STATUS["is_running"]:
        return {"message": "Scrape already in progress"}
    background_tasks.add_task(run_scrapers_task)
    return {"message": "Scraping started in background"}

import anyio

@app.get("/analytics")
async def get_analytics(db: Session = Depends(get_db)):
    from sqlalchemy import extract
    import re

    companies = await anyio.to_thread.run_sync(lambda: db.query(models.Company).all())
    
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
    by_year = []
    for year, verticals in sorted(data.items(), reverse=True):
        by_year.append({
            "year": year,
            "verticals": verticals
        })

    # Consolidated stats for Pie Charts
    total_companies = len(companies)
    industry_counts = {}
    source_counts = {}
    for c in companies:
        v_list = [v.strip() for v in (c.industry or "General").split(",")]
        for v in v_list:
            industry_counts[v] = industry_counts.get(v, 0) + 1
        source_counts[c.source] = source_counts.get(c.source, 0) + 1
        
    return {
        "total_companies": total_companies,
        "industry_distribution": [{"industry": k, "count": v} for k, v in sorted(industry_counts.items(), key=lambda x: x[1], reverse=True)],
        "source_distribution": [{"source": k, "count": v} for k, v in source_counts.items()],
        "by_year": by_year
    }

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
        
    total = await anyio.to_thread.run_sync(query.count)
    items = await anyio.to_thread.run_sync(lambda: query.offset((page - 1) * size).limit(size).all())
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@app.get("/companies/{company_id}", response_model=schemas.Company)
async def read_company(company_id: int, db: Session = Depends(get_db)):
    company = await anyio.to_thread.run_sync(lambda: db.query(models.Company).filter(models.Company.id == company_id).first())
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
