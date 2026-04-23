import { useEffect, useState } from "react";
import { Plus, Pill, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface Medicine {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
}

const Medicines = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Medicine[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("medicines")
      .select("*")
      .order("is_active", { ascending: false })
      .order("start_date", { ascending: false, nullsFirst: false });
    if (error) toast.error(error.message);
    else setItems(data ?? []);
  };

  useEffect(() => {
    document.title = "Medicines — Cura";
    load();
  }, []);

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const payload = {
      user_id: user.id,
      name: String(fd.get("name") || "").trim(),
      dosage: String(fd.get("dosage") || "").trim() || null,
      frequency: String(fd.get("frequency") || "").trim() || null,
      start_date: (fd.get("start_date") as string) || null,
      end_date: (fd.get("end_date") as string) || null,
      notes: String(fd.get("notes") || "").trim() || null,
    };
    if (!payload.name) return toast.error("Name is required");
    setBusy(true);
    const { error } = await supabase.from("medicines").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Medicine added");
    setOpen(false);
    load();
  };

  const toggleActive = async (m: Medicine) => {
    const { error } = await supabase.from("medicines").update({ is_active: !m.is_active }).eq("id", m.id);
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this medicine?")) return;
    const { error } = await supabase.from("medicines").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Removed"); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">Your meds</span>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-medium tracking-tight">Medicines</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="warm"><Plus className="h-4 w-4" /> Add medicine</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add medicine</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Name *</Label><Input id="name" name="name" required maxLength={120} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label htmlFor="dosage">Dosage</Label><Input id="dosage" name="dosage" placeholder="500 mg" maxLength={60} /></div>
                <div className="space-y-2"><Label htmlFor="frequency">Frequency</Label><Input id="frequency" name="frequency" placeholder="Twice daily" maxLength={60} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label htmlFor="start_date">Start date</Label><Input id="start_date" name="start_date" type="date" /></div>
                <div className="space-y-2"><Label htmlFor="end_date">End date</Label><Input id="end_date" name="end_date" type="date" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={3} maxLength={1000} /></div>
              <Button type="submit" variant="warm" className="w-full" disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-card border border-dashed border-border">
          <Pill className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No medicines yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((m) => (
            <div key={m.id} className={`p-5 rounded-2xl bg-card border ${m.is_active ? "border-border/60" : "border-border/40 opacity-60"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display text-lg truncate">{m.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {[m.dosage, m.frequency].filter(Boolean).join(" • ") || "—"}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleActive(m)} title={m.is_active ? "Mark stopped" : "Mark active"}>
                    <Power className={`h-4 w-4 ${m.is_active ? "text-secondary" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
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
    </div>
  );
};

export default Medicines;
