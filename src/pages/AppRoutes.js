import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Notes from './Notes';
import Quizzes from './Quizzes';
import Settings from './Settings';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/quizzes" element={<Quizzes />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default AppRoutes;
