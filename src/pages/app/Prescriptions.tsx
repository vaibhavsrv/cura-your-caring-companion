import { useEffect, useState } from "react";
import { Plus, FileText, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface Rx {
  id: string;
  doctor_name: string;
  issue_date: string | null;
  diagnosis: string | null;
  notes: string | null;
  file_path: string | null;
}

const Prescriptions = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Rx[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("prescriptions").select("*").order("issue_date", { ascending: false, nullsFirst: false });
    if (error) toast.error(error.message);
    else setItems(data ?? []);
  };

  useEffect(() => { document.title = "Prescriptions — Cura"; load(); }, []);

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;
    const doctor_name = String(fd.get("doctor_name") || "").trim();
    if (!doctor_name) return toast.error("Doctor name required");
    if (file && file.size > 10 * 1024 * 1024) return toast.error("File too large (max 10MB)");

    setBusy(true);
    let file_path: string | null = null;
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("prescriptions").upload(path, file);
      if (upErr) { setBusy(false); return toast.error(upErr.message); }
      file_path = path;
    }
    const { error } = await supabase.from("prescriptions").insert({
      user_id: user.id,
      doctor_name,
      issue_date: (fd.get("issue_date") as string) || null,
      diagnosis: String(fd.get("diagnosis") || "").trim() || null,
      notes: String(fd.get("notes") || "").trim() || null,
      file_path,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Prescription added");
    setOpen(false);
    load();
  };

  const remove = async (rx: Rx) => {
    if (!confirm("Delete this prescription?")) return;
    if (rx.file_path) await supabase.storage.from("prescriptions").remove([rx.file_path]);
    const { error } = await supabase.from("prescriptions").delete().eq("id", rx.id);
    if (error) toast.error(error.message);
    else { toast.success("Removed"); load(); }
  };

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from("prescriptions").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">Doctor visits</span>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-medium tracking-tight">Prescriptions</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="warm"><Plus className="h-4 w-4" /> Add prescription</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add prescription</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="doctor_name">Doctor *</Label><Input id="doctor_name" name="doctor_name" required maxLength={120} /></div>
              <div className="space-y-2"><Label htmlFor="issue_date">Date</Label><Input id="issue_date" name="issue_date" type="date" /></div>
              <div className="space-y-2"><Label htmlFor="diagnosis">Diagnosis</Label><Input id="diagnosis" name="diagnosis" maxLength={200} /></div>
              <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={3} maxLength={1000} /></div>
              <div className="space-y-2"><Label htmlFor="file">File (PDF / image, max 10MB)</Label><Input id="file" name="file" type="file" accept="image/*,application/pdf" /></div>
              <Button type="submit" variant="warm" className="w-full" disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-card border border-dashed border-border">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No prescriptions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="p-5 rounded-2xl bg-card border border-border/60 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-display text-lg">{r.doctor_name}</span>
                  {r.issue_date && <span className="text-sm text-muted-foreground">{format(new Date(r.issue_date), "MMM d, yyyy")}</span>}
                </div>
                {r.diagnosis && <div className="text-sm text-secondary mt-1">{r.diagnosis}</div>}
                {r.notes && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.notes}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                {r.file_path && <Button variant="ghost" size="icon" onClick={() => download(r.file_path!)}><Download className="h-4 w-4" /></Button>}
                <Button variant="ghost" size="icon" onClick={() => remove(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
