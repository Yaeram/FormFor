from app.models import Base
from app.database import engine

print("Creating database tables if they don't exist...")
Base.metadata.create_all(bind=engine)
print("Done.")