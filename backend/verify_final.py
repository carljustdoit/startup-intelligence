from backend.database import SessionLocal
from backend.models import Company, Founder

def verify_data():
    db = SessionLocal()
    try:
        yc_count = db.query(Company).filter(Company.source == 'YC').count()
        sx_count = db.query(Company).filter(Company.source == 'StartX').count()
        av_count = db.query(Company).filter(Company.source == 'AV').count()
        founder_count = db.query(Founder).count()
        
        print(f"Data Summary:")
        print(f"  - YC Companies: {yc_count}")
        print(f"  - StartX Companies: {sx_count}")
        print(f"  - AV Companies: {av_count}")
        print(f"  - Total Founders: {founder_count}")
        
        print("\nYC Detailed Check:")
        yc_comp = db.query(Company).filter(Company.source == 'YC').first()
        if yc_comp:
            print(f"  Sample Company: {yc_comp.name}")
            print(f"  Problem: {yc_comp.problem[:100] if yc_comp.problem else 'None'}...")
            print(f"  Team Size: {yc_comp.team_size}")
            
            founders = db.query(Founder).filter(Founder.company_id == yc_comp.id).all()
            print(f"  Founders ({len(founders)}):")
            for f in founders:
                print(f"    - {f.name} ({f.role})")
                print(f"      Bio: {f.bio[:100] if f.bio else 'None'}...")
                print(f"      LinkedIn: {f.linkedin_url}")
        
        print("\nAV Detailed Check:")
        av_comp = db.query(Company).filter(Company.source == 'AV').first()
        if av_comp:
            print(f"  Sample Company: {av_comp.name}")
            print(f"  One-liner: {av_comp.one_liner[:100]}...")
            print(f"  Website: {av_comp.website}")
            
    finally:
        db.close()

if __name__ == "__main__":
    verify_data()
