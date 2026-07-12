import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Signup() {
  const { signup } = useContext(AppContext);
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[@$!%*?&#]/.test(pwd)) score++;
    if (score <= 2) return { level: 'Weak', color: 'bg-error', textColor: 'text-error', width: 'w-1/3' };
    if (score <= 3) return { level: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600', width: 'w-2/3' };
    return { level: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600', width: 'w-full' };
  };
  const passwordStrength = getPasswordStrength(password);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    // Password Complexity Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ok = await signup({
        name,
        email,
        password,
        role,
        phone,
        department: "None",
        manager: "None"
      });
      setLoading(false);
      if (ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError("A user account with this email address already exists.");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "An error occurred during signup.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden select-none">
      {/* Ambient Background Decorations */}
      <div className="floating-blob w-96 h-96 bg-primary-container top-[-10%] left-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse"></div>
      <div className="floating-blob w-[500px] h-[500px] bg-secondary-container bottom-[-15%] right-[-10%] rounded-full absolute filter blur-[80px] opacity-40 z-0 animate-pulse" style={{ animationDelay: '-5s' }}></div>

      <main className="w-full max-w-[1200px] bg-surface-container-lowest rounded-enterprise shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[720px] relative z-10 border border-outline-variant/30">
        
        {/* Left Side - Illustration */}
        <div className="hidden md:flex md:w-1/2 relative bg-primary overflow-hidden p-12 flex-col justify-between">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/85 to-primary-container mix-blend-multiply"></div>
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAi5sN_uAr_eWeX_sUdSezNbgD6UP2-NQMriyGRBPj8bxQys80WD0Iimvi8AQWQQ_NvUC9X-lrToorcCZonGtGb8uH_CozVBO0KO4s3G2VMA83CgoIzBbpLjQT38AmVBty4eNLSj8udpTepDfmkAoKYpK5L92IpyQYAcZiq0hIy4aV5c0wYGQ1CIX5Mz6U29-2jX6ytLCRRa0BQ9YSTdXMKLj697Yy80_be8JX1MgJXl-wkDkGnX3PkqpGzdBEVNceAOHTeNPPwJQ1j')" }}
            ></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-primary text-2xl font-bold">account_balance_wallet</span>
              </div>
              <span className="font-headline-md text-headline-md text-white tracking-tight leading-none">AssetFlow</span>
            </div>
          </div>

          <div className="relative z-10 max-w-sm">
            <h1 className="font-headline-lg text-headline-lg text-white mb-4 leading-tight">Create your Enterprise Account</h1>
            <p className="font-body-lg text-body-lg text-primary-fixed-dim/90 leading-relaxed">Register as an employee to access your organization's physical and digital resources.</p>
            
            <div className="mt-12 flex flex-col gap-6">
              <div className="flex items-center gap-4 text-white/90">
                <span className="material-symbols-outlined text-white">shield</span>
                <span className="font-body-md text-body-md">Role-based access controls</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <span className="material-symbols-outlined text-white">sync</span>
                <span className="font-body-md text-body-md">Real-time status updates</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-primary-fixed-dim font-body-md font-semibold">
            <span>SOC2 Compliance Certified Platform</span>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-surface-container-lowest justify-between">
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 tracking-tight">Get Started</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Sign up to join your team workspace.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSignup}>
              {error && (
                <div className="p-3.5 bg-error-container text-on-error-container rounded-xl text-body-md flex items-center gap-2 border border-error/20 animate-fadeIn">
                  <span className="material-symbols-outlined text-[20px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-green-100 text-green-800 rounded-xl text-body-md flex items-center gap-2 border border-green-200 animate-fadeIn">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Registration successful! Redirecting to login...</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider" htmlFor="name">Full Name *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person</span>
                  <input 
                    className="w-full pl-12 pr-4 py-2.5 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface" 
                    id="name" 
                    placeholder="Jane Doe" 
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    required
                  />
                </div>
              </div>

              {/* Work Email */}
              <div className="space-y-1">
                <label className="block text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider" htmlFor="email">Work Email *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                  <input 
                    className="w-full pl-12 pr-4 py-2.5 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface" 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider" htmlFor="password">Password *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                  <input 
                    className="w-full pl-12 pr-4 py-2.5 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                  />
                </div>
                {/* Live Password Strength Meter */}
                {passwordStrength && (
                  <div className="pt-1.5 space-y-1">
                    <div className="h-1.5 w-full bg-outline-variant/30 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}></div>
                    </div>
                    <p className={`text-[11px] font-bold ${passwordStrength.textColor}`}>
                      Password strength: {passwordStrength.level}
                      {passwordStrength.level === 'Weak' && ' — add uppercase, numbers & symbols'}
                      {passwordStrength.level === 'Fair' && ' — add a special character to strengthen'}
                    </p>
                  </div>
                )}
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-1">
                <label className="block text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">phone</span>
                  <input 
                    className="w-full pl-12 pr-4 py-2.5 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface" 
                    id="phone" 
                    placeholder="+1 (555) 000-0000" 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Selector (Demo simulation support) */}
              <div className="space-y-1">
                <label className="block text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider" htmlFor="role">Requested Role</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">badge</span>
                  <select
                    className="w-full pl-12 pr-4 py-2.5 rounded-enterprise border border-outline-variant bg-surface-container-low focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body-md text-on-surface appearance-none"
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Admin">Admin (Access Settings/Org)</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Employee">Employee</option>
                    <option value="Auditor">Auditor</option>
                    <option value="Viewer">Viewer (Read-only)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>

              <button 
                className="w-full bg-primary text-on-primary py-3 rounded-enterprise font-sidebar-item text-sidebar-item shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] mt-4 font-semibold" 
                type="submit"
                disabled={loading || success}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have an account? 
              <Link className="text-primary font-bold hover:underline ml-1" to="/login">Sign In</Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
