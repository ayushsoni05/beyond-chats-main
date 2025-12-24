import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articlesApi, pipelineApi } from '../services/api';
import './ArticleComparison.css';

function ArticleComparison() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await articlesApi.getById(id);
      setArticle(data);
    } catch (err) {
      setError('Failed to fetch article details.');
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      await pipelineApi.refreshArticle(id);
      alert('Article refresh started! Please wait a moment...');
      
      // Poll for updates
      setTimeout(() => {
        fetchArticle();
        setRefreshing(false);
      }, 5000);
    } catch (err) {
      alert('Refresh failed: ' + err.message);
      setRefreshing(false);
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
        <p>Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Article not found'}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="article-comparison-container">
      <div className="comparison-header">
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          ← Back to Articles
        </button>
        <div className="header-info">
          <h1>{article.title}</h1>
          <div className="header-meta">
            <span className={getStatusBadge(article.status)}>
              {article.status}
            </span>
            <span className="article-date">
              Last updated: {new Date(article.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || article.status === 'processing'}
          className="btn btn-primary"
        >
          {refreshing || article.status === 'processing'
            ? 'Processing...'
            : '🔄 Refresh Content'}
        </button>
      </div>

      {article.url && (
        <div className="article-url-section">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="article-link"
          >
            View Original Article →
          </a>
        </div>
      )}

      <div className="comparison-content">
        <div className="content-panel">
          <div className="panel-header">
            <h2>Original Content</h2>
            <span className="content-label">Scraped from source</span>
          </div>
          <div className="panel-body">
            {article.original_content ? (
              <div className="content-text">
                {article.original_content.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            ) : (
              <div className="empty-content">
                <p>No original content available.</p>
              </div>
            )}
          </div>
        </div>

        <div className="content-divider"></div>

        <div className="content-panel">
          <div className="panel-header">
            <h2>Updated Content</h2>
            <span className="content-label">AI-enhanced version</span>
          </div>
          <div className="panel-body">
            {article.updated_content ? (
              <div className="content-text">
                {article.updated_content.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            ) : (
              <div className="empty-content">
                <p>No updated content yet.</p>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="btn btn-primary"
                >
                  Refresh to Generate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {article.meta_description && (
        <div className="meta-section">
          <h3>Meta Description</h3>
          <p>{article.meta_description}</p>
        </div>
      )}
    </div>
  );
}

export default ArticleComparison;
