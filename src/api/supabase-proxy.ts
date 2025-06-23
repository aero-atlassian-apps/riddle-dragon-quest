export async function POST(req: Request) {
  try {
    const { url, method = 'GET', headers = {}, body } = await req.json();
    
    // Validate that the URL is for our Supabase instance
    if (!url.includes('gwfrchlimaugqnosvmbs.supabase.co')) {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward the request to Supabase
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnJjaGxpbWF1Z3Fub3N2bWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTI1MTQsImV4cCI6MjA2MDM4ODUxNH0.iuCiOJeQdEr_2s-Ighup4vpYrRgoSEcNSopbBri3wYI',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnJjaGxpbWF1Z3Fub3N2bWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTI1MTQsImV4cCI6MjA2MDM4ODUxNH0.iuCiOJeQdEr_2s-Ighup4vpYrRgoSEcNSopbBri3wYI`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');
  
  if (!targetUrl || !targetUrl.includes('gwfrchlimaugqnosvmbs.supabase.co')) {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnJjaGxpbWF1Z3Fub3N2bWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTI1MTQsImV4cCI6MjA2MDM4ODUxNH0.iuCiOJeQdEr_2s-Ighup4vpYrRgoSEcNSopbBri3wYI',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnJjaGxpbWF1Z3Fub3N2bWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTI1MTQsImV4cCI6MjA2MDM4ODUxNH0.iuCiOJeQdEr_2s-Ighup4vpYrRgoSEcNSopbBri3wYI`,
      },
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    },
  });
}