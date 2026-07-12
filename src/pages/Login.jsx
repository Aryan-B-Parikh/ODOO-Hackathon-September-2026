import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Login() {
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('admin@assetflow.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Language selector state
  const [selectedLang, setSelectedLang] = useState("English (US)");

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate premium loader
    setTimeout(() => {
      const success = login(email, password);
      setLoading(false);
      if (success) {
        navigate('/dashboard');
      } else {
        setError("Invalid email address format.");
      }
    }, 1200);
  };

  const handleSSOSignIn = (provider) => {
    setLoading(true);
    setTimeout(() => {
      login(`${provider.toLowerCase()}@assetflow.com`, 'sso_auth');
      setLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden select-none">
      {/* Ambient Background Decorations */}
      <div className="floating-blob w-96 h-96 bg-primary-container top-[-10%] left-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse"></div>
      <div className="floating-blob w-[500px] h-[500px] bg-secondary-container bottom-[-15%] right-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse" style={{ animationDelay: '-5s' }}></div>

      <main className="w-full max-w-[1200px] bg-surface-container-lowest rounded-enterprise shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[720px] relative z-10 border border-outline-variant/30">
        
        {/* Left Side - Illustration */}
        <div className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden p-12 flex-col justify-between">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/85 to-primary-container mix-blend-multiply"></div>
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAi5sN_uAr_eWeX_sUdSezNbgD6UP2-NQMriyGRBPj8bxQys80WD0Iimvi8AQWQQ_NvUC9X-lrToorcCZonGtGb8uH_CozVBO0KO4s3G2VMA83CgoIzBbpLjQT38AmVBty4eNLSj8udpTepDfmkAoKYpK5L92IpyQYAcZiq0hIy4aV5c0wYGQ1CIX5Mz6U29-2jX6ytLCRRa0BQ9YSTdXMKLj697Yy80_be8JX1MgJXl-wkDkGnX3PkqpGzdBEVNceAOHTeNPPwJQ1j')" }}
            ></div>
          </div>
          
          {/* Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-primary text-2xl font-bold">account_balance_wallet</span>
              </div>
              <span className="font-headline-md text-headline-md text-white tracking-tight leading-none">AssetFlow</span>
            </div>
          </div>

          {/* Feature details */}
          <div className="relative z-10 max-w-sm">
            <h1 className="font-headline-lg text-headline-lg text-white mb-4 leading-tight">Precision Asset Management for Global Teams.</h1>
            <p className="font-body-lg text-body-lg text-primary-fixed-dim/90 leading-relaxed">Centralize your hardware, software, and physical assets with enterprise-grade security and real-time auditing.</p>
            
            <div className="mt-12 flex flex-col gap-6">
              <div className="flex items-center gap-4 text-white/90">
                <span className="material-symbols-outlined text-white">verified_user</span>
                <span className="font-body-md text-body-md">SOC2 Type II Certified infrastructure</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <span className="material-symbols-outlined text-white">speed</span>
                <span className="font-body-md text-body-md">99.99% Uptime SLA for enterprise tier</span>
              </div>
            </div>
          </div>

          {/* Trusted label */}
          <div className="relative z-10 flex items-center gap-4 text-primary-fixed-dim font-body-md font-semibold">
            <span>Trusted by over 500+ global enterprises</span>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col bg-surface-container-lowest justify-between">
          
          {/* Language Selector Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="md:hidden flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl font-bold">account_balance_wallet</span>
              <span className="font-headline-md text-headline-md text-on-surface">AssetFlow</span>
            </div>
            
            <div className="relative group ml-auto">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">language</span>
                <span className="font-body-md text-body-md">{selectedLang}</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
              
              {/* Language Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-outline-variant shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
                {["English (US)", "Deutsch", "Français", "日本語"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className="w-full text-left block px-4 py-2.5 font-body-md text-body-md hover:bg-surface-container-high text-on-surface transition-colors"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Form Box */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 tracking-tight">Welcome back</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Access your dashboard and manage assets.</p>
            </div>

            {/* SSO Logins */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                type="button"
                onClick={() => handleSSOSignIn('Google')}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-enterprise border border-outline-variant hover:bg-surface-container-low transition-all font-body-md text-body-md text-on-surface shadow-sm active:scale-95 bg-surface"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                </svg>
                <span>Google</span>
              </button>
              <button 
                type="button"
                onClick={() => handleSSOSignIn('Microsoft')}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-enterprise border border-outline-variant hover:bg-surface-container-low transition-all font-body-md text-body-md text-on-surface shadow-sm active:scale-95 bg-surface"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23">
                  <path d="M1 1h10v10H1z" fill="#f35325"></path>
                  <path d="M12 1h10v10H12z" fill="#81bc06"></path>
                  <path d="M1 12h10v10H1z" fill="#05a6f0"></path>
                  <path d="M12 12h10v10H12z" fill="#ffba08"></path>
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            {/* Separator */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-container-lowest px-4 text-on-surface-variant font-label-caps font-semibold">Or continue with email</span>
              </div>
            </div>

            {/* Credentials Form */}
            <form className="space-y-6" onSubmit={handleSignIn}>
              {error && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl text-body-md flex items-center gap-2 border border-error/20 animate-fadeIn">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block font-label-caps text-on-surface-variant font-semibold text-[12px] tracking-wider uppercase" htmlFor="email">Work Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                  <input 
                    className="w-full pl-12 pr-4 py-3 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface" 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-label-caps text-on-surface-variant font-semibold text-[12px] tracking-wider uppercase" htmlFor="password">Password</label>
                  <a className="font-body-md text-primary hover:underline text-[13px] font-semibold" href="#forgot">Forgot password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                  <input 
                    className="w-full pl-12 pr-12 py-3 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 focus:ring-2 cursor-pointer" 
                  id="remember" 
                  type="checkbox"
                  defaultChecked
                />
                <label className="font-body-md text-on-surface-variant cursor-pointer select-none font-semibold text-[14px]" htmlFor="remember">Remember me for 30 days</label>
              </div>

              <button 
                className="w-full bg-primary text-on-primary py-4 rounded-enterprise font-sidebar-item text-sidebar-item shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] mt-4 font-semibold" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span>Sign In to AssetFlow</span>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Actions */}
          <div>
            <div className="mt-8 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Don't have an enterprise account? 
                <a className="text-primary font-bold hover:underline ml-1" href="#contact">Contact Sales</a> or 
                <a className="text-primary font-bold hover:underline ml-1" href="#trial">Start Free Trial</a>
              </p>
            </div>
            
            {/* Footer Small Print */}
            <div className="mt-8 pt-6 border-t border-outline-variant/30 flex flex-wrap justify-center gap-6">
              <a className="font-label-caps text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-wider text-[11px]" href="#privacy">Privacy Policy</a>
              <a className="font-label-caps text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-wider text-[11px]" href="#terms">Terms of Service</a>
              <a className="font-label-caps text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-wider text-[11px]" href="#security">Security</a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
