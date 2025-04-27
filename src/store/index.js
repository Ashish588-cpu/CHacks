import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import recordingReducer from './slices/recordingSlice';
import notesReducer from './slices/notesSlice';
import quizReducer from './slices/quizSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recording: recordingReducer,
    notes: notesReducer,
    quiz: quizReducer,
  },
});