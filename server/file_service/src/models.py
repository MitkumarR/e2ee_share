from src import db
from datetime import datetime
import uuid

class File(db.Model):
    __tablename__ = 'files'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_user_id = db.Column(db.Integer, nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    content_type = db.Column(db.String(100), nullable=False)
    size = db.Column(db.BigInteger, nullable=False) # Store size in bytes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Placeholder for actual storage location (e.g., S3 path or local path)
    storage_path = db.Column(db.String(1024), nullable=False)

    # For soft delete and archiving
    status = db.Column(db.String(20), default='active', nullable=False) # active, trashed, archived

    def to_dict(self):
        return {
            "id": self.id,
            "owner_user_id": self.owner_user_id,
            "filename": self.filename,
            "size": self.size,
            "created_at": self.created_at.isoformat(),
            "status": self.status
        }