export default async function handler(req, res) {
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path;
  
  const supabaseUrl = 'https://jmpmucdoqkcpetdfnxrj.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase API key' });
  }
  
  const url = `${supabaseUrl}/rest/v1/${pathString}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
  
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'apikey': supabaseKey,
        'authorization': `Bearer ${supabaseKey}`,
        'content-type': req.headers['content-type'] || 'application/json',
        'prefer': req.headers['prefer'] || '',
        ...req.headers
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.text();
    
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    res.send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}