import { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/hooks/useRouter';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) navigate('#/');
  }, [user]);

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !form.name) {
      setError('Please enter your full name.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    if (mode === 'signup') {
      const { error: err } = await signUp(form.email, form.password, form.name);
      if (err) { setError(err); setLoading(false); return; }
      setSuccess('Account created! You are now signed in.');
    } else {
      const { error: err } = await signIn(form.email, form.password);
      if (err) {
        setError(err.includes('Invalid') ? 'Incorrect email or password.' : err);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 flex">
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-stone-900"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/8311880/pexels-photo-8311880.jpeg?auto=compress&cs=tinysrgb&w=900')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-stone-900/70" />
        <div className="relative z-10 text-center px-12">
          <h1 className="font-display text-5xl font-bold text-white mb-4">Nogori</h1>
          <p className="text-gold-300 text-sm uppercase tracking-[0.3em] mb-6">Urban Fashion</p>
          <p className="text-stone-300 leading-relaxed max-w-sm">
            Join thousands of fashion-forward people who trust Nogori for premium clothing curated for the modern lifestyle.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-semibold text-stone-900 mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-stone-500 text-sm">
              {mode === 'signin' ? 'Sign in to access your account' : 'Join Nogori and discover premium fashion'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-cream-200 p-1 mb-8">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all ${
                  mode === m ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-4 mt-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
              className="text-stone-900 font-semibold hover:text-gold-600 transition-colors"
            >
              {mode === 'signin' ? 'Register now' : 'Sign in'}
            </button>
          </p>

          <p className="text-center text-stone-400 text-xs mt-8">
            By continuing, you agree to Nogori's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
