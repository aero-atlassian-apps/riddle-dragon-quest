import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { proxyMonitor } from '../../utils/proxyMonitor';

// Use environment variables only - no hardcoded fallbacks for security
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
}
const FORCE_PROXY = import.meta.env.VITE_FORCE_PROXY === 'true';
const PROXY_TEST_TIMEOUT = parseInt(import.meta.env.VITE_PROXY_TEST_TIMEOUT || '3000');

// Proxy state management with proper synchronization
class ProxyState {
  private _useProxy: boolean = FORCE_PROXY;
  private _testCompleted: boolean = false;
  private _testPromise: Promise<void> | null = null;
  private _testInProgress: boolean = false;

  get useProxy(): boolean {
    return this._useProxy;
  }

  get testCompleted(): boolean {
    return this._testCompleted;
  }

  async testDirectAccess(): Promise<void> {
    // If test already completed or forced proxy, return immediately
    if (this._testCompleted || FORCE_PROXY) {
      return;
    }

    // If test is already in progress, wait for it
    if (this._testPromise) {
      return this._testPromise;
    }

    // Start new test
    this._testInProgress = true;
    this._testPromise = this._performDirectAccessTest();
    
    try {
      await this._testPromise;
    } finally {
      this._testInProgress = false;
      this._testCompleted = true;
    }
  }

  private async _performDirectAccessTest(): Promise<void> {
    if (FORCE_PROXY) {
      this._useProxy = true;
      return;
    }

    proxyMonitor.recordDirectConnectionAttempt();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PROXY_TEST_TIMEOUT);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
         method: 'HEAD',
         headers: {
           'apikey': SUPABASE_ANON_KEY,
           'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
         },
         signal: controller.signal,
       });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 401) {
        // 401 is expected for HEAD requests without proper auth
        this._useProxy = false;
        proxyMonitor.recordDirectConnectionSuccess();
      } else {
        this._useProxy = true;
        proxyMonitor.recordDirectConnectionFailure();
      }
    } catch (error) {
      this._useProxy = true;
      proxyMonitor.recordDirectConnectionFailure();
    }
  }
}

const proxyState = new ProxyState();

// Custom fetch function that routes through proxy when needed
const proxyFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Test direct access first
  await proxyState.testDirectAccess();
  
  if (!proxyState.useProxy) {
    // Direct access works, use normal fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  // Use proxy with retry logic
  const proxyUrl = `${window.location.origin}/api/supabase-proxy`;
  const maxRetries = 2;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    proxyMonitor.recordProxyConnectionAttempt();
    
    try {
      // Add timeout for proxy requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for proxy
      
      let response;
      
      if (options.method === 'GET' || !options.method) {
        // For GET requests, encode URL as query parameter
        response = await fetch(`${proxyUrl}?url=${encodeURIComponent(url)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
        });
      } else {
        // For POST/PUT/DELETE, send URL in body
        response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            method: options.method,
            headers: options.headers,
            body: options.body,
          }),
          signal: controller.signal,
        });
      }
      
      clearTimeout(timeoutId);
      proxyMonitor.recordProxyConnectionSuccess();
      return response;
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      lastError = fetchError;
      
      if (attempt === maxRetries) {
        proxyMonitor.recordProxyConnectionFailure();
        throw lastError;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  // This should never be reached, but just in case
  proxyMonitor.recordProxyConnectionFailure();
  throw lastError || new Error('Proxy request failed after all retries');
};

// Create Supabase client with proxy support
export const supabaseWithProxy = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    fetch: proxyFetch,
  },
  realtime: {
    eventsPerSecond: 2,
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000),
    timeout: 10000,
    debug: process.env.NODE_ENV === 'development',
  },
});

// Direct Supabase client (for testing)
export const directSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    eventsPerSecond: 2,
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000),
    timeout: 10000,
    debug: process.env.NODE_ENV === 'development',
  },
});

// Export proxy state for monitoring
export { proxyState };

// Default export uses proxy-enabled client
export default supabaseWithProxy;