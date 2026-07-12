import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden select-none">
      {/* Ambient Background Decorations */}
      <div className="floating-blob w-96 h-96 bg-primary-container top-[-10%] left-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse"></div>
      <div className="floating-blob w-[500px] h-[500px] bg-secondary-container bottom-[-15%] right-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse" style={{ animationDelay: '-5s' }}></div>

      <main className="w-full max-w-[500px] bg-surface-container-lowest rounded-enterprise shadow-2xl p-8 md:p-12 relative z-10 border border-outline-variant/30 flex flex-col justify-center">
        <div className="mb-6 flex justify-center">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-3xl font-bold">lock_open</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 tracking-tight">Reset Password</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {submitted 
              ? "We've sent reset instructions to your email." 
              : "Enter your email address to retrieve your account password."}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-100 text-green-800 rounded-xl text-body-md text-center border border-green-200">
              Check your inbox at <strong>{email}</strong> for instructions to set your new password.
            </div>
            <Link 
              to="/login" 
              className="w-full block text-center bg-primary text-on-primary py-3 rounded-enterprise font-semibold hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="block text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider" htmlFor="email">Work Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface" 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              className="w-full bg-primary text-on-primary py-3.5 rounded-enterprise font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]" 
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-primary text-sm font-bold hover:underline">Back to Login</Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
