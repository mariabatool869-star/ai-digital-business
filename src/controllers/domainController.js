const TAKEN_DOMAINS = new Set([
  'google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com',
  'azlanai.com', 'azlan.com', 'test.com', 'example.com', 'admin.com',
  'shop.com', 'store.com', 'business.com', 'mybusiness.com'
]);

const TLD_PRICES = { com: 12.99, net: 14.99, org: 13.99, io: 39.99, ai: 59.99, co: 24.99 };

function normalizeDomain(input) {
  let d = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!d.includes('.')) d += '.com';
  return d;
}

function isValidDomain(domain) {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(domain);
}

exports.searchDomain = async (req, res) => {
  try {
    const domain = normalizeDomain(req.query.domain || '');
    if (!domain || !isValidDomain(domain)) {
      return res.status(400).json({ message: 'Invalid domain format' });
    }

    const tld = domain.split('.').pop();
    const name = domain.split('.')[0];
    const premium = ['ai', 'io', 'app', 'dev'].includes(tld) || name.length <= 3;
    const taken = TAKEN_DOMAINS.has(domain) ||
      (name.length <= 2) ||
      (name.charCodeAt(0) + name.length) % 7 === 0;

    const price = TLD_PRICES[tld] || 12.99;

    res.json({
      domain,
      available: !taken,
      premium,
      price,
      tld,
      message: taken
        ? `${domain} is already registered`
        : `${domain} is available!`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchDomains = async (req, res) => {
  try {
    const base = (req.query.name || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!base || base.length < 2) {
      return res.status(400).json({ message: 'Enter at least 2 characters' });
    }
    const tlds = ['com', 'net', 'org', 'io', 'ai', 'co'];
    const results = tlds.map(tld => {
      const domain = `${base}.${tld}`;
      const taken = TAKEN_DOMAINS.has(domain) || (base.length <= 2) || (base.charCodeAt(0) + base.length + tld.length) % 5 === 0;
      return {
        domain,
        available: !taken,
        price: TLD_PRICES[tld] || 12.99,
        tld
      };
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
