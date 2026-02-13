from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    logo_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    one_liner = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    source = Column(String, index=True)  # e.g., "YC", "StartX", "AV"
    batch = Column(String, nullable=True) # e.g., "W24", "S23"
    status = Column(String, nullable=True) # e.g., "Active", "Acquired", "Dead"
    industry = Column(String, nullable=True)
    location = Column(String, nullable=True)
    funding_raised = Column(String, nullable=True) # e.g., "$1.2M", "Series A"
    problem = Column(Text, nullable=True)
    team_size = Column(Integer, nullable=True)
    founded_at = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    founders = relationship("Founder", back_populates="company", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Company(name='{self.name}', source='{self.source}')>"

class Founder(Base):
    __tablename__ = "founders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    linkedin_url = Column(String, nullable=True)
    role = Column(String, nullable=True) # e.g., "CEO", "CTO"
    experience_years = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="founders")

    def __repr__(self):
        return f"<Founder(name='{self.name}', role='{self.role}')>"
