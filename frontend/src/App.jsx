import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthCtx } from './auth.js';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Auth from './pages/Auth.jsx';

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const navigate = useNavigate();

  const login = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  return (
    <AuthCtx.Provider value={{ user, login }}>
      <header className="nav">
        <Link to="/" className="brand">BookHub</Link>
        <nav>
          {user ? (
            <>
              <span className="who">Hi, {user.name}</span>
              <button className="link" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn small">Create account</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books/:id" element={<Book />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
        </Routes>
      </main>
    </AuthCtx.Provider>
  );
}
