import React, { useState, useRef, useEffect } from 'react';
import './styles.css';

// Define SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function Notes() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        setError('Speech recognition error: ' + event.error);
        stopRecording();
      };
    } else {
      setError('Speech recognition is not supported in this browser');
    }

    return () => {
      stopRecording();
    };
  }, []);

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const updateAudioLevel = () => {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
      return stream;
    } catch (err) {
      setError('Microphone access error: ' + err.message);
      return null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await startAudioVisualization();
      if (!stream) return;

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Recording error: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      setIsRecording(false);
    }
  };

  return (
    <div className="notes-container">
      <div className="recording-section">
        <h2>Voice Notes</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="recording-visualizer">
          <div className="audio-bars">
            {[...Array(20)].map((_, index) => (
              <div
                key={index}
                className="audio-bar"
                style={{
                  height: `${(audioLevel / 255) * 100 * (Math.random() * 0.5 + 0.5)}%`,
                  backgroundColor: isRecording ? '#4CAF50' : '#ccc'
                }}
              />
            ))}
          </div>
          
          <button
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        <div className="transcript-container">
          <h3>Real-time Transcript</h3>
          <div className="transcript-box">
            {transcript || 'Start speaking to see the transcript...'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notes;

