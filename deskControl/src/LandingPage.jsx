import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeatureCard = ({ title, description, icon }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl"
  >
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function LandingPage({ user }) {
  const navigate = useNavigate();

  // Logic to handle "Launch Control Systems" based on Auth State
  const handleLaunchClick = () => {
    if (user) {
      navigate('/Dashboard');
    } else {
      navigate('/Login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-tighter bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          GESTURE.AI
        </div>
        <div className="flex items-center space-x-8 text-sm font-medium text-gray-400">
          <button 
            onClick={() => navigate('/Features')}
            className="hover:text-white transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => navigate('/Training')}
            className="hover:text-white transition-colors"
          >
            Training
          </button>
          
          {/* Conditional Button: Shows 'Dashboard' if logged in, otherwise 'Get Started' */}
          <button 
            onClick={() => user ? navigate('/Dashboard') : navigate('/Login')}
            className="px-5 py-2 bg-white text-black rounded-full hover:bg-blue-500 hover:text-white transition-all font-bold"
          >
            {user ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight"
        >
          Control with a <br />
          <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Single Wave.
          </span>
        </motion.h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The ultimate gesture-based desktop control system. 
          Customizable AI hand tracking with real-time feedback and seamless UX.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={handleLaunchClick}
            className="px-8 py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
          >
            Launch Control Systems
          </button>
          <button 
          onClick={() => navigate('/Documentation')}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold backdrop-blur-sm hover:bg-white/10 transition-all">
            View Documentation
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="🖐️"
            title="Custom Gestures"
            description="Add or remove hand gestures easily through the intuitive web-based control panel."
          />
          <FeatureCard 
            icon="⚡"
            title="One-Click Retraining"
            description="Modify your gestures and trigger model retraining instantly with a single interaction."
          />
          <FeatureCard 
            icon="🖥️"
            title="Desktop Automation"
            description="Switch tabs, play media, and navigate windows with fluid, real-time hand movements."
          />
        </div>
      </section>

      {/* Footer Status */}
      <footer className="border-t border-white/10 py-10 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          SYSTEM STATUS: {user ? `AUTHENTICATED AS ${user.displayName?.toUpperCase()}` : 'READY FOR INPUT'}
        </div>
      </footer>
    </div>
  );
}