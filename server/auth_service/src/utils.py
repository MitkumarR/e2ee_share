# auth_service/utils.py
# This file contains utility functions for the application.

import random
import string
from flask_mail import Message
from src import mail

def generate_otp(length=6):
    """Generate a random OTP."""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(user_email, otp):
    """Sends an OTP to the user's email address."""
    try:
        msg = Message('Your Verification Code', recipients=[user_email])
        msg.body = f'Your OTP for registration is: {otp}\nThis code will expire in 10 minutes.'
        mail.send(msg)
        return True
    except Exception as e:
        # In a real application, you should log this error.
        print(f"Error sending email: {e}")
        return False
