import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeatureBlock = ({ title, description, icon, details }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-blue-500/30 transition-all group"
  >
    <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
    <p className="text-gray-400 mb-6 leading-relaxed">{description}</p>
    <ul className="space-y-2">
      {details.map((item, index) => (
        <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          {item}
        </li>
      ))}
    </ul>
  </motion.div>
);

export default function Features() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden p-8">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto pt-12 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-20">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="text-xl font-black tracking-tighter bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            GESTURE.AI / FEATURES
          </div>
        </div>

        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Next-Gen <span className="text-blue-500">Capabilities.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience a seamless workflow where your hands become the primary peripheral for your desktop environment.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <FeatureBlock 
            icon="🎯"
            title="Real-time Landmark Tracking"
            description="Utilizes MediaPipe Hands to capture 21 3D landmarks at high frame rates for near-zero latency."
            details={["Sub-millimeter precision", "Works in low-light conditions", "Multiple hand support"]}
          />
          

          <FeatureBlock 
            icon="🔄"
            title="One-Click Retraining"
            description="The only system that allows you to update your AI model on-the-fly without touching a line of code."
            details={["Automated data collection", "TensorFlow Keras integration", "Weights optimization"]}
          />

          <FeatureBlock 
            icon="⌨️"
            title="OS-Level Automation"
            description="Map gestures to complex keyboard shortcuts, media controls, or system navigation."
            details={["Window switching (Alt+Tab)", "Volume & Brightness", "Custom Script execution"]}
          />

          <FeatureBlock 
            icon="🛡️"
            title="Secure Cloud Profiles"
            description="Your gesture configurations are synced via Firebase, ensuring your setup works everywhere."
            details={["Google Authentication", "Real-time DB syncing", "Encrypted user data"]}
          />
        </div>

        {/* Technical Specification Footer */}
        <div className="mt-20 p-8 border border-white/5 rounded-3xl bg-white/2 text-center">
          <h4 className="text-sm font-mono text-blue-500 mb-4 uppercase tracking-[0.2em]">Technical Stack</h4>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span>React 18</span>
            <span>Tailwind CSS</span>
            <span>TensorFlow.js</span>
            <span>Firebase 10</span>
            <span>MediaPipe</span>
            <span>OpenCV</span>
          </div>
        </div>
      </div>
    </div>
  );
}
