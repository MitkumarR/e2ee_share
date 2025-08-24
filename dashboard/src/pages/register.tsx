// In dashboard/src/pages/register.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Step 1: Send OTP to user's email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5001/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setStep('otp'); // Move to next step
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  // Step 2: Verify the OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5001/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      // NOTE: The backend sends a 'verification_token' which should ideally
      // be used in the final registration step for better security.
      // The current backend implementation does not use it.
      setStep('details'); // Move to final step
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  // Step 3: Complete registration with user details
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Registration successful, redirect to login
      navigate('/login');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        {/* Render different forms based on the current step */}
        
        {step === 'email' && (
          <form onSubmit={handleSendOtp}>
            <h1 className="text-2xl font-bold text-center">Create Account</h1>
            <p className="text-sm text-center text-gray-600">Enter your email to start</p>
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            <div className="mt-4">
              <label htmlFor="email-address">Email address</label>
              <input id="email-address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <button type="submit" className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700">Send OTP</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <h1 className="text-2xl font-bold text-center">Verify Email</h1>
            <p className="text-sm text-center text-gray-600">An OTP was sent to {email}</p>
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            <div className="mt-4">
              <label htmlFor="otp">OTP</label>
              <input id="otp" type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <button type="submit" className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700">Verify</button>
          </form>
        )}

        {step === 'details' && (
          <form onSubmit={handleRegister}>
            <h1 className="text-2xl font-bold text-center">Final Details</h1>
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            <div className="mt-4">
              <label htmlFor="username">Username</label>
              <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="mt-4">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white" />
            </div>
            <button type="submit" className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700">Create Account</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;