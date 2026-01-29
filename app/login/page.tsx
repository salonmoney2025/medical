'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === 'super_admin') {
          router.push('/dashboard/admin');
        } else if (data.user.role === 'medical_officer') {
          router.push('/dashboard/medical-officer');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Medical Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 animate-gradient-shift">
        {/* Animated Medical Elements */}
        <div className="absolute inset-0 opacity-20">
          {/* Floating Heartbeat Lines */}
          <svg className="absolute top-20 left-10 w-64 text-blue-400 animate-pulse-slow" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M0 30 L40 30 L50 10 L60 50 L70 30 L200 30" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <svg className="absolute bottom-32 right-20 w-48 text-teal-400 animate-pulse-delayed" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M0 30 L40 30 L50 10 L60 50 L70 30 L200 30" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Medical Icons */}
        <div className="absolute inset-0 opacity-10">
          {/* Stethoscope */}
          <svg className="absolute top-1/4 left-1/4 w-32 h-32 text-blue-500 animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 2a2 2 0 0 1 2 2v6h5a2 2 0 0 1 2 2v2a5 5 0 0 1-10 0v-2a2 2 0 0 1 2-2h5V4a2 2 0 0 1 2-2z"/>
            <circle cx="18" cy="12" r="1.5"/>
          </svg>

          {/* Medical Cross */}
          <svg className="absolute bottom-1/4 right-1/4 w-24 h-24 text-teal-500 animate-float-delayed" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z"/>
          </svg>

          {/* Heart with Pulse */}
          <svg className="absolute top-1/2 right-1/3 w-28 h-28 text-rose-400 animate-heartbeat" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>

          {/* DNA Helix */}
          <svg className="absolute bottom-1/3 left-1/3 w-20 h-32 text-indigo-400 animate-spin-slow" viewBox="0 0 24 48" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4 Q12 8 18 4 M6 14 Q12 10 18 14 M6 24 Q12 28 18 24 M6 34 Q12 30 18 34 M6 44 Q12 48 18 44" strokeLinecap="round"/>
          </svg>

          {/* Medical Pills */}
          <svg className="absolute top-2/3 left-1/4 w-16 h-16 text-cyan-500 animate-bounce-slow" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="8" opacity="0.7"/>
            <rect x="4" y="4" width="16" height="8" rx="4" opacity="0.9"/>
          </svg>
        </div>

        {/* Soft Glowing Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-300/20 to-teal-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-teal-200/15 to-cyan-200/15 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Login Card with Glass-morphism */}
      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-2xl bg-white/60 rounded-3xl shadow-2xl p-10 border border-white/60 hover:bg-white/70 transition-all duration-500 hover:shadow-blue-500/20 hover:scale-[1.02]">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform hover:rotate-6 transition-transform duration-300">
                <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M12 14v7m-3-3l3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Student Medical Records
            </h1>
            <p className="text-slate-600 text-sm font-medium flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-teal-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Healthcare Management System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-300 text-red-700 px-4 py-3 rounded-xl animate-shake">
                <p className="text-sm font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-slate-700 text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm text-slate-800 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder-slate-400 shadow-sm hover:bg-white/80"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-slate-700 text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm text-slate-800 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder-slate-400 shadow-sm hover:bg-white/80"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 via-teal-500 to-cyan-500 hover:from-blue-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-95 transform"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-50/70 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <p className="text-blue-700 text-sm font-medium">
                Authorized Personnel Only
              </p>
            </div>
            <p className="text-slate-500 text-xs">
              ERKUST Medical Records Portal
            </p>
          </div>
        </div>

        {/* Decorative Medical Elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-teal-300/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          50% {
            transform: translateY(20px) scale(1.05) rotate(5deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }

        @keyframes pulse-delayed {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.35;
            transform: scale(1.08);
          }
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10% {
            transform: scale(1.1);
          }
          20% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.1);
          }
          40% {
            transform: scale(1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 20s ease infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }

        .animate-pulse-delayed {
          animation: pulse-delayed 7s ease-in-out infinite;
        }

        .animate-heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
