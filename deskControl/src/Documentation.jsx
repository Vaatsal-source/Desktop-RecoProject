import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DocSection = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-2xl font-bold mb-6 text-blue-400 border-b border-white/10 pb-2">{title}</h2>
    <div className="text-gray-300 space-y-4 leading-relaxed">
      {children}
    </div>
  </section>
);

export default function Documentation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-8 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-4xl mx-auto pt-12 pb-20">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-16">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <div className="text-xl font-black tracking-tighter bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            GESTURE.AI / DOCS
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Documentation</h1>
          <p className="text-gray-400 text-lg mb-12 font-mono">v1.0.0-stable // Technical Overview</p>

          <DocSection title="1. System Architecture">
            <p>
              GESTURE.AI operates as a bridge between computer vision and OS-level automation. 
              The system utilizes a <strong>React frontend</strong> for the control interface and a 
              <strong> Python/TensorFlow backend</strong> for real-time gesture processing.
            </p>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 font-mono text-sm">
              <p className="text-blue-400 mb-2"> Data Flow</p>
              <p>Camera → MediaPipe  → Keras Model  → PyAutoGUI → OS Action</p>
            </div>
          </DocSection>

          

          <DocSection title="2. Hand Landmark Mapping">
            <p>
              The system captures 21 distinct 3D landmarks from the hand. These landmarks are normalized 
              and fed into the neural network as a flattened array of 63 coordinates.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400">
              <li><strong>Landmarks 0-4:</strong> Thumb positions</li>
              <li><strong>Landmarks 5-20:</strong> Index, Middle, Ring, and Pinky joints</li>
              <li><strong>Coordinate Space:</strong> Normalized [0.0, 1.0] relative to image width/height</li>
            </ul>
          </DocSection>

          <DocSection title="3. Default Gesture Set">
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-blue-400">
                  <tr>
                    <th className="p-4">Gesture</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-4 font-bold">Five Fingers</td>
                    <td className="p-4">Open Chrome</td>
                    <td className="p-4 text-gray-500 font-mono">all_fingers_up == True</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Thumb Up</td>
                    <td className="p-4">Volume Up</td>
                    <td className="p-4 text-gray-500 font-mono">thumb_y &lt; index_mcp_y</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Closed Fist</td>
                    <td className="p-4">Mute System</td>
                    <td className="p-4 text-gray-500 font-mono">all_fingers_down == True</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DocSection>

          <DocSection title="4. One-Click Retraining">
            <p>
              The "One-Click Retrain" feature on the dashboard triggers an automated pipeline that 
              appends new landmark data to the existing dataset and re-executes the training script 
              with <strong>EarlyStopping</strong> to ensure model weights are optimized without 
              overfitting.
            </p>
          </DocSection>

          <DocSection title="5. Security & Auth">
            <p>
              User sessions and custom gesture configurations are secured via <strong>Firebase 
              Authentication</strong>. Custom gesture mappings are stored per UID, ensuring your 
              control profile follows you across devices.
            </p>
          </DocSection>
        </motion.div>
      </div>
    </div>
  );
}