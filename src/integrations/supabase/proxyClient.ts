import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { proxyMonitor } from '../../utils/proxyMonitor';

// Use environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gwfrchlimaugqnosvmbs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZnJjaGxpbWF1Z3Fub3N2bWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTI1MTQsImV4cCI6MjA2MDM4ODUxNH0.iuCiOJeQdEr_2s-Ighup4vpYrRgoSEcNSopbBri3wYI";
const FORCE_PROXY = import.meta.env.VITE_FORCE_PROXY === 'true';
const PROXY_TEST_TIMEOUT = parseInt(import.meta.env.VITE_PROXY_TEST_TIMEOUT || '3000');

// Detect if we're in a corporate environment that might block Supabase
let useProxy = FORCE_PROXY;
let proxyTestCompleted = FORCE_PROXY;

// Test if direct Supabase access works
const testDirectAccess = async (): Promise<boolean> => {
  if (proxyTestCompleted) return !useProxy;
  
  proxyMonitor.recordDirectConnectionAttempt();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROXY_TEST_TIMEOUT);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': SUPABASE_PUBLISHABLE_KEY,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      useProxy = false;
      proxyTestCompleted = true;
      proxyMonitor.recordDirectConnectionSuccess();
      console.log('Direct Supabase access available');
      return true;
    }
  } catch (error) {
    proxyMonitor.recordDirectConnectionFailure();
    console.log('Direct Supabase access blocked, using proxy:', error);
  }
  
  useProxy = true;
  proxyTestCompleted = true;
  return false;
};

// Custom fetch function that routes through proxy when needed
const proxyFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Test direct access first
  await testDirectAccess();
  
  if (!useProxy) {
    // Direct access works, use normal fetch
    return fetch(url, options);
  }
  
  // Use proxy
  const proxyUrl = `${window.location.origin}/api/supabase-proxy`;
  
  proxyMonitor.recordProxyConnectionAttempt();
  
  try {
    let response;
    
    if (options.method === 'GET' || !options.method) {
      // For GET requests, use query parameter
      response = await fetch(`${proxyUrl}?url=${encodeURIComponent(url)}`, {
        ...options,
        method: 'GET',
      });
    } else {
      // For POST/PUT/DELETE, send URL and options in body
      let requestBody;
      try {
        // Handle different body types safely
        if (options.body) {
          if (typeof options.body === 'string') {
            try {
              requestBody = JSON.parse(options.body);
            } catch {
              requestBody = options.body;
            }
          } else {
            requestBody = options.body;
          }
        }
      } catch (error) {
        console.warn('Error parsing request body:', error);
        requestBody = options.body;
      }
      
      response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          method: options.method,
          headers: options.headers,
          body: requestBody,
        }),
      });
    }
    
    if (response.ok) {
      proxyMonitor.recordProxyConnectionSuccess();
    } else {
      proxyMonitor.recordProxyConnectionFailure();
      console.warn('Proxy request failed:', response.status, response.statusText);
    }
    
    return response;
  } catch (error) {
    proxyMonitor.recordProxyConnectionFailure();
    console.error('Proxy connection error:', error);
    throw error;
  }
};

// Create Supabase client with custom fetch
export const supabaseWithProxy = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    global: {
      fetch: proxyFetch,
    },
  }
);

// Export both clients for flexibility
export const directSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Default export uses proxy-enabled client
export default supabaseWithProxy;