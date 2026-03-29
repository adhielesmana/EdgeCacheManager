import * as React from "react";
import { useRoute } from "wouter";
import { 
  useGetDomain, 
  useGetDomainStats, 
  useCreateOrigin, 
  useDeleteOrigin,
  usePurgeCache
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatBytes, formatNumber } from "@/lib/utils";
import { 
  Activity, ArrowLeft, Globe, Server, Trash2, Edit2, 
  RefreshCw, Zap, Shield, Settings 
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DomainDetails() {
  const [, params] = useRoute("/domains/:id");
  const domainId = Number(params?.id);
  
  const { data: domain, isLoading: isDomainLoading } = useGetDomain(domainId);
  const { data: stats, isLoading: isStatsLoading } = useGetDomainStats(domainId);
  const purgeMutation = usePurgeCache();
  const queryClient = useQueryClient();
  
  const [isOriginOpen, setIsOriginOpen] = React.useState(false);
  const [purgePath, setPurgePath] = React.useState("");
  const [isPurging, setIsPurging] = React.useState(false);

  if (isDomainLoading || isStatsLoading) {
    return <div className="flex justify-center py-20"><Activity className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!domain) return <div>Domain not found</div>;

  const handlePurge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPurging(true);
    try {
      const res = await purgeMutation.mutateAsync({
        domainId,
        data: purgePath ? { path: purgePath } : {}
      });
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message || "Failed to purge cache");
    } finally {
      setIsPurging(false);
      setPurgePath("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/domains" className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-display font-bold">{domain.name}</h1>
          <Badge variant={domain.status === "active" ? "success" : "secondary"}>{domain.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats & Settings */}
        <div className="space-y-8">
          <Card>
            <div className="p-6 border-b border-white/5 font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" /> Edge Statistics
            </div>
            <CardContent className="p-6 space-y-6">
              {stats ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-mono">{formatNumber(stats.requests)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bandwidth</p>
                    <p className="text-2xl font-mono">{formatBytes(stats.bandwidth)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                    <div className="flex items-center space-x-3">
                      <p className="text-2xl font-mono text-amber-400">{(stats.cacheHitRate * 100).toFixed(1)}%</p>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${stats.cacheHitRate * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No traffic data available yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="p-6 border-b border-white/5 font-semibold flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary" /> Cache Management
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={domain.cacheEnabled ? "success" : "outline"}>{domain.cacheEnabled ? "Enabled" : "Disabled"}</Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Edge TTL</span>
                <span className="font-mono">{domain.cacheTtl}s</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Cached Objects</span>
                <span className="font-mono">{stats ? formatNumber(stats.cachedFiles) : 0}</span>
              </div>
              
              <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="text-sm font-medium">Instant Purge</label>
                <form onSubmit={handlePurge} className="flex space-x-2">
                  <Input 
                    placeholder="/* (Leave blank for purge all)" 
                    value={purgePath}
                    onChange={e => setPurgePath(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="secondary" isLoading={isPurging}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Origins */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <Server className="h-5 w-5 mr-2 text-primary" />
              Origin Servers
            </h2>
            <Button size="sm" onClick={() => setIsOriginOpen(true)}>Add Origin</Button>
          </div>

          <div className="space-y-4">
            {!domain.origins.length ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Server className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-1">No origins configured</p>
                  <p className="text-sm text-muted-foreground">Traffic cannot be served until at least one origin is added.</p>
                </CardContent>
              </Card>
            ) : (
              domain.origins.map(origin => (
                <OriginRow key={origin.id} origin={origin} domainId={domainId} />
              ))
            )}
          </div>
        </div>
      </div>

      <CreateOriginDialog 
        domainId={domainId} 
        open={isOriginOpen} 
        onOpenChange={setIsOriginOpen} 
      />
    </div>
  );
}

function OriginRow({ origin, domainId }: { origin: any, domainId: number }) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteOrigin();

  const handleDelete = async () => {
    if(!confirm(`Delete origin ${origin.address}?`)) return;
    try {
      await deleteMutation.mutateAsync({ domainId, originId: origin.id });
      toast.success("Origin deleted");
      queryClient.invalidateQueries({ queryKey: [`/api/domains/${domainId}`] });
    } catch(e: any) {
      toast.error(e.message || "Failed to delete");
    }
  }

  return (
    <Card className="overflow-hidden hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-medium">{origin.address}:{origin.port}</span>
              <Badge variant={origin.isActive ? "success" : "secondary"} className="h-5 text-[10px] px-1.5 py-0">
                {origin.isActive ? "Active" : "Down"}
              </Badge>
            </div>
            <div className="flex items-center space-x-3 mt-1 text-sm text-muted-foreground">
              <span className="uppercase">{origin.protocol}</span>
              <span>•</span>
              <span>Weight: {origin.weight}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleDelete} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}

function CreateOriginDialog({ domainId, open, onOpenChange }: { domainId: number, open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const createMutation = useCreateOrigin();
  
  const [address, setAddress] = React.useState("");
  const [port, setPort] = React.useState(80);
  const [protocol, setProtocol] = React.useState<"http"|"https">("http");
  const [weight, setWeight] = React.useState(100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        domainId,
        data: { address, port, protocol, weight }
      });
      toast.success("Origin added successfully");
      queryClient.invalidateQueries({ queryKey: [`/api/domains/${domainId}`] });
      onOpenChange(false);
      setAddress(""); setPort(80); setProtocol("http"); setWeight(100);
    } catch (err: any) {
      toast.error(err.message || "Failed to create origin");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Add Origin Server</DialogTitle>
          <DialogDescription>Add a new backend server for this domain to fetch content from.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Server Address</label>
            <Input 
              placeholder="e.g. 10.0.0.1 or origin.example.com" 
              value={address} 
              onChange={e => setAddress(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Port</label>
              <Input 
                type="number" 
                value={port} 
                onChange={e => setPort(Number(e.target.value))}
                min={1}
                max={65535}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Protocol</label>
              <select 
                className="flex h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                value={protocol}
                onChange={e => setProtocol(e.target.value as "http"|"https")}
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (1-100)</label>
            <Input 
              type="number" 
              value={weight} 
              onChange={e => setWeight(Number(e.target.value))}
              min={1}
              max={100}
              required
            />
            <p className="text-xs text-muted-foreground">Used for load balancing requests.</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending}>Add Origin</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
