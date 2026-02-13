import asyncio
from backend.database import SessionLocal
from backend.enricher import EnrichmentService

async def main():
    db = SessionLocal()
    enricher = EnrichmentService(db)
    await enricher.enrich_all_new()
    db.close()

if __name__ == "__main__":
    asyncio.run(main())
