import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, FileText, FlaskConical, Share2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Overview = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ meds: 0, rx: 0, labs: 0, shares: 0 });
  const [name, setName] = useState("");

  useEffect(() => {
    document.title = "Your records — Cura";
    if (!user) return;
    (async () => {
      const [m, r, l, s, p] = await Promise.all([
        supabase.from("medicines").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("prescriptions").select("id", { count: "exact", head: true }),
        supabase.from("lab_reports").select("id", { count: "exact", head: true }),
        supabase.from("shares").select("id", { count: "exact", head: true }).eq("revoked", false),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      ]);
      setCounts({ meds: m.count ?? 0, rx: r.count ?? 0, labs: l.count ?? 0, shares: s.count ?? 0 });
      setName(p.data?.full_name ?? "");
    })();
  }, [user]);

  const tiles = [
    { to: "/app/medicines", label: "Active medicines", value: counts.meds, icon: Pill },
    { to: "/app/prescriptions", label: "Prescriptions", value: counts.rx, icon: FileText },
    { to: "/app/lab-reports", label: "Lab reports", value: counts.labs, icon: FlaskConical },
    { to: "/app/shares", label: "Active shares", value: counts.shares, icon: Share2 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">Overview</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium tracking-tight">
          Hello{name ? `, ${name.split(" ")[0]}` : ""}.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Your private medical vault. Add your medicines, prescriptions, and reports — share a scoped link
          when a doctor or pharmacist needs to see them.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group p-6 rounded-3xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-soft transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/10 grid place-items-center mb-4">
              <t.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-display">{t.value}</div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              {t.label}
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      <div className="p-8 rounded-3xl bg-primary-gradient text-primary-foreground">
        <h2 className="font-display text-2xl mb-2">Need to share with a doctor?</h2>
        <p className="opacity-90 mb-5 max-w-lg">
          Generate a private link that shows only your medicines and prescriptions — and expires when you say so.
        </p>
        <Link
          to="/app/shares"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-background text-foreground text-sm font-medium hover:bg-background/90 transition-colors"
        >
          Create a share link <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default Overview;
