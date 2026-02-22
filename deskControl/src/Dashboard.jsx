import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { auth } from './firebase'; 
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Webcam from 'react-webcam';


const socket = io('http://localhost:5000');

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  
 
  const [gestures, setGestures] = useState([]); 
  const [isHydrated, setIsHydrated] = useState(false); 


  const [customName, setCustomName] = useState("");
  const [selectedAction, setSelectedAction] = useState("volumeup");
  const [isRecording, setIsRecording] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [isRetraining, setIsRetraining] = useState(false);
  const [prediction, setPrediction] = useState({ gesture: '---', confidence: 0 });
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  const actionOptions = [
    { label: "Volume Up", value: "volumeup" },
    { label: "Volume Down", value: "volumedown" },
    { label: "Mute System", value: "volumemute" },
    { label: "Next Track", value: "nexttrack" },
    { label: "Previous Track", value: "prevtrack" },
    { label: "Play/Pause", value: "playpause" },
    { label: "Press Enter", value: "enter" },
    { label: "Launch Chrome", value: "chrome" },
    { label: "Neutral", value: "none"},
  ];

 
  useEffect(() => {
    const saved = localStorage.getItem("gesture_mappings");
    if (saved) {
      try {
        setGestures(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved gestures", e);
      }
    }
    setIsHydrated(true); 
  }, []);

  
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("gesture_mappings", JSON.stringify(gestures));
    }
  }, [gestures, isHydrated]);

  useEffect(() => {
   
    socket.on('system_info', (data) => {
      console.log("Backend sync received. Existing files:", data.gestures);
      setBackendStatus(data.model_ready ? "Model Live" : "Need Training");

      
      if (isHydrated) {
        setGestures(prev => {
          
          return prev.filter(g => data.gestures.includes(g.trigger));
        });
      }
    });

    if (!window.Hands || !window.Camera) {
      setBackendStatus("Loading MediaPipe...");
      return;
    }

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const hand = results.multiHandLandmarks[0];
        const wrist = hand[0];
        const landmarks = hand.flatMap(lm => [lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z]);

        if (isRecording && customName.trim() !== "") {
          socket.emit('collect_data', { gesture: customName.toLowerCase(), landmarks });
        } else if (!isRecording && !isRetraining) {
          
          const mappingPayload = {};
          gestures.forEach(g => { mappingPayload[g.trigger] = g.action; });
          socket.emit('predict', { landmarks, mappings: mappingPayload });
        }
      }
    });

    if (webcamRef.current) {
      const camera = new window.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video) await hands.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    socket.on('collection_success', (data) => {
      setSampleCount(data.count);
      if (data.done) {
        setIsRecording(false);
        setBackendStatus("Collection Complete");
        const triggerName = customName.toUpperCase();
        setGestures(prev => {
          if (prev.find(g => g.trigger === triggerName)) return prev;
          return [...prev, { 
            id: Date.now(), 
            name: customName, 
            trigger: triggerName, 
            action: selectedAction 
          }];
        });
      }
    });

    socket.on('prediction_result', (data) => setPrediction(data));
    socket.on('training_status', (data) => setBackendStatus(data.message));
    socket.on('training_complete', (data) => {
      setIsRetraining(false);
      setBackendStatus("Model Live");
      alert("Model retrained successfully!");
    });

    return () => {
      socket.off('system_info');
      socket.off('collection_success');
      socket.off('prediction_result');
      socket.off('training_status');
      socket.off('training_complete');
    };
  }, [isRecording, customName, selectedAction, isRetraining, gestures, isHydrated]);

  const handleLogout = async () => {
    try { await signOut(auth); navigate('/'); } catch (e) { console.error(e); }
  };

  const handleRetrain = () => {
    setIsRetraining(true);
    setBackendStatus("Training...");
    socket.emit('train_model'); 
  };

  const deleteGesture = (gestureObject) => {
    setGestures(prev => prev.filter(g => g.id !== gestureObject.id));
    socket.emit('delete_gesture_data', { gesture: gestureObject.name });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
        <div>
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white mb-2 block">← Home</button>
          <h1 className="text-3xl font-bold">Gesture Orchestrator</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-red-500/20">Logout</button>
          <button onClick={handleRetrain} disabled={isRetraining || gestures.length === 0}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${isRetraining ? 'bg-yellow-500 text-black animate-pulse' : 'bg-blue-600'}`}>
            {isRetraining ? 'Training...' : 'Retrain'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 aspect-video bg-zinc-900 rounded-3xl border border-white/10 relative overflow-hidden">
          <Webcam ref={webcamRef} className="w-full h-full object-cover" mirrored />
          <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full border border-blue-500/50">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-xs font-mono">
              {isRecording ? `COLLECTING: ${sampleCount}/500` : `LIVE: ${prediction.gesture} (${(prediction.confidence * 100).toFixed(0)}%)`}
            </span>
          </div>
          <div className="absolute bottom-6 left-6 bg-black/60 px-4 py-2 rounded-lg border border-white/10">
            <p className="text-xs font-bold text-blue-400">{backendStatus}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/80 p-6 rounded-3xl border border-blue-500/20 backdrop-blur-md">
            <h3 className="text-xs font-bold mb-4 text-blue-400 uppercase">Add New Gesture</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Name..." className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500 transition-colors"
                value={customName} onChange={(e) => setCustomName(e.target.value)} />
              <select className="w-full bg-black/50 border border-white/10 rounded-xl p-3 outline-none cursor-pointer"
                value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                {actionOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>)}
              </select>
              <button onClick={() => { setIsRecording(!isRecording); setSampleCount(0); }} disabled={!customName || isRetraining}
                className={`w-full py-4 rounded-xl font-bold transition-all ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/80 p-6 rounded-3xl border border-white/10 max-h-100 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold mb-4 text-gray-400 uppercase">Active Mappings</h3>
            <div className="space-y-3">
              <AnimatePresence>
                {gestures.map((g) => (
                  <motion.div key={g.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex justify-between items-center p-4 rounded-2xl border transition-colors ${prediction.gesture === g.trigger ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/5'}`}>
                    <div>
                      <p className="text-sm font-bold">{g.name}</p>
                      <p className="text-[10px] text-blue-400 uppercase font-mono tracking-tighter">Action: {g.action}</p>
                    </div>
                    <button onClick={() => deleteGesture(g)} className="text-gray-500 hover:text-red-500 p-2 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {gestures.length === 0 && isHydrated && (
                <p className="text-center text-gray-600 text-xs py-4 italic">No gestures mapped yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
