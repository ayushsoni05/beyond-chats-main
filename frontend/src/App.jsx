import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import ArticleList from './pages/ArticleList';
import ArticleComparison from './pages/ArticleComparison';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              BeyondChats
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Articles
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ArticleList />} />
            <Route path="/article/:id" element={<ArticleComparison />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2025 BeyondChats. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
