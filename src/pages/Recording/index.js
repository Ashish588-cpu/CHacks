import React, { useState, useCallback } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import './styles.css';

function Recording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [recordings, setRecordings] = useState([]);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl
  } = useReactMediaRecorder({ audio: true });

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    startRecording();
  }, [startRecording]);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    stopRecording();
  }, [stopRecording]);

  const handleSaveRecording = () => {
    if (mediaBlobUrl && recordingName) {
      setRecordings(prev => [...prev, {
        name: recordingName,
        url: mediaBlobUrl,
        date: new Date().toLocaleString()
      }]);
      setRecordingName('');
    }
  };

  return (
    <div className="recording-page">
      <h1>Record Lecture</h1>
      
      <div className="recording-controls">
        <div className="status-indicator">
          Status: {status}
        </div>
        
        {!isRecording ? (
          <button 
            className="record-button"
            onClick={handleStartRecording}
          >
            Start Recording
          </button>
        ) : (
          <button 
            className="stop-button"
            onClick={handleStopRecording}
          >
            Stop Recording
          </button>
        )}
      </div>

      {mediaBlobUrl && !isRecording && (
        <div className="save-recording">
          <input
            type="text"
            placeholder="Enter recording name"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
          />
          <button 
            className="save-button"
            onClick={handleSaveRecording}
          >
            Save Recording
          </button>
          <audio src={mediaBlobUrl} controls />
        </div>
      )}

      <div className="recordings-list">
        <h2>Saved Recordings</h2>
        {recordings.length === 0 ? (
          <p>No recordings yet</p>
        ) : (
          <ul>
            {recordings.map((recording, index) => (
              <li key={index}>
                <div className="recording-info">
                  <span>{recording.name}</span>
                  <span>{recording.date}</span>
                </div>
                <audio src={recording.url} controls />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Recording;

