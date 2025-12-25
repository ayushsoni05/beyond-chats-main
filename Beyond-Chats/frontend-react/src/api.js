import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000/api',
});

export async function fetchArticles() {
  try {
    const { data: response } = await api.get('/articles', { params: { per_page: 50 } });
    return response.data || response; // extract articles array from paginated response
  } catch (error) {
    console.error('API not available, using mock data:', error.message);
    // Mock data for demo when backend is not deployed
    return [
      {
        id: 1,
        title: 'How to Use BeyondChats for Customer Support',
        original_content: 'BeyondChats is a powerful tool for managing customer conversations. It helps businesses streamline their support process and improve customer satisfaction.',
        updated_content: 'BeyondChats revolutionizes customer support by providing AI-powered conversation management. This comprehensive platform enables businesses to automate responses, track customer interactions, and deliver exceptional service at scale.',
        summary: 'Learn how to effectively use BeyondChats for your customer support needs',
        citations: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z'
      },
      {
        id: 2,
        title: 'Best Practices for AI Chat Integration',
        original_content: 'Integrating AI chat into your website can improve user engagement. Here are some tips to get started.',
        updated_content: 'Successful AI chat integration requires strategic planning and implementation. Key best practices include: defining clear conversation flows, training AI on your specific use cases, maintaining human oversight, and continuously optimizing based on user feedback. Modern chatbots can handle 80% of routine inquiries, freeing your team for complex issues.',
        summary: 'Essential guidelines for implementing AI chatbots successfully',
        citations: [],
        created_at: '2025-01-03T00:00:00Z',
        updated_at: '2025-01-04T00:00:00Z'
      },
      {
        id: 3,
        title: 'Automating Customer Service with AI',
        original_content: 'Customer service automation can save time and reduce costs for businesses of all sizes.',
        updated_content: 'AI-powered customer service automation transforms how businesses handle support requests. By implementing intelligent chatbots and automated workflows, companies can provide 24/7 support, reduce response times from hours to seconds, and scale operations without proportionally increasing staff. Studies show that automated systems can resolve up to 70% of common customer inquiries.',
        summary: 'Discover how AI automation can transform your customer service',
        citations: [],
        created_at: '2025-01-05T00:00:00Z',
        updated_at: '2025-01-06T00:00:00Z'
      }
    ];
  }
}

export default api;
