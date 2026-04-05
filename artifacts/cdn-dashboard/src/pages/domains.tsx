import * as React from "react";
import { useListDomains, useCreateDomain, useDeleteDomain } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Globe, Plus, Activity, Lock, Settings2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Domains() {
  const { data: domains, isLoading } = useListDomains();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  
  if (isLoading) {
    return <div className="flex justify-center py-20"><Activity className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Domains</h1>
          <p className="text-muted-foreground mt-1">Manage your accelerated zones.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {!domains?.length ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <Globe className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No domains configured</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">Get started by adding your first domain to the NexusCDN edge network to improve performance and security.</p>
          <Button onClick={() => setIsCreateOpen(true)}>Add your first domain</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain, i) => (
            <DomainCard key={domain.id} domain={domain} index={i} />
          ))}
        </div>
      )}

      <CreateDomainDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}

function DomainCard({ domain, index }: { domain: any, index: number }) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteDomain();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to delete ${domain.name}?`)) return;
    try {
      await deleteMutation.mutateAsync({ domainId: domain.id });
      toast.success("Domain deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete domain");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/domains/${domain.id}`} className="block h-full group">
        <Card className="h-full hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-6 relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-primary border border-white/10 group-hover:border-primary/30 transition-colors">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{domain.name}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge variant={domain.status === "active" ? "success" : domain.status === "provisioning" ? "warning" : "secondary"}>
                      {domain.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive p-2 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-between text-sm text-muted-foreground border-t border-white/5">
              <div className="flex items-center space-x-4">
                <span className="flex items-center" title="SSL Status">
                  <Lock className={cn("h-4 w-4 mr-1.5", domain.sslEnabled ? "text-emerald-400" : "text-muted-foreground")} />
                  SSL
                </span>
                <span className="flex items-center" title="Cache Configuration">
                  <Settings2 className={cn("h-4 w-4 mr-1.5", domain.cacheEnabled ? "text-primary" : "text-muted-foreground")} />
                  {domain.cacheEnabled ? `${domain.cacheTtl}s TTL` : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function CreateDomainDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const createMutation = useCreateDomain();
  
  const [name, setName] = React.useState("");
  const [ssl, setSsl] = React.useState(true);
  const [cache, setCache] = React.useState(true);
  const [ttl, setTtl] = React.useState(3600);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        data: { name, sslEnabled: ssl, cacheEnabled: cache, cacheTtl: ttl }
      });
      toast.success("Domain added successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      onOpenChange(false);
      setName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create domain");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Add New Domain</DialogTitle>
          <DialogDescription>Configure a new domain to route through the CDN.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Domain Name</label>
            <Input 
              placeholder="e.g. api.example.com" 
              value={name} 
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">SSL / TLS</label>
                <p className="text-xs text-muted-foreground">Auto-provision cert</p>
              </div>
              <input type="checkbox" checked={ssl} onChange={e => setSsl(e.target.checked)} className="h-4 w-4 accent-primary" />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Edge Cache</label>
                <p className="text-xs text-muted-foreground">Static asset caching</p>
              </div>
              <input type="checkbox" checked={cache} onChange={e => setCache(e.target.checked)} className="h-4 w-4 accent-primary" />
            </div>
          </div>

          {cache && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Cache TTL (seconds)</label>
              <Input 
                type="number" 
                value={ttl} 
                onChange={e => setTtl(Number(e.target.value))}
                min={0}
                required
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending}>Add Domain</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
