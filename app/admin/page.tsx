"use client";

import { useState } from "react";
import {
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Lock,
  Server,
  FileSearch,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiKeyStatus {
  name: string;
  envVar: string;
  configured: boolean;
}

interface ProviderStatus {
  name: string;
  configured: boolean;
  operational: boolean;
  latencyMs: number | null;
  error: string | null;
}

interface RegSource {
  id: string;
  jurisdictionId: string;
  sourceTitle: string;
  sourceType: string;
  monitorFrequency: string;
  lastChecked: string | null;
  lastChangeDetected: string | null;
  active: boolean;
}

interface RegChange {
  id: string;
  jurisdictionId: string;
  fieldName: string;
  sourceUrl: string;
  updateTimestamp: string;
  extractionConfidence: number;
  reviewStatus: string;
}

interface DashboardData {
  timestamp: string;
  apiKeys: ApiKeyStatus[];
  allKeysConfigured: boolean;
  configuredCount: number;
  totalKeys: number;
  monitoring: {
    totalSources: number;
    activeSources: number;
    jurisdictionsCovered: number;
    lastScan: string | null;
    nextScheduledScan: string;
    healthStatus: "healthy" | "warning" | "stale";
  };
  regulationSources: RegSource[];
  regulationChanges: RegChange[];
  cronConfig: Record<string, { path: string; schedule: string; description: string }>;
  environment: {
    nodeEnv: string;
    vercelEnv: string;
    region: string;
    cronSecretConfigured: boolean;
  };
}

interface HealthData {
  timestamp: string;
  allOperational: boolean;
  providers: ProviderStatus[];
  summary: string;
}

export default function AdminDashboard() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const fetchDashboard = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid secret");
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setDashboardData(data);
      setAuthenticated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/system-health", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json();
      setHealthData(data);
    } catch {
      setError("Failed to run health check");
    } finally {
      setHealthLoading(false);
    }
  };

  const triggerRegulationScan = async () => {
    setScanLoading(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/regulation-scan", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(
          `Scan complete: ${data.result.sourcesChecked} sources checked, ${data.result.changesDetected} changes, ${data.result.errors} errors`
        );
        // Refresh dashboard data
        await fetchDashboard(secret);
      } else {
        setScanResult("Scan failed");
      }
    } catch {
      setScanResult("Failed to trigger scan");
    } finally {
      setScanLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.trim()) fetchDashboard(secret.trim());
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Lock className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-secondary">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">DCS Property Intelligence</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1.5">
                CRON_SECRET
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Enter admin secret"
              />
            </div>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !secret.trim()}>
              {loading ? "Authenticating..." : "Access Dashboard"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-secondary text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-bold">DCS Admin Dashboard</h1>
              <p className="text-xs text-white/60">Property Intelligence System Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">
              {dashboardData?.environment.vercelEnv || "unknown"} &middot; {dashboardData?.environment.region || ""}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-xs"
              onClick={() => fetchDashboard(secret)}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="API Keys"
            value={`${dashboardData?.configuredCount || 0}/${dashboardData?.totalKeys || 0}`}
            icon={Zap}
            status={dashboardData?.allKeysConfigured ? "good" : "warning"}
          />
          <StatCard
            label="Regulation Sources"
            value={`${dashboardData?.monitoring.activeSources || 0}`}
            icon={FileSearch}
            status="good"
          />
          <StatCard
            label="Jurisdictions"
            value={`${dashboardData?.monitoring.jurisdictionsCovered || 0}`}
            icon={Server}
            status="good"
          />
          <StatCard
            label="Monitor Health"
            value={dashboardData?.monitoring.healthStatus || "unknown"}
            icon={Activity}
            status={
              dashboardData?.monitoring.healthStatus === "healthy" ? "good" :
              dashboardData?.monitoring.healthStatus === "warning" ? "warning" : "error"
            }
          />
        </div>

        {/* API Keys + Live Health */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* API Key Configuration */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-secondary text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                API Key Configuration
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                dashboardData?.allKeysConfigured
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {dashboardData?.allKeysConfigured ? "All Configured" : "Missing Keys"}
              </span>
            </div>
            <div className="space-y-2">
              {dashboardData?.apiKeys.map((key) => (
                <div key={key.envVar} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="text-xs font-medium text-secondary">{key.name}</span>
                    <span className="text-[10px] text-muted-foreground block">{key.envVar}</span>
                  </div>
                  {key.configured ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Health Check */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-secondary text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Live API Health
              </h2>
              <Button size="sm" variant="outline" onClick={fetchHealth} disabled={healthLoading} className="text-xs">
                <RefreshCw className={`h-3 w-3 mr-1 ${healthLoading ? "animate-spin" : ""}`} />
                {healthLoading ? "Checking..." : "Run Check"}
              </Button>
            </div>
            {healthData ? (
              <div className="space-y-2">
                {healthData.providers.map((p) => (
                  <div key={p.name} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      {p.operational ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                      )}
                      <span className="text-xs font-medium text-secondary">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.latencyMs !== null && (
                        <span className="text-[10px] text-muted-foreground">{p.latencyMs}ms</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        p.operational ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}>
                        {p.operational ? "OK" : "DOWN"}
                      </span>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground mt-2">
                  Last checked: {new Date(healthData.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Click &quot;Run Check&quot; to test all API providers</p>
              </div>
            )}
          </div>
        </div>

        {/* Cron Jobs + Regulation Scan */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cron Configuration */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-semibold text-secondary text-sm flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              Scheduled Cron Jobs
            </h2>
            <div className="space-y-3">
              {dashboardData?.cronConfig && Object.entries(dashboardData.cronConfig).map(([key, cron]) => (
                <div key={key} className="bg-slate-50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-secondary">{cron.description}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-mono">
                      {cron.schedule}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{cron.path}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-amber-50/50 border border-amber-100 rounded-lg px-3 py-2">
              <p className="text-[10px] text-amber-700">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Cron jobs require CRON_SECRET env var in Vercel. Status: {dashboardData?.environment.cronSecretConfigured ? "Configured" : "Not Set"}
              </p>
            </div>
          </div>

          {/* Manual Regulation Scan */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-secondary text-sm flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-primary" />
                Regulation Monitor
              </h2>
              <Button size="sm" variant="outline" onClick={triggerRegulationScan} disabled={scanLoading} className="text-xs">
                <RefreshCw className={`h-3 w-3 mr-1 ${scanLoading ? "animate-spin" : ""}`} />
                {scanLoading ? "Scanning..." : "Run Scan"}
              </Button>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Active Sources</span>
                <span className="font-medium text-secondary">{dashboardData?.monitoring.activeSources}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Jurisdictions Covered</span>
                <span className="font-medium text-secondary">{dashboardData?.monitoring.jurisdictionsCovered}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last Scan</span>
                <span className="font-medium text-secondary">
                  {dashboardData?.monitoring.lastScan
                    ? new Date(dashboardData.monitoring.lastScan).toLocaleString()
                    : "Never"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Health</span>
                <span className={`font-medium ${
                  dashboardData?.monitoring.healthStatus === "healthy" ? "text-emerald-600" :
                  dashboardData?.monitoring.healthStatus === "warning" ? "text-amber-600" :
                  "text-red-600"
                }`}>
                  {dashboardData?.monitoring.healthStatus || "unknown"}
                </span>
              </div>
            </div>

            {scanResult && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
                <p className="text-[10px] text-blue-700">{scanResult}</p>
              </div>
            )}

            {dashboardData?.regulationChanges && dashboardData.regulationChanges.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-secondary mb-1.5">Recent Changes</p>
                <div className="space-y-1">
                  {dashboardData.regulationChanges.slice(-5).map((change) => (
                    <div key={change.id} className="text-[10px] bg-slate-50 rounded px-2 py-1.5 flex items-center justify-between">
                      <span className="text-muted-foreground">{change.jurisdictionId}</span>
                      <span className={`px-1.5 py-0.5 rounded-full ${
                        change.reviewStatus === "approved" ? "bg-emerald-50 text-emerald-700" :
                        change.reviewStatus === "rejected" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {change.reviewStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Regulation Sources Table */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-secondary text-sm flex items-center gap-2 mb-4">
            <FileSearch className="h-4 w-4 text-primary" />
            Monitored Regulation Sources ({dashboardData?.regulationSources?.length || 0})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Source</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Jurisdiction</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Type</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Frequency</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Last Checked</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.regulationSources?.map((source) => (
                  <tr key={source.id} className="border-b border-border/50 hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium text-secondary">{source.sourceTitle}</td>
                    <td className="py-2 px-2 text-muted-foreground">{source.jurisdictionId}</td>
                    <td className="py-2 px-2">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">{source.sourceType}</span>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{source.monitorFrequency}</td>
                    <td className="py-2 px-2 text-muted-foreground">
                      {source.lastChecked ? new Date(source.lastChecked).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        source.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {source.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[10px] text-muted-foreground">
            DCS Property Intelligence Admin &middot; Last updated: {dashboardData?.timestamp ? new Date(dashboardData.timestamp).toLocaleString() : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  status,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "good" | "warning" | "error";
}) {
  const statusColors = {
    good: "bg-emerald-50 border-emerald-100",
    warning: "bg-amber-50 border-amber-100",
    error: "bg-red-50 border-red-100",
  };
  const iconColors = {
    good: "text-emerald-600",
    warning: "text-amber-600",
    error: "text-red-600",
  };

  return (
    <div className={`rounded-2xl border p-4 ${statusColors[status]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${iconColors[status]}`} />
        <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-secondary capitalize">{value}</p>
    </div>
  );
}

