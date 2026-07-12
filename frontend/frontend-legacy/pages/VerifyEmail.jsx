import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError("Missing email verification token.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('http://localhost:5050/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Verification failed.');
        }
        setSuccess(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden select-none">
      <div className="floating-blob w-96 h-96 bg-primary-container top-[-10%] left-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse"></div>
      <div className="floating-blob w-[500px] h-[500px] bg-secondary-container bottom-[-15%] right-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse" style={{ animationDelay: '-5s' }}></div>

      <main className="w-full max-w-[500px] bg-surface-container-lowest rounded-enterprise shadow-2xl p-8 md:p-12 relative z-10 border border-outline-variant/30 flex flex-col justify-center text-center">
        <div className="mb-6 flex justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${loading ? 'bg-primary' : (success ? 'bg-green-600' : 'bg-red-600')}`}>
            <span className="material-symbols-outlined text-4xl font-bold">
              {loading ? 'sync' : (success ? 'verified' : 'error')}
            </span>
          </div>
        </div>

        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 tracking-tight">
          {loading ? 'Verifying Account...' : (success ? 'Account Activated!' : 'Verification Failed')}
        </h2>

        <div className="my-6 text-on-surface-variant font-body-lg">
          {loading && <p>Please wait while we confirm your email verification link...</p>}
          {success && <p>Thank you! Your work email has been verified. You can now access the AssetFlow ERP system.</p>}
          {error && <p className="text-error">{error}</p>}
        </div>

        <Link 
          to="/login" 
          className="w-full block text-center bg-primary text-on-primary py-3 rounded-enterprise font-semibold hover:opacity-90 transition-all active:scale-[0.98]"
        >
          Go to Sign In
        </Link>
      </main>
    </div>
  );
}
