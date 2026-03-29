import * as React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { 
  Activity, 
  Globe, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAdminOrSuper = user?.role === "admin" || user?.role === "superadmin";
  const isSuperadmin = user?.role === "superadmin";

  const navigation = [
    { name: "Dashboard", href: "/", icon: Activity },
    { name: "Domains", href: "/domains", icon: Globe },
    ...(isSuperadmin ? [{ name: "Users", href: "/users", icon: Users }] : []),
  ];

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-white/5 bg-card/30 backdrop-blur-xl md:flex">
        <div className="flex h-20 items-center px-8 border-b border-white/5">
          <Server className="h-6 w-6 text-primary mr-3" />
          <span className="text-xl font-display font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            NexusCDN
          </span>
        </div>
        
        <nav className="flex-1 space-y-2 px-4 py-8">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href} className="block">
                <div
                  className={cn(
                    "group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.name}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute left-0 h-8 w-1 rounded-r-full bg-primary" 
                      initial={false}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium text-white">{user?.username}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl z-40 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Server className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-display font-bold text-white">NexusCDN</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-xl z-30 p-4">
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <div className={cn(
                  "flex items-center rounded-xl px-4 py-4 text-base font-medium",
                  location === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            ))}
            <button onClick={logout} className="w-full flex items-center rounded-xl px-4 py-4 text-base font-medium text-destructive mt-8">
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl p-4 sm:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
