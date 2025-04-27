import './styles.css';

function Home() {
  return (
    <div className="home">
      <h1>Welcome to EduScrib</h1>
      <div className="features">
        <div className="feature-card">
          <h2>Record Lectures</h2>
          <p>Capture your lectures with our advanced audio recording system</p>
        </div>
        <div className="feature-card">
          <h2>Create Notes</h2>
          <p>Transform your recordings into organized notes</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
