'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, Cpu, LayoutDashboard, Sparkles, Loader2, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { setAccessToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDemo, setSelectedDemo] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      // Use in-memory token storage (Phase 1 Security)
      setAccessToken(data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const redirectMap: Record<string, string> = {
        student: '/student', mentor: '/mentor',
        hod: '/mentor', admin: '/admin', accreditation: '/mentor',
      };
      
      // Artificial slight delay for UX smooth transition if fetching was too fast
      setTimeout(() => {
        router.push(redirectMap[data.user.role] || '/student');
      }, 300);
      
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleDemoClick = (role: string, demoEmail: string) => {
    setSelectedDemo(role);
    setEmail(demoEmail);
    setPassword('CapstoneX@2024');
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Left Panel — Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0F172A] via-[#1a2744] to-[#0F172A] relative overflow-hidden items-center justify-center border-r border-white/10"
      >
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-cardinal-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-glow" />
        <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" style={{ animation: 'pulse-glow 8s infinite alternate-reverse' }} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.05]" />

        <div className="relative z-10 p-10 text-white max-w-lg w-full">
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center ring-1 ring-white/20 shadow-xl shadow-black/20">
                <img src="/logo.png" alt="CX" className="w-7 h-7 object-contain brightness-0 invert" />
              </div>
              <div>
                <span className="font-display text-2xl block leading-tight font-bold tracking-tight">CapstoneX</span>
                <span className="text-[10px] text-cardinal-300 font-semibold uppercase tracking-[0.2em]">Platform</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-[40px] font-display mb-4 leading-[1.1] font-medium tracking-tight">
              Govern projects with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cardinal-400 to-orange-300">
                Intelligent Insights
              </span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed mb-8 font-light max-w-[400px]">
              AI-powered academic project governance. Manage your capstone journey seamlessly.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '4+', label: 'AI Modules', icon: Sparkles }, 
                { value: '6', label: 'User Roles', icon: Users }, 
                { value: '100%', label: 'Automated', icon: LayoutDashboard }
              ].map((s, i) => (
                <div key={i} className="flex flex-col border-l-2 border-white/10 pl-3">
                  <span className="text-2xl font-display font-semibold text-white tracking-tight">{s.value}</span>
                  <span className="text-[13px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-slate-50/50 h-full overflow-y-auto">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cardinal-50/50 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[400px]"
        >
          <div className="lg:hidden mb-6 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cardinal-500 to-cardinal-700 flex items-center justify-center shadow-lg shadow-cardinal/20">
              <img src="/logo.png" alt="CX" className="w-7 h-7 object-contain brightness-0 invert" />
            </div>
            <span className="font-display text-xl font-bold text-thunder tracking-tight">CapstoneX</span>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-display font-semibold text-slate-900 mb-1 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="overflow-hidden mb-4"
              >
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-start gap-2 shadow-sm">
                  <div className="p-1 bg-red-100 rounded-md shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </div>
                  <span className="leading-snug font-medium text-[13px]">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Input 
                  label="Email Address" 
                  type="email" 
                  placeholder="you@university.edu" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  id="login-email" 
                  icon={<Mail className="w-4 h-4" />}
                  className="bg-slate-50 hover:bg-white focus:bg-white transition-colors"
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  id="login-password" 
                  icon={<Lock className="w-4 h-4" />}
                  className="bg-slate-50 hover:bg-white focus:bg-white transition-colors"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-between text-[13px] pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer appearance-none w-3.5 h-3.5 rounded-[4px] border-slate-300 checked:bg-cardinal-600 checked:border-cardinal-600 transition-all cursor-pointer" id="remember-me" />
                    <svg className="absolute w-2.5 h-2.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="group-hover:text-slate-900 transition-colors">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-cardinal-600 hover:text-cardinal-700 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm font-medium shadow-lg shadow-cardinal-500/20 bg-gradient-to-r from-cardinal-600 to-cardinal-500 hover:from-cardinal-700 hover:to-cardinal-600" 
                  disabled={loading}
                  id="login-submit"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center mb-3">Quick Access Demo</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { role: 'Student', email: 'student1@capstonex.com' },
                  { role: 'Mentor', email: 'mentor1@capstonex.com' },

                  { role: 'Admin', email: 'admin@capstonex.com' }
                ].map(demo => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleDemoClick(demo.role, demo.email)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg transition-all duration-200 font-medium border flex items-center gap-1.5
                      ${selectedDemo === demo.role 
                        ? 'bg-cardinal-50 border-cardinal-200 text-cardinal-700 shadow-sm ring-1 ring-cardinal-100' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm'
                      }`}
                  >
                    {demo.role}
                  </button>
                ))}
              </div>
            </motion.div>
          </form>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-5 text-center text-[13px] text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-cardinal-600 font-semibold hover:text-cardinal-700 transition-colors">Create one</Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
