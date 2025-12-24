import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { articlesApi, pipelineApi } from '../services/api';
import './ArticleList.css';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [statusFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const data = await articlesApi.getAll(params);
      setArticles(data.data || data);
    } catch (err) {
      setError('Failed to fetch articles. Make sure the backend is running.');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleScrape = async () => {
    if (scraping) return;
    
    try {
      setScraping(true);
      await articlesApi.scrape(10);
      alert('Scraping completed successfully!');
      fetchArticles();
    } catch (err) {
      alert('Scraping failed: ' + err.message);
    } finally {
      setScraping(false);
    }
  };

  const handleRefreshAll = async () => {
    if (refreshing) return;
    
    try {
      setRefreshing(true);
      await pipelineApi.refreshAll();
      alert('Refresh process started. This may take some time.');
    } catch (err) {
      alert('Refresh failed: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshArticle = async (articleId) => {
    try {
      await pipelineApi.refreshArticle(articleId);
      alert('Article refresh started!');
      setTimeout(() => fetchArticles(), 2000);
    } catch (err) {
      alert('Refresh failed: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }
    
    try {
      await articlesApi.delete(id);
      fetchArticles();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      scraped: 'badge-gray',
      processing: 'badge-blue',
      updated: 'badge-green',
      error: 'badge-red',
    };
    return `badge ${statusColors[status] || 'badge-gray'}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchArticles} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="article-list-container">
      <div className="header-section">
        <h1>Articles</h1>
        <div className="action-buttons">
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="btn btn-primary"
          >
            {scraping ? 'Scraping...' : '📥 Scrape Articles'}
          </button>
          <button
            onClick={handleRefreshAll}
            disabled={refreshing}
            className="btn btn-secondary"
          >
            {refreshing ? 'Refreshing...' : '🔄 Refresh All'}
          </button>
        </div>
      </div>

      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="status-filter">
          <label>Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="scraped">Scraped</option>
            <option value="processing">Processing</option>
            <option value="updated">Updated</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <p>No articles found.</p>
          <button onClick={handleScrape} className="btn btn-primary">
            Scrape Some Articles
          </button>
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <div key={article.id} className="article-card">
              <div className="article-header">
                <h3 className="article-title">{article.title}</h3>
                <span className={getStatusBadge(article.status)}>
                  {article.status}
                </span>
              </div>

              <div className="article-meta">
                <span className="article-date">
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>

              {article.meta_description && (
                <p className="article-description">
                  {article.meta_description.substring(0, 150)}...
                </p>
              )}

              <div className="article-actions">
                <button
                  onClick={() => navigate(`/article/${article.id}`)}
                  className="btn btn-primary btn-sm"
                >
                  View Comparison
                </button>
                <button
                  onClick={() => handleRefreshArticle(article.id)}
                  className="btn btn-secondary btn-sm"
                  disabled={article.status === 'processing'}
                >
                  {article.status === 'processing' ? 'Processing...' : 'Refresh'}
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>

              <div className="article-url">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-link"
                >
                  View Original →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticleList;
