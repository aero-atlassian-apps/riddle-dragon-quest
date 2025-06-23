export const config = { runtime: 'edge' };

// Get environment variables (Edge Runtime compatible) - no hardcoded fallbacks
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;

// Validate required environment variables
if (!SUPABASE_KEY || !SUPABASE_URL) {
  throw new Error('Missing required environment variables: SUPABASE_ANON_KEY and VITE_SUPABASE_URL must be set');
}

// Extract domain from Supabase URL for strict validation
const ALLOWED_DOMAIN = new URL(SUPABASE_URL).hostname;

export default async function handler(req: Request) {
  console.log('🔄 Proxy function invoked:', req.method, req.url);
  
  // Enhanced CORS headers for Supabase
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-auth-token, cookie, set-cookie',
    'Access-Control-Expose-Headers': 'x-supabase-auth-token, set-cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    let targetUrl: string;
    let requestMethod: string;
    let requestHeaders: Record<string, string> = {};
    let requestBody: any;

    if (req.method === 'GET') {
      // Handle GET requests with URL parameter
      const url = new URL(req.url);
      targetUrl = url.searchParams.get('url') || '';
      requestMethod = 'GET';
      
      // Forward original headers
      req.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin') {
          requestHeaders[key] = value;
        }
      });
    } else {
      // Handle POST/PUT/DELETE requests with body
      const requestData = await req.json();
      targetUrl = requestData.url || '';
      requestMethod = requestData.method || req.method;
      requestHeaders = requestData.headers || {};
      requestBody = requestData.body;
      
      // Forward original headers and merge with provided headers
      req.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin' && key.toLowerCase() !== 'content-length') {
          requestHeaders[key] = value;
        }
      });
    }
    
    console.log('🎯 Target URL:', targetUrl);
    console.log('📋 Method:', requestMethod);
    console.log('📝 Headers:', Object.keys(requestHeaders));
    
    // Strict URL validation to prevent SSRF attacks
    if (!targetUrl) {
      console.error('❌ Missing target URL');
      return new Response(JSON.stringify({ error: 'Missing target URL' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch (error) {
      console.error('❌ Invalid URL format:', targetUrl);
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Only allow requests to our specific Supabase domain
    if (parsedUrl.hostname !== ALLOWED_DOMAIN) {
      console.error('❌ Unauthorized domain:', parsedUrl.hostname, 'Expected:', ALLOWED_DOMAIN);
      return new Response(JSON.stringify({ error: 'Unauthorized domain' }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Only allow HTTPS for security
    if (parsedUrl.protocol !== 'https:') {
      console.error('❌ Only HTTPS allowed:', parsedUrl.protocol);
      return new Response(JSON.stringify({ error: 'Only HTTPS allowed' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Start with forwarded headers
    const supabaseHeaders = {
      'apikey': SUPABASE_KEY,
      ...requestHeaders,
    };

    // Ensure critical Supabase authentication headers are present
    if (!supabaseHeaders['Authorization'] && !supabaseHeaders['authorization']) {
      supabaseHeaders['Authorization'] = `Bearer ${SUPABASE_KEY}`;
    }
    
    // Always include the API key for RLS policies
    supabaseHeaders['apikey'] = SUPABASE_KEY;
    
    // Ensure proper content type for JSON requests (only if not already set)
    if (requestMethod !== 'GET' && !supabaseHeaders['content-type'] && !supabaseHeaders['Content-Type']) {
      supabaseHeaders['Content-Type'] = 'application/json';
    }

    console.log('🔑 Using API key:', SUPABASE_KEY.substring(0, 20) + '...');
    console.log('🎯 Target URL:', targetUrl);
    console.log('📤 Request method:', requestMethod);
    console.log('📋 Request headers:', Object.keys(supabaseHeaders));
    console.log('🔐 Authorization header:', supabaseHeaders['Authorization'] ? 'present' : 'missing');
    console.log('🔑 API key header:', supabaseHeaders['apikey'] ? 'present' : 'missing');
    console.log('🍪 Cookie header:', supabaseHeaders['cookie'] ? 'present' : 'missing');
    console.log('📦 Request body length:', requestBody ? requestBody.length : 0);
    
    // Log authentication context for debugging
    if (supabaseHeaders['Authorization']) {
      const authHeader = supabaseHeaders['Authorization'];
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('🎫 Auth token type:', token.startsWith('eyJ') ? 'JWT' : 'other');
        console.log('🎫 Auth token length:', token.length);
      }
    }
    
    // Forward the request to Supabase
    const fetchOptions: RequestInit = {
      method: requestMethod,
      headers: supabaseHeaders,
    };

    if (requestBody && requestMethod !== 'GET' && requestMethod !== 'HEAD') {
      fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
      console.log('📦 Request body length:', fetchOptions.body.length);
    }

    console.log('🚀 Making request to Supabase...');
    const response = await fetch(targetUrl, fetchOptions);
    
    console.log('📡 Supabase response status:', response.status, response.statusText);
    console.log('📡 Supabase response headers:', Object.fromEntries(response.headers.entries()));

    // Forward important headers from Supabase response
    const responseHeaders = { ...corsHeaders };
    
    // Forward content type
    const contentType = response.headers.get('Content-Type');
    if (contentType) {
      responseHeaders['Content-Type'] = contentType;
    }
    
    // Forward authentication-related headers
    const authHeaders = ['set-cookie', 'x-supabase-auth-token', 'authorization'];
    authHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders[header] = value;
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Supabase error response:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    const data = await response.text();
    console.log('✅ Supabase success response length:', data.length);

    return new Response(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('❌ Proxy error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: 'Proxy request failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}