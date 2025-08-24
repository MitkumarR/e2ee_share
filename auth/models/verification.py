from extensions import db
from datetime import datetime, timedelta

class Verification(db.Model):
    __tablename__ = 'verifications'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    otp = db.Column(db.String(6), nullable=False)
    otp_expiry = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, email, otp):
        self.email = email
        self.otp = otp
        self.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
