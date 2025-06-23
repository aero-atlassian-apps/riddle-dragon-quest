import React, { useState, useEffect } from 'react';
import { supabaseWithProxy, directSupabase } from '../integrations/supabase/proxyClient';
import { proxyMonitor } from '../utils/proxyMonitor';
import type { ProxyMetrics } from '../utils/proxyMonitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProxyTest: React.FC = () => {
  const [directResult, setDirectResult] = useState<string>('Not tested');
  const [proxyResult, setProxyResult] = useState<string>('Not tested');
  const [isTestingDirect, setIsTestingDirect] = useState(false);
  const [isTestingProxy, setIsTestingProxy] = useState(false);
  const [metrics, setMetrics] = useState<ProxyMetrics | null>(null);
  const [diagnostics, setDiagnostics] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    // Load initial metrics
    setMetrics(proxyMonitor.getMetrics());
  }, []);

  const testDirectConnection = async () => {
    setIsTestingDirect(true);
    try {
      setDirectResult('Testing direct connection...');
      const { data, error } = await directSupabase.from('sessions').select('count').limit(1);
      
      if (error) {
        setDirectResult(`❌ Direct connection failed: ${error.message}`);
      } else {
        setDirectResult('✅ Direct connection successful!');
      }
    } catch (err) {
      setDirectResult(`❌ Direct connection error: ${err}`);
    } finally {
      setIsTestingDirect(false);
      setMetrics(proxyMonitor.getMetrics());
    }
  };

  const testProxyConnection = async () => {
    setIsTestingProxy(true);
    try {
      setProxyResult('Testing proxy connection...');
      const { data, error } = await supabaseWithProxy.from('sessions').select('count').limit(1);
      
      if (error) {
        setProxyResult(`❌ Proxy connection failed: ${error.message}`);
      } else {
        setProxyResult('✅ Proxy connection successful!');
      }
    } catch (err) {
      setProxyResult(`❌ Proxy connection error: ${err}`);
    } finally {
      setIsTestingProxy(false);
      setMetrics(proxyMonitor.getMetrics());
    }
  };

  const generateDiagnostics = () => {
    const diagnosticsData = proxyMonitor.exportDiagnostics();
    setDiagnostics(diagnosticsData);
  };

  const clearMetrics = () => {
    proxyMonitor.clearMetrics();
    setMetrics(proxyMonitor.getMetrics());
    setDiagnostics('');
  };

  useEffect(() => {
    testDirectConnection();
    testProxyConnection();
  }, []);

  const health = metrics ? proxyMonitor.getConnectionHealth() : null;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test & Diagnostics</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Direct Connection Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{directResult}</p>
            <Button 
              onClick={testDirectConnection} 
              disabled={isTestingDirect}
              className="w-full"
            >
              {isTestingDirect ? 'Testing...' : 'Test Direct Connection'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proxy Connection Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{proxyResult}</p>
            <Button 
              onClick={testProxyConnection} 
              disabled={isTestingProxy}
              className="w-full"
            >
              {isTestingProxy ? 'Testing...' : 'Test Proxy Connection'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {metrics && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>Direct Attempts: {metrics.directConnectionAttempts}</div>
                <div>Direct Successes: {metrics.directConnectionSuccesses}</div>
                <div>Direct Failures: {metrics.directConnectionFailures}</div>
                <div>Proxy Attempts: {metrics.proxyConnectionAttempts}</div>
                <div>Proxy Successes: {metrics.proxyConnectionSuccesses}</div>
                <div>Proxy Failures: {metrics.proxyConnectionFailures}</div>
                <div>Corporate Environment: {metrics.corporateEnvironmentDetected ? 'Yes' : 'No'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Health</CardTitle>
            </CardHeader>
            <CardContent>
              {health && (
                <div className="space-y-2 text-sm">
                  <div>Direct Success Rate: {(health.directSuccessRate * 100).toFixed(1)}%</div>
                  <div>Proxy Success Rate: {(health.proxySuccessRate * 100).toFixed(1)}%</div>
                  <div>Recommended: {health.recommendedConnection}</div>
                  <div>Corporate Environment: {health.corporateEnvironment ? 'Detected' : 'Not Detected'}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Button onClick={generateDiagnostics} variant="outline">
          Generate Diagnostics
        </Button>
        <Button onClick={clearMetrics} variant="outline">
          Clear Metrics
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
      </div>

      {diagnostics && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Diagnostic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {diagnostics}
            </pre>
            <Button 
              onClick={() => navigator.clipboard.writeText(diagnostics)}
              className="mt-2"
              variant="outline"
              size="sm"
            >
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Corporate Network Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              If you're on a corporate network and the direct connection fails, 
              the application will automatically use the proxy connection through 
              your whitelisted Vercel domain.
            </p>
            <p>
              <strong>For IT Administrators:</strong> If you need to whitelist 
              additional domains, please add:
            </p>
            <ul className="list-disc list-inside ml-4">
              <li><code>gwfrchlimaugqnosvmbs.supabase.co</code> (Direct access)</li>
              <li><code>gamesofcops.vercel.app</code> (Proxy fallback - already whitelisted)</li>
            </ul>
            <p className="mt-4">
              <strong>Environment Variables:</strong> You can force proxy mode by setting 
              <code>VITE_FORCE_PROXY=true</code> in your environment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProxyTest;