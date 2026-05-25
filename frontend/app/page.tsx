import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-cardinal/10 flex items-center justify-center shadow-sm">
            <img src="/logo.png" alt="CX" className="w-9 h-9 object-contain" />
          </div>
          <span className="font-display text-2xl font-bold text-thunder tracking-tight">CapstoneX</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-slate hover:text-thunder transition-colors font-medium">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2 rounded-md">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-cardinal-50 text-cardinal text-xs font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-cardinal rounded-full animate-pulse" />
          AI-Powered Academic Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-display text-thunder max-w-3xl mx-auto leading-tight mb-6">
          Capstone Project Governance, <span className="text-cardinal">Reimagined</span>
        </h1>
        <p className="text-lg text-slate max-w-2xl mx-auto mb-10 leading-relaxed">
          CapstoneX brings AI intelligence to academic project management — from smart team formation to risk prediction, logbook tracking to automated evaluations.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-base px-8 py-3 rounded-md">
            Start Free →
          </Link>
          <Link href="#features" className="btn-secondary text-base px-8 py-3 rounded-md">
            Learn More
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-thunder py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '4', label: 'AI Modules' },
            { value: '6', label: 'User Roles' },
            { value: '13', label: 'DB Tables' },
            { value: '100%', label: 'Automated CI/CD' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-display text-white">{s.value}</p>
              <p className="text-sm text-white/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-24">
        <h2 className="text-3xl font-display text-thunder text-center mb-4">Intelligent Features</h2>
        <p className="text-slate text-center mb-16 max-w-xl mx-auto">Every feature is designed with academic workflows in mind, powered by AI</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'AI Recommendations', desc: 'TF-IDF powered project domain matching based on student skills and interests', icon: '🤖' },
            { title: 'Risk Prediction', desc: 'GradientBoosting model predicts project delays before they happen', icon: '⚡' },
            { title: 'Smart Team Formation', desc: 'K-Means clustering creates balanced, diverse teams automatically', icon: '👥' },
            { title: 'AI Feedback', desc: 'Auto-generated evaluation feedback using NLP templates', icon: '💬' },
            { title: 'Logbook Tracking', desc: 'Weekly submission tracking with mentor review and approval workflow', icon: '📓' },
            { title: 'Analytics Dashboards', desc: 'Real-time charts and metrics for every stakeholder role', icon: '📊' },
          ].map((f, i) => (
            <div key={i} className="card">
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="text-lg font-display text-thunder mb-2">{f.title}</h3>
              <p className="text-sm text-slate leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-slate">
        <p>© {new Date().getFullYear()} CapstoneX. Built with Next.js, Express, FastAPI, and PostgreSQL.</p>
      </footer>
    </div>
  );
}
