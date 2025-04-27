import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { useDispatch } from 'react-redux';
import './styles.css';

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [duration, setDuration] = useState(0);
  const [timestamps, setTimestamps] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const microphone = useRef(null);
  const animationFrame = useRef(null);
  const timerInterval = useRef(null);

  const {
    status,
    startRecording: startMediaRecording,
    stopRecording: stopMediaRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl) => {
      stopAudioAnalysis();
    },
    onError: (error) => {
      setError(`Recording error: ${error}`);
    }
  });

  useEffect(() => {
    return () => {
      stopAudioAnalysis();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      microphone.current = audioContext.current.createMediaStreamSource(stream);
      
      microphone.current.connect(analyser.current);
      analyser.current.fftSize = 256;
      
      const updateAudioLevel = () => {
        const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
        analyser.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        animationFrame.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (err) {
      setError(`Microphone access error: ${err.message}`);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    if (microphone.current) {
      microphone.current.disconnect();
    }
    if (audioContext.current) {
      audioContext.current.close();
    }
  };

  const handleStartRecording = useCallback(async () => {
    setIsRecording(true);
    setDuration(0);
    setTimestamps([]);
    setError(null);
    
    await startAudioAnalysis();
    startMediaRecording();

    timerInterval.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  }, [startMediaRecording]);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    stopMediaRecording();
    stopAudioAnalysis();
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
  }, [stopMediaRecording]);

  const handleAddTimestamp = useCallback(() => {
    setTimestamps(prev => [...prev, {
      time: duration,
      label: `Timestamp ${prev.length + 1}`
    }]);
  }, [duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveRecording = async () => {
    if (!mediaBlobUrl || !recordingName) {
      setError('Please provide a recording name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('audio', blob, `${recordingName}.wav`);
      formData.append('timestamps', JSON.stringify(timestamps));
      
      const result = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) {
        throw new Error('Failed to save recording');
      }

      clearBlobUrl();
      setRecordingName('');
      setTimestamps([]);
    } catch (error) {
      setError(`Failed to save recording: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="audio-recorder">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="recording-status">
        <div className="status-indicator">
          Status: {status}
        </div>
        <div className="duration">
          {formatTime(duration)}
        </div>
      </div>

      {isRecording && (
        <div className="audio-visualizer">
          <div 
            className="audio-level" 
            style={{ transform: `scaleY(${audioLevel / 255})` }}
          />
        </div>
      )}
      
      <div className="recording-controls">
        {!isRecording ? (
          <button 
            className="record-button"
            onClick={handleStartRecording}
          >
            Start Recording
          </button>
        ) : (
          <>
            <button 
              className="stop-button"
              onClick={handleStopRecording}
            >
              Stop Recording
            </button>
            <button
              className="timestamp-button"
              onClick={handleAddTimestamp}
            >
              Add Timestamp
            </button>
          </>
        )}
      </div>

      {mediaBlobUrl && (
        <div className="recording-preview">
          <audio src={mediaBlobUrl} controls />
          
          <div className="timestamps-list">
            {timestamps.map((timestamp, index) => (
              <div key={index} className="timestamp-item">
                {formatTime(timestamp.time)} - {timestamp.label}
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Enter recording name"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
          />
          <button 
            className="save-button"
            onClick={handleSaveRecording}
            disabled={isLoading || !recordingName}
          >
            {isLoading ? 'Saving...' : 'Save Recording'}
          </button>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;


