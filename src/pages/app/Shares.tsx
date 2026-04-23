import { useEffect, useState } from "react";
import { Plus, Share2, Trash2, Copy, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface Share {
  id: string;
  token: string;
  recipient_label: string | null;
  include_medicines: boolean;
  include_prescriptions: boolean;
  expires_at: string;
  revoked: boolean;
  view_count: number;
  created_at: string;
}

const Shares = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Share[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [includeRx, setIncludeRx] = useState(true);

  const load = async () => {
    const { data, error } = await supabase.from("shares").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data ?? []);
  };

  useEffect(() => { document.title = "Shares — Cura"; load(); }, []);

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!includeMeds && !includeRx) return toast.error("Select at least one record type");
    const fd = new FormData(e.currentTarget);
    const days = parseInt(String(fd.get("days") || "7"), 10);
    const expires_at = new Date(Date.now() + days * 86400000).toISOString();
    setBusy(true);
    const { error } = await supabase.from("shares").insert({
      user_id: user.id,
      recipient_label: String(fd.get("recipient_label") || "").trim() || null,
      include_medicines: includeMeds,
      include_prescriptions: includeRx,
      expires_at,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Share link created");
    setOpen(false);
    load();
  };

  const linkFor = (token: string) => `${window.location.origin}/s/${token}`;

  const copy = async (token: string) => {
    await navigator.clipboard.writeText(linkFor(token));
    toast.success("Link copied");
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this share? It can no longer be viewed.")) return;
    const { error } = await supabase.from("shares").update({ revoked: true }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Revoked"); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this share permanently?")) return;
    const { error } = await supabase.from("shares").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">Privacy-first</span>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-medium tracking-tight">Share links</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Create a private link to share only your medicines and prescriptions with a doctor or pharmacist. Revoke any time.
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) { setIncludeMeds(true); setIncludeRx(true); } }}>
          <DialogTrigger asChild><Button variant="warm"><Plus className="h-4 w-4" /> New share link</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create share link</DialogTitle></DialogHeader>
            <form onSubmit={create} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_label">Recipient label (optional)</Label>
                <Input id="recipient_label" name="recipient_label" placeholder="Dr. Sharma / Apollo Pharmacy" maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="days">Expires in (days)</Label>
                <Input id="days" name="days" type="number" min={1} max={90} defaultValue={7} required />
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <div><div className="font-medium text-sm">Medicines</div><div className="text-xs text-muted-foreground">All meds (active + past)</div></div>
                  <Switch checked={includeMeds} onCheckedChange={setIncludeMeds} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <div><div className="font-medium text-sm">Prescriptions</div><div className="text-xs text-muted-foreground">Doctor, diagnosis, files</div></div>
                  <Switch checked={includeRx} onCheckedChange={setIncludeRx} />
                </div>
                <p className="text-xs text-muted-foreground">Lab reports are never shared via links.</p>
              </div>
              <Button type="submit" variant="warm" className="w-full" disabled={busy}>{busy ? "Creating..." : "Create link"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-card border border-dashed border-border">
          <Share2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No share links yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => {
            const expired = new Date(s.expires_at) < new Date();
            const status = s.revoked ? "revoked" : expired ? "expired" : "active";
            return (
              <div key={s.id} className="p-5 rounded-2xl bg-card border border-border/60">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display text-lg">{s.recipient_label || "Unnamed share"}</span>
                      <Badge variant={status === "active" ? "default" : "secondary"} className={status === "active" ? "bg-secondary/20 text-secondary-foreground" : ""}>
                        {status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 flex gap-3 flex-wrap">
                      <span>Includes: {[s.include_medicines && "medicines", s.include_prescriptions && "prescriptions"].filter(Boolean).join(", ")}</span>
                      <span>•</span>
                      <span>{expired ? "Expired" : `Expires in ${formatDistanceToNow(new Date(s.expires_at))}`}</span>
                      <span>•</span>
                      <span>{s.view_count} view{s.view_count === 1 ? "" : "s"}</span>
                    </div>
                    {status === "active" && (
                      <div className="mt-3 flex items-center gap-2">
                        <code className="text-xs bg-muted px-3 py-1.5 rounded-lg truncate max-w-md">{linkFor(s.token)}</code>
                        <Button variant="ghost" size="sm" onClick={() => copy(s.token)}><Copy className="h-3.5 w-3.5" /> Copy</Button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!s.revoked && !expired && <Button variant="ghost" size="icon" onClick={() => revoke(s.id)} title="Revoke"><Ban className="h-4 w-4" /></Button>}
                    <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Shares;
