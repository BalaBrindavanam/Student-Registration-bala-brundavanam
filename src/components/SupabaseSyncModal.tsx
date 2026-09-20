import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { fetchSupabaseStatus, syncSupabaseDatabase } from '../services/api';
import { SupabaseStatus } from '../types';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete
}) => {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSupabaseStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check Supabase status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setSyncResult(null);
    }
  }, [isOpen]);

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncSupabaseDatabase();
      setSyncResult({
        success: res.success,
        message: res.message
      });
      if (res.success) {
        await loadStatus();
        if (onSyncComplete) onSyncComplete();
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || 'Failed to sync with Supabase'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySql = () => {
    if (status?.setupSql) {
      navigator.clipboard.writeText(status.setupSql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Supabase Cloud Sync</h3>
              <p className="text-xs text-slate-500">
                Connected Project ID: <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">oekqkfhnmvuanzppvmek</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm">Connecting to Supabase...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">Supabase Connection Notice</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          ) : status ? (
            <>
              {/* Status card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Project ID</p>
                  <p className="text-xs font-mono font-bold text-slate-800 mt-1 truncate">{status.projectId}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Table: students</p>
                  <p className="text-xs font-semibold mt-1">
                    {status.tableExists ? (
                      <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold inline-flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending Setup
                      </span>
                    )}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cloud Records</p>
                  <p className="text-base font-bold text-blue-700 mt-0.5 font-mono">{status.recordCount}</p>
                </div>
              </div>

              {/* Notice if table doesn't exist yet */}
              {!status.tableExists ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-amber-900">
                        One-Time Supabase Setup Required
                      </p>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        To store registrations in Supabase, create the <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">students</code> table by pasting the SQL below into your Supabase SQL Editor:
                      </p>

                      <div className="mt-2.5 relative">
                        <pre className="text-[11px] bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto max-h-36 font-mono border border-slate-800 leading-tight">
                          {status.setupSql}
                        </pre>
                        <button
                          type="button"
                          onClick={handleCopySql}
                          className="absolute top-2 right-2 bg-slate-800/90 hover:bg-slate-700 text-white text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1 border border-slate-700 cursor-pointer"
                        >
                          {copiedSql ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy SQL</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <a
                          href={`https://supabase.com/dashboard/project/${status.projectId}/sql`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Open Supabase SQL Editor</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={loadStatus}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-check Table Status</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Supabase is active!</strong> Every newly registered student with ID format (e.g. <code className="font-mono font-bold">BBT000001</code>) automatically synchronizes with Supabase.
                  </span>
                </div>
              )}

              {/* Sync result alert */}
              {syncResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    syncResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {syncResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{syncResult.message}</span>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={loadStatus}
            disabled={loading}
            className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={syncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing Students...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Sync All Local Records</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
