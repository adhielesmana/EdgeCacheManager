import { useGetStats } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes, formatNumber } from "@/lib/utils";
import { Globe, HardDrive, Activity, Zap, Server } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

// Generate mock timeseries data since API only gives totals
const generateMockTraffic = (totalBytes: number) => {
  const data = [];
  let current = totalBytes / 24; 
  for (let i = 24; i >= 0; i--) {
    const variance = (Math.random() - 0.5) * 0.4;
    current = Math.abs(current + (current * variance));
    data.push({
      time: `${i}h ago`,
      bandwidth: current,
    });
  }
  return data;
};

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Activity className="h-8 w-8 text-primary animate-spin" /></div>;
  }

  if (!stats) return null;

  const mockTraffic = generateMockTraffic(stats.totalBandwidth || 1000000000);

  const metrics = [
    { title: "Total Domains", value: formatNumber(stats.totalDomains), icon: Globe, color: "text-blue-400" },
    { title: "Active Origins", value: formatNumber(stats.activeOrigins), icon: Server, color: "text-emerald-400" },
    { title: "Cache Hit Rate", value: `${(stats.cacheHitRate * 100).toFixed(1)}%`, icon: Zap, color: "text-amber-400" },
    { title: "Bandwidth Served", value: formatBytes(stats.totalBandwidth), icon: HardDrive, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your edge network performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:border-primary/30 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold font-mono">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/5 ${metric.color}`}>
                    <metric.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-semibold">Bandwidth Usage (24h)</h3>
          </div>
          <CardContent className="p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTraffic} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => formatBytes(val, 0)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatBytes(value), 'Bandwidth']}
                />
                <Area type="monotone" dataKey="bandwidth" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorBandwidth)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
