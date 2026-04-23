import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Heart, Pill, FileText, FlaskConical, Share2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/app", label: "Overview", icon: Heart, end: true },
  { to: "/app/medicines", label: "Medicines", icon: Pill },
  { to: "/app/prescriptions", label: "Prescriptions", icon: FileText },
  { to: "/app/lab-reports", label: "Lab reports", icon: FlaskConical },
  { to: "/app/shares", label: "Shares", icon: Share2 },
];

const AppShell = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-warm">
      <div className="absolute inset-0 bg-sun pointer-events-none -z-0" />
      <header className="relative border-b border-border/60 bg-background/70 backdrop-blur-md sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/app" className="flex items-center gap-2">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-primary-gradient">
              <Heart className="h-3.5 w-3.5 text-primary-foreground" fill="currentColor" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">cura</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container relative grid lg:grid-cols-[240px_1fr] gap-8 py-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
