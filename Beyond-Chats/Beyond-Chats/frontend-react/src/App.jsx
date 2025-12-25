import React, { useEffect, useState } from 'react';
import { fetchArticles } from './api';

function ArticleCard({ article, version }) {
  const content = version === 'original' 
    ? (article.original_content || article.body || '') 
    : (article.updated_content || article.body || '');
  const safeContent = content ? content.replace(/\n/g, '<br/>') : '';
  const citations = Array.isArray(article.citations) ? article.citations : [];
  
  return (
    <article className="card">
      <header>
        <p className="pill">{version === 'original' ? 'Original' : 'Updated'}</p>
        <h3>{article.title || 'Untitled'}</h3>
        {article.summary && <p className="summary">{article.summary}</p>}
      </header>
      <div className="body" dangerouslySetInnerHTML={{ __html: safeContent }} />
      {citations.length > 0 && (
        <footer>
          <p className="pill ghost">References</p>
          <ul>
            {citations.map((link, idx) => (
              <li key={idx}><a href={link} target="_blank" rel="noreferrer">{link}</a></li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}

export default function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(false);

  const loadArticles = () => {
    setFetching(true);
    setError('');
    fetchArticles()
      .then((articles) => {
        console.log('Fetched articles:', articles);
        setArticles(articles || []);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load');
      })
      .finally(() => {
        setLoading(false);
        setFetching(false);
      });
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">BeyondChats Blog Monitor</p>
          <h1>Originals & Updated Articles</h1>
          <p className="lede">Fetching content from the API and displaying refreshed versions powered by the Node pipeline.</p>
        </div>
        <button 
          className={`badge ${fetching ? 'fetching' : ''}`}
          onClick={loadArticles}
          disabled={fetching}
        >
          {fetching ? '⟳ Fetching...' : '↻ Live fetch'}
        </button>
      </header>

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}

      <section className="grid">
        {articles.map((article) => (
          <React.Fragment key={article.id}>
            <ArticleCard article={article} version="original" />
            <ArticleCard article={article} version="updated" />
          </React.Fragment>
        ))}
      </section>
    </div>
  );
}
