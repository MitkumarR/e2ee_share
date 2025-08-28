# In utils.py

import random
from flask_mail import Message
from src import mail

def generate_otp(length=6):
    """Generates a random 6-digit OTP."""
    return "".join([str(random.randint(0, 9)) for _ in range(length)])

def send_otp_email(user_email, otp, otp_expiration_minutes):
    """Sends an OTP to the user's email address."""
    try:
        msg = Message('Your E2EE Share Verification Code', recipients=[user_email])
        msg.body = f'Your verification code is: {otp}\nThis code will expire in {otp_expiration_minutes} minutes.'
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False