from abc import ABC, abstractmethod
from typing import List
from sqlalchemy.orm import Session
from models import Company

class BaseScraper(ABC):
    def __init__(self, db: Session):
        self.db = db

    @abstractmethod
    async def fetch_data(self) -> List[dict]:
        """Fetch raw data from the source."""
        pass

    @abstractmethod
    async def process_data(self, data: List[dict]):
        """Process and save data to the database."""
        pass

    async def run(self):
        """Main execution method."""
        print(f"Starting {self.__class__.__name__}...")
        try:
            data = await self.fetch_data()
            await self.process_data(data)
            print(f"Finished {self.__class__.__name__}.")
        except Exception as e:
            print(f"Error running {self.__class__.__name__}: {e}")
