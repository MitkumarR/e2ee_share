import random
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token
from models.user import User
from models.verification import Verification
from extensions import db


class VerificationService:

    def _generate_otp(self):
        """Generate a 6-digit OTP."""
        return str(random.randint(100000, 999999))

    def send_otp(self, email):
        """
        Generates and stores an OTP for a given email address.
        This is the first step of the registration process.
        """
        if User.query.filter_by(email=email).first():
            return {'message': 'An account with this email already exists.'}, 409

        otp = self._generate_otp()

        # Find existing verification entry or create a new one
        verification_entry = Verification.query.filter_by(email=email).first()
        if verification_entry:
            verification_entry.otp = otp
            verification_entry.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
        else:
            verification_entry = Verification(email=email, otp=otp)
            db.session.add(verification_entry)

        db.session.commit()

        # In a real app, send the OTP via an email service (e.g., SendGrid, Mailgun)
        print(f"--- OTP for {email}: {otp} ---")  # Print to console for testing

        return {'message': f'OTP has been sent to {email}.'}, 200

    def verify_otp(self, email, otp_provided):
        """
        Verifies the OTP. If correct, it returns a temporary verification token.
        This is the second step.
        """
        verification_entry = Verification.query.filter_by(email=email).first()

        if not verification_entry:
            return {'message': 'No pending verification for this email.'}, 404

        if verification_entry.otp_expiry < datetime.utcnow():
            return {'message': 'OTP has expired. Please request a new one.'}, 400

        if verification_entry.otp != otp_provided:
            return {'message': 'Invalid OTP.'}, 400

        # Create a short-lived token that proves the email is verified
        verification_token = create_access_token(
            identity=email, expires_delta=timedelta(minutes=15)
        )

        # Clean up the verification entry so the OTP cannot be reused
        db.session.delete(verification_entry)
        db.session.commit()

        return {'message': 'Email verified successfully.', 'verification_token': verification_token}, 200