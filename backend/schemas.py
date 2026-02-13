from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    website: Optional[str] = None
    one_liner: Optional[str] = None
    description: Optional[str] = None
    source: str
    batch: Optional[str] = None
    status: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    funding_raised: Optional[str] = None
    problem: Optional[str] = None
    team_size: Optional[int] = None
    founded_at: Optional[str] = None

class FounderBase(BaseModel):
    name: str
    linkedin_url: Optional[str] = None
    role: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None

class FounderCreate(FounderBase):
    pass

class Founder(FounderBase):
    id: int
    company_id: int

    class Config:
        from_attributes = True

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    founders: List[Founder] = []

    class Config:
        from_attributes = True

class PaginatedCompanies(BaseModel):
    items: List[Company]
    total: int
    page: int
    size: int
    pages: int
