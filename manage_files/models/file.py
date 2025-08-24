from extensions import db
import datetime

class File(db.Model):
    __tablename__ = 'files'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)

    # This will be the path on disk, e.g., 'uploads/uuid-goes-here.bin'
    file_path = db.Column(db.String(255), unique=True, nullable=False)

    # The AES key, encrypted with the user's RSA public key
    encrypted_aes_key = db.Column(db.Text, nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    size = db.Column(db.Integer, nullable=False) # Size in bytes

    # This links the file to a user in your auth service
    user_id = db.Column(db.Integer, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f'<File {self.filename}>'