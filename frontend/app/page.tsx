import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-8 py-3 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center shadow-glow">
              <img src="/logo.png" alt="CX" className="w-7 h-7 object-contain brightness-0 invert" />
            </div>
            <span className="font-display text-xl text-thunder tracking-tight">CapstoneX</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate hover:text-thunder transition-colors font-medium">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2 rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-cardinal/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-cardinal/5 to-transparent rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-cardinal-50 text-cardinal text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-cardinal-100 animate-fade-in">
            <span className="w-2 h-2 bg-cardinal rounded-full animate-pulse" />
            AI-Powered Academic Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-display text-thunder max-w-4xl mx-auto leading-[1.1] mb-6 animate-slide-up">
            Capstone Project Governance,{' '}
            <span className="gradient-text">Reimagined</span>
          </h1>
          <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            CapstoneX brings AI intelligence to academic project management — from smart team formation to risk prediction, logbook tracking to automated evaluations.
          </p>
          <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 rounded-xl inline-flex items-center gap-2 group">
              Start Free 
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="#features" className="btn-secondary text-base px-8 py-3.5 rounded-xl">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
          {[
            { value: '4', label: 'AI Modules', icon: '🤖' },
            { value: '6', label: 'User Roles', icon: '👥' },
            { value: '13', label: 'DB Tables', icon: '🗄️' },
            { value: '100%', label: 'Automated CI/CD', icon: '🚀' },
          ].map((s, i) => (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="text-2xl mb-2 block">{s.icon}</span>
              <p className="text-4xl font-display text-white mb-1">{s.value}</p>
              <p className="text-sm text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-28">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-cardinal mb-3 block">Features</span>
          <h2 className="text-4xl md:text-5xl font-display text-thunder mb-4">Intelligent Features</h2>
          <p className="text-slate text-lg max-w-xl mx-auto">Every feature is designed with academic workflows in mind, powered by AI</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'AI Recommendations', desc: 'TF-IDF powered project domain matching based on student skills and interests', icon: '🤖', color: 'from-violet-500/10 to-purple-500/10' },
            { title: 'Risk Prediction', desc: 'GradientBoosting model predicts project delays before they happen', icon: '⚡', color: 'from-amber-500/10 to-orange-500/10' },
            { title: 'Smart Team Formation', desc: 'K-Means clustering creates balanced, diverse teams automatically', icon: '👥', color: 'from-blue-500/10 to-cyan-500/10' },
            { title: 'AI Feedback', desc: 'Auto-generated evaluation feedback using NLP templates', icon: '💬', color: 'from-emerald-500/10 to-green-500/10' },
            { title: 'Logbook Tracking', desc: 'Weekly submission tracking with mentor review and approval workflow', icon: '📓', color: 'from-rose-500/10 to-pink-500/10' },
            { title: 'Analytics Dashboards', desc: 'Real-time charts and metrics for every stakeholder role', icon: '📊', color: 'from-sky-500/10 to-indigo-500/10' },
          ].map((f, i) => (
            <div key={i} className="group card hover:border-gray-200 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-display text-thunder mb-2">{f.title}</h3>
              <p className="text-sm text-slate leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-8 mb-16">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#0F172A] via-[#1a2744] to-[#0F172A] rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cardinal/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display text-white mb-4">Ready to transform your capstone workflow?</h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">Join academic institutions using AI-powered project governance</p>
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 rounded-xl inline-flex items-center gap-2">
              Get Started Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center">
                <img src="/logo.png" alt="CX" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="font-display text-lg text-thunder">CapstoneX</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate">
              <span>Built with Next.js, Express, FastAPI, PostgreSQL</span>
            </div>
            <p className="text-sm text-slate/50">© {new Date().getFullYear()} CapstoneX</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
