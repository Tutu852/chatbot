import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import VoiceAssistant from './components/voice_assistant/VoiceAssistant';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chatbot />} />
        <Route path="/voice" element={<VoiceAssistant />} />
      </Routes>
    </Router>
  );
}

export default App;
