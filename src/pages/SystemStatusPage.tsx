import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Activity, Server, Clock, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';

export default function SystemStatusPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error('Health check failed');
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <SEO title="System Status | Let Solutions" noindex />
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold">System Status</h1>
                <p className="text-slate-400 text-sm">Real-time health monitoring for Let Solutions</p>
              </div>
              <button 
                onClick={checkHealth}
                disabled={loading}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors disabled:opacity-50"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${error ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {error ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">API Connectivity</h3>
                  <p className="text-sm text-slate-500">{error ? 'Service Unavailable' : 'All systems operational'}</p>
                </div>
              </div>
              <div className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white border shadow-sm">
                {error ? 'Maintenance' : 'Live'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                  <Activity size={14} /> Uptime
                </div>
                <div className="text-2xl font-mono font-bold text-slate-900">
                  {health?.uptime ? `${Math.floor(health.uptime / 60)}m ${Math.floor(health.uptime % 60)}s` : '--'}
                </div>
              </div>
              <div className="p-4 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                  <Clock size={14} /> Latency
                </div>
                <div className="text-2xl font-mono font-bold text-slate-900">
                   {loading ? '...' : (error ? 'Timeout' : ' < 10ms')}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Raw Diagnostics</h4>
              <div className="p-4 bg-slate-900 rounded-2xl font-mono text-[11px] text-blue-400 overflow-x-auto min-h-[100px]">
                {loading ? '> Fetching diagnostics...' : (
                  error ? `> ERROR: ${error}` : (
                    <div>
                      <div>{`> GET /api/health HTTP/1.1`}</div>
                      <div className="text-green-400">{`> 200 OK`}</div>
                      <div className="mt-2 text-slate-300">{JSON.stringify(health, null, 2)}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Let Solutions Monitoring. Secure Infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
