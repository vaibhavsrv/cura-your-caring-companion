import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, Pill, FileText, Download, ShieldCheck, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";

interface SharedData {
  patient: { full_name: string | null } | null;
  expires_at: string;
  recipient_label: string | null;
  medicines: any[] | null;
  prescriptions: any[] | null;
}

const SharedView = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Shared records — Cura";
    if (!token) return;
    (async () => {
      const { data: res, error: err } = await supabase.rpc("get_shared_records", { _token: token });
      setLoading(false);
      if (err) { setError(err.message); return; }
      const r = res as any;
      if (r?.error) {
        setError(
          r.error === "expired" ? "This share link has expired." :
          r.error === "revoked" ? "This share link was revoked by the patient." :
          "This share link is invalid."
        );
        return;
      }
      setData(r);
    })();
  }, [token]);

  const downloadFile = async (rxId: string) => {
    const { data: pathRes, error: e1 } = await supabase.rpc("get_shared_file_path", { _token: token!, _prescription_id: rxId });
    if (e1 || !pathRes) return;
    const { data: signed, error: e2 } = await supabase.storage.from("prescriptions").createSignedUrl(pathRes as string, 60);
    if (e2 || !signed) return;
    window.open(signed.signedUrl, "_blank");
  };

  if (loading) return <div className="min-h-screen grid place-items-center bg-warm text-muted-foreground">Loading shared records…</div>;

  if (error) return (
    <main className="min-h-screen bg-warm grid place-items-center px-4">
      <div className="absolute inset-0 bg-sun pointer-events-none" />
      <div className="relative max-w-md text-center bg-card rounded-3xl p-10 border border-border/60 shadow-soft">
        <div className="w-12 h-12 rounded-full bg-destructive/10 grid place-items-center mx-auto mb-4">
          <ShieldCheck className="h-5 w-5 text-destructive" />
        </div>
        <h1 className="font-display text-2xl mb-2">Link unavailable</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </main>
  );

  if (!data) return null;

  return (
    <main className="min-h-screen bg-warm">
      <div className="absolute inset-0 bg-sun pointer-events-none" />
      <header className="relative border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-primary-gradient">
              <Heart className="h-3.5 w-3.5 text-primary-foreground" fill="currentColor" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">cura</span>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Expires {formatDistanceToNow(new Date(data.expires_at), { addSuffix: true })}
          </div>
        </div>
      </header>

      <div className="container relative py-10 max-w-4xl">
        <div className="mb-10">
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">Shared medical records</span>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-medium tracking-tight">
            {data.patient?.full_name || "Patient"}
          </h1>
          {data.recipient_label && (
            <p className="mt-2 text-muted-foreground">Shared with: <span className="text-foreground">{data.recipient_label}</span></p>
          )}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/15 text-secondary-foreground text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
            Read-only · Only the patient's medicines and prescriptions are visible
          </div>
        </div>

        {data.medicines && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <Pill className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl">Medicines</h2>
            </div>
            {data.medicines.length === 0 ? (
              <p className="text-muted-foreground italic">No medicines on record.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {data.medicines.map((m: any) => (
                  <div key={m.id} className={`p-5 rounded-2xl bg-card border border-border/60 ${!m.is_active ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-display text-lg">{m.name}</div>
                      {m.is_active ? <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground">active</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">stopped</span>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{[m.dosage, m.frequency].filter(Boolean).join(" • ") || "—"}</div>
                    {(m.start_date || m.end_date) && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {m.start_date && format(new Date(m.start_date), "MMM d, yyyy")}
                        {m.end_date && ` → ${format(new Date(m.end_date), "MMM d, yyyy")}`}
                      </div>
                    )}
                    {m.notes && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{m.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {data.prescriptions && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl">Prescriptions</h2>
            </div>
            {data.prescriptions.length === 0 ? (
              <p className="text-muted-foreground italic">No prescriptions on record.</p>
            ) : (
              <div className="space-y-3">
                {data.prescriptions.map((r: any) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-card border border-border/60 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="font-display text-lg">{r.doctor_name}</span>
                        {r.issue_date && <span className="text-sm text-muted-foreground">{format(new Date(r.issue_date), "MMM d, yyyy")}</span>}
                      </div>
                      {r.diagnosis && <div className="text-sm text-secondary mt-1">{r.diagnosis}</div>}
                      {r.notes && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.notes}</p>}
                    </div>
                    {r.file_path && (
                      <Button variant="ghostWarm" size="sm" onClick={() => downloadFile(r.id)}>
                        <Download className="h-3.5 w-3.5" /> File
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="mt-16 pt-8 border-t border-border/60 text-center text-xs text-muted-foreground">
          Shared securely through Cura. Recipient cannot edit, share, or download anything beyond what's shown.
        </footer>
      </div>
    </main>
  );
};

export default SharedView;
