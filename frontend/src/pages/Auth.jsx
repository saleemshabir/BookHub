import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.js';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try { login(await api(`/auth/${mode}`, { method: 'POST', body: f })); navigate('/'); }
    catch (e) { setErr(e.message); }
  };

  return (
    <form className="auth" onSubmit={submit}>
      <h1>{isLogin ? 'Log in' : 'Create account'}</h1>
      {!isLogin && <input placeholder="Name" value={f.name} onChange={set('name')} required />}
      <input type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
      <input type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set('password')} required />
      {err && <p className="error">{err}</p>}
      <button className="btn">{isLogin ? 'Log in' : 'Create account'}</button>
      <p className="muted">
        {isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Already registered? <Link to="/login">Log in</Link></>}
      </p>
    </form>
  );
}
