import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; 
import LandingPage from './LandingPage';
import Dashboard from './dashBoard';
import Features from './Features';
import Training from './Training';
import Documentation from './Documentation';
import Login from './Login';
import './style.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="bg-[#0a0a0a] min-h-screen" />; 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/Dashboard" />} />
        
        {/* Protected Dashboard Route */}
        <Route 
          path="/Dashboard" 
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
        />
        
        <Route path="/Features" element={<Features/>}/>
        <Route path="/Training" element={<Training/>}/>
        <Route path="/Documentation" element={<Documentation/>}/>
      </Routes>
    </Router>
  );
}