export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Enable CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log('Proxy function invoked:', { method: req.method, url: req.url });
    
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnJjaGxpbWF1Z3Fub3N2bWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTI1MTQsImV4cCI6MjA2MDM4ODUxNH0.iuCiOJeQdEr_2s-Ighup4vpYrRgoSEcNSopbBri3wYI';
    
    let targetUrl: string;
    let method = req.method || 'GET';
    let body: any = undefined;
    let headers: any = {};

    if (req.method === 'GET') {
      // For GET requests, URL is in query parameter
      const url = new URL(req.url);
      targetUrl = url.searchParams.get('url') || '';
      console.log('GET request targetUrl:', targetUrl);
    } else {
      // For POST/PUT/DELETE, data is in request body
      try {
        const requestData = await req.json();
        targetUrl = requestData.url;
        method = requestData.method || method;
        body = requestData.body;
        headers = requestData.headers || {};
        console.log('Non-GET request:', { targetUrl, method, hasBody: !!body });
      } catch (error) {
        console.error('Failed to parse request body:', error);
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate that the URL is for our Supabase instance
    if (!targetUrl) {
      console.error('No target URL provided');
      return new Response(
        JSON.stringify({ error: 'URL parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!targetUrl.includes('gwfrchlimaugqnosvmbs.supabase.co')) {
      console.error('Invalid URL domain:', targetUrl);
      return new Response(
        JSON.stringify({ error: 'Invalid URL - must be Supabase domain' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward the request to Supabase
    console.log('Forwarding request to Supabase:', { targetUrl, method });
    
    const response = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log('Supabase response status:', response.status);
    
    if (!response.ok) {
      console.error('Supabase request failed:', response.status, response.statusText);
    }
    
    const data = await response.json();
    console.log('Returning response with status:', response.status);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Proxy error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}