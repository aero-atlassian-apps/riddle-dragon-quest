// Proxy monitoring and logging utility

interface ProxyMetrics {
  directConnectionAttempts: number;
  directConnectionSuccesses: number;
  directConnectionFailures: number;
  proxyConnectionAttempts: number;
  proxyConnectionSuccesses: number;
  proxyConnectionFailures: number;
  lastDirectTest: Date | null;
  lastProxyUsage: Date | null;
  corporateEnvironmentDetected: boolean;
}

class ProxyMonitor {
  private metrics: ProxyMetrics = {
    directConnectionAttempts: 0,
    directConnectionSuccesses: 0,
    directConnectionFailures: 0,
    proxyConnectionAttempts: 0,
    proxyConnectionSuccesses: 0,
    proxyConnectionFailures: 0,
    lastDirectTest: null,
    lastProxyUsage: null,
    corporateEnvironmentDetected: false,
  };

  private readonly STORAGE_KEY = 'riddle-dragon-proxy-metrics';

  constructor() {
    this.loadMetrics();
  }

  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.metrics = {
          ...this.metrics,
          ...parsed,
          lastDirectTest: parsed.lastDirectTest ? new Date(parsed.lastDirectTest) : null,
          lastProxyUsage: parsed.lastProxyUsage ? new Date(parsed.lastProxyUsage) : null,
        };
      }
    } catch (error) {
      console.warn('Failed to load proxy metrics:', error);
    }
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Failed to save proxy metrics:', error);
    }
  }

  recordDirectConnectionAttempt(): void {
    this.metrics.directConnectionAttempts++;
    this.metrics.lastDirectTest = new Date();
    this.saveMetrics();
  }

  recordDirectConnectionSuccess(): void {
    this.metrics.directConnectionSuccesses++;
    this.metrics.corporateEnvironmentDetected = false;
    this.saveMetrics();
  }

  recordDirectConnectionFailure(): void {
    this.metrics.directConnectionFailures++;
    this.metrics.corporateEnvironmentDetected = true;
    this.saveMetrics();
  }

  recordProxyConnectionAttempt(): void {
    this.metrics.proxyConnectionAttempts++;
    this.metrics.lastProxyUsage = new Date();
    this.saveMetrics();
  }

  recordProxyConnectionSuccess(): void {
    this.metrics.proxyConnectionSuccesses++;
    this.saveMetrics();
  }

  recordProxyConnectionFailure(): void {
    this.metrics.proxyConnectionFailures++;
    this.saveMetrics();
  }

  getMetrics(): Readonly<ProxyMetrics> {
    return { ...this.metrics };
  }

  getConnectionHealth(): {
    directSuccessRate: number;
    proxySuccessRate: number;
    recommendedConnection: 'direct' | 'proxy' | 'unknown';
    corporateEnvironment: boolean;
  } {
    const directSuccessRate = this.metrics.directConnectionAttempts > 0 
      ? this.metrics.directConnectionSuccesses / this.metrics.directConnectionAttempts 
      : 0;
    
    const proxySuccessRate = this.metrics.proxyConnectionAttempts > 0 
      ? this.metrics.proxyConnectionSuccesses / this.metrics.proxyConnectionAttempts 
      : 0;

    let recommendedConnection: 'direct' | 'proxy' | 'unknown' = 'unknown';
    
    if (directSuccessRate > 0.8) {
      recommendedConnection = 'direct';
    } else if (proxySuccessRate > 0.8 || this.metrics.corporateEnvironmentDetected) {
      recommendedConnection = 'proxy';
    }

    return {
      directSuccessRate,
      proxySuccessRate,
      recommendedConnection,
      corporateEnvironment: this.metrics.corporateEnvironmentDetected,
    };
  }

  clearMetrics(): void {
    this.metrics = {
      directConnectionAttempts: 0,
      directConnectionSuccesses: 0,
      directConnectionFailures: 0,
      proxyConnectionAttempts: 0,
      proxyConnectionSuccesses: 0,
      proxyConnectionFailures: 0,
      lastDirectTest: null,
      lastProxyUsage: null,
      corporateEnvironmentDetected: false,
    };
    this.saveMetrics();
  }

  exportDiagnostics(): string {
    const health = this.getConnectionHealth();
    const diagnostics = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: this.metrics,
      health,
      environment: {
        isDevelopment: import.meta.env.DEV,
        forceProxy: import.meta.env.VITE_FORCE_PROXY === 'true',
        proxyTimeout: import.meta.env.VITE_PROXY_TEST_TIMEOUT || '3000',
      },
    };
    
    return JSON.stringify(diagnostics, null, 2);
  }
}

// Export singleton instance
export const proxyMonitor = new ProxyMonitor();

// Export types for external use
export type { ProxyMetrics };