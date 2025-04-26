import { Link } from 'react-router-dom';
import './styles.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">EduScrib</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/notes">Notes</Link>
        <Link to="/quizzes">Quizzes</Link>
        <Link to="/settings">Settings</Link>
      </div>
    </nav>
  );
}

export default Navbar;


