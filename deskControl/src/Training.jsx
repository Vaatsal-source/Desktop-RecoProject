import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const InfoCard = ({ title, children }) => (
  <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl mb-8">
    <h3 className="text-xl font-bold mb-4 text-blue-400">{title}</h3>
    <div className="text-gray-300 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

export default function TrainingInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden p-8">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto pt-12 pb-20">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-16">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <div className="text-xl font-black tracking-tighter bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            GESTURE.AI / TRAINING_DOCS
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            How the <span className="text-blue-500">Model</span> is Trained
          </h1>
          <p className="text-lg text-gray-400 mb-12">
            The <code className="bg-white/10 px-2 py-1 rounded text-blue-300">Model</code> uses the 
            <strong> Keras Sequential API</strong> within TensorFlow to build and train a feedforward neural network 
            for gesture recognition.
          </p>

          <h2 className="text-2xl font-bold mb-8">Training Method Summary</h2>

          <InfoCard title="Model Architecture">
            <p>
              The model consists of a linear stack of layers starting with an <strong>Input layer</strong> 
              (shape of 63 features), followed by two <strong>Dense (fully connected) layers</strong> 
              utilizing ReLU activation.
            </p>
          </InfoCard>

          <InfoCard title="Regularization & Safety">
            <p>
              To prevent overfitting, a <strong>Dropout layer</strong> (rate of 0.2) is strategically placed after the 
              first hidden layer. This randomly sets 20% of input units to zero during training, ensuring the model 
              doesn't simply memorize the dataset.
            </p>
          </InfoCard>

          <InfoCard title="Compilation Strategy">
            <p>
              We utilize the <strong>Adam optimizer</strong> and the <strong>Sparse Categorical Crossentropy</strong> 
              loss function. This specific loss function is ideal as gesture labels are processed as integers rather 
              than one-hot encoded vectors.
            </p>
          </InfoCard>

          <InfoCard title="Training Loop & Callbacks">
            <p>
              The model fits to the data over 100 epochs with a batch size of 32. We implement 
              <strong> EarlyStopping</strong>, which monitors validation loss and halts training if no improvement 
              is seen for 5 consecutive epochs, automatically restoring the best recorded weights.
            </p>
          </InfoCard>
        </motion.div>
      </div>
    </div>
  );
}