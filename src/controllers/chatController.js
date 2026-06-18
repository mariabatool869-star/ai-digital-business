const Product = require('../models/Product');

const FAQ = {
  domain: 'We offer .com, .net, .org and more domain registrations starting at $12.99/year.',
  hosting: 'Our hosting plans include free SSL, 24/7 support, and 1-click deployment.',
  ai_agent: 'Our AI agents handle sales, support, marketing, analytics, and development tasks 24/7.',
  payment: 'We accept all major credit cards via Stripe. Checkout is secure and instant.',
  support: 'Contact us anytime — our AI Support Agent is available 24/7 on this website.'
};

async function buildProductContext() {
  const products = await Product.find({ isActive: true });
  return products.map(p => `${p.name} ($${p.price}/mo) — ${p.description}`).join('\n');
}

function ruleBasedReply(message, products) {
  const msg = message.toLowerCase();

  if (/hello|hi|hey|greetings/.test(msg)) {
    return "Hello! I'm the AzlanAI assistant. I can help you find domains, hosting, AI agents, and more. What are you looking for?";
  }
  if (/domain/.test(msg)) return FAQ.domain + ' Try our Domain Search page!';
  if (/hosting|server/.test(msg)) return FAQ.hosting;
  if (/ai|agent|bot|chat/.test(msg)) return FAQ.ai_agent;
  if (/price|cost|how much|pricing/.test(msg)) {
    const list = products.slice(0, 5).map(p => `• ${p.name}: $${p.price}/mo`).join('\n');
    return `Here are some of our products:\n${list}\n\nBrowse all at /products.html`;
  }
  if (/payment|pay|stripe|card/.test(msg)) return FAQ.payment;
  if (/support|help|contact/.test(msg)) return FAQ.support;

  const match = products.find(p =>
    msg.includes(p.name.toLowerCase()) ||
    msg.includes(p.type.replace('_', ' ')) ||
    p.features.some(f => msg.includes(f.toLowerCase()))
  );
  if (match) {
    return `${match.name} — $${match.price}/mo\n${match.description}\nFeatures: ${match.features.join(', ')}\nAdd it to your cart at /products.html!`;
  }

  return "I can help with domains, hosting, AI agents, pricing, and orders. Try asking 'What hosting plans do you have?' or 'How much is the AI Sales Agent?'";
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const products = await Product.find({ isActive: true });
    const productContext = await buildProductContext();

    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are AzlanAI's helpful sales assistant. Answer questions about products and services. Be concise and friendly.\n\nProducts:\n${productContext}`
              },
              { role: 'user', content: message }
            ],
            max_tokens: 300
          })
        });
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return res.json({ reply: data.choices[0].message.content, source: 'ai' });
        }
      } catch (e) {
        console.error('OpenAI fallback:', e.message);
      }
    }

    const reply = ruleBasedReply(message, products);
    res.json({ reply, source: 'rules' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
