import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:5050/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }
      setMessage("Your password has been successfully reset.");
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden select-none">
      <div className="floating-blob w-96 h-96 bg-primary-container top-[-10%] left-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse"></div>
      <div className="floating-blob w-[500px] h-[500px] bg-secondary-container bottom-[-15%] right-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse" style={{ animationDelay: '-5s' }}></div>

      <main className="w-full max-w-[500px] bg-surface-container-lowest rounded-enterprise shadow-2xl p-8 md:p-12 relative z-10 border border-outline-variant/30 flex flex-col justify-center">
        <div className="mb-6 flex justify-center">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-3xl font-bold">lock_reset</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 tracking-tight">Set New Password</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Please choose a secure password for your account.</p>
        </div>

        {error && (
          <div className="p-4 bg-error-container text-error rounded-xl text-body-md text-center border border-error/20 mb-4">
            {error}
          </div>
        )}

        {message ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-100 text-green-800 rounded-xl text-body-md text-center border border-green-200">
              {message} Redirecting to login...
            </div>
            <Link 
              to="/login" 
              className="w-full block text-center bg-primary text-on-primary py-3 rounded-enterprise font-semibold hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="block text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider" htmlFor="password">New Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface" 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface" 
                  id="confirmPassword" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              className="w-full bg-primary text-on-primary py-3.5 rounded-enterprise font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]" 
              type="submit"
              disabled={loading || !token}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
