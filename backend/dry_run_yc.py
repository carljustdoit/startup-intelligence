import asyncio
from backend.database import SessionLocal
from backend.scrapers.yc_scraper import YCScraper

async def main():
    db = SessionLocal()
    # Only crawl S24 for a quick verification
    scraper = YCScraper(db, batches=["S24"])
    # We manually override the list inside fetch_data or just let it run
    # For the script, we just run it.
    await scraper.run()
    db.close()

if __name__ == "__main__":
    asyncio.run(main())
