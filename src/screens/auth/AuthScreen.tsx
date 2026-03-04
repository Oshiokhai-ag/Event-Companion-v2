// src/screens/auth/AuthScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export const AuthScreen = ({ navigation }: any) => {
  console.log("AuthScreen rendering...");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const { login } = useAuthStore();

  useEffect(() => {
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: (import.meta as any).env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        shape: 'pill'
      });
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        localStorage.setItem('companion_token', data.token);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Google Sign-In failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        localStorage.setItem('companion_token', data.token);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="p-8 h-full flex flex-col justify-center bg-obsidian">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-sunstone rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-sunstone/20 rotate-3">
          <Heart className="text-white -rotate-3" size={40} fill="currentColor" />
        </div>
        <h1 className="text-4xl font-bold text-alabaster tracking-tight">Companion</h1>
        <p className="text-grey-mist mt-3 font-medium">Find your next adventure partner</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && <Input label="Full Name" value={name} onChange={(e: any) => setName(e.target.value)} required />}
        <Input label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-ember font-medium">{error}</p>}
        <Button type="submit" className="w-full py-4 mt-6 text-lg">
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[10px] font-bold text-grey-mist uppercase tracking-widest">or continue with</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <div className="mt-6 flex justify-center">
        <div ref={googleBtnRef} />
      </div>

      <div className="mt-10 text-center">
        <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-bold text-grey-mist hover:text-sunstone transition-colors">
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};
