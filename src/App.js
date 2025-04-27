import { BrowserRouter as Router } from 'react-router-dom';
import './styles/global.css';
import Navbar from './components/Navbar';
import AppRoutes from './pages/AppRoutes';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;


