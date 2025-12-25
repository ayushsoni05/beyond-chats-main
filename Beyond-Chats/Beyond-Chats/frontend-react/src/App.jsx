import React, { useEffect, useState } from 'react';
import { fetchArticles } from './api';

function ArticleCard({ article }) {
  const citations = Array.isArray(article.citations) ? article.citations : [];
  return (
    <article className="card">
      <header>
        <p className="pill">{article.is_original ? 'Original' : 'Updated'}</p>
        <h3>{article.title}</h3>
        {article.summary && <p className="summary">{article.summary}</p>}
      </header>
      <div className="body" dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, '<br/>') }} />
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
          <ArticleCard key={article.id} article={article} />
        ))}
      </section>
    </div>
  );
}
