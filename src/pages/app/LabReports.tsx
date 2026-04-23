import { useEffect, useState } from "react";
import { Plus, FlaskConical, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface Lab {
  id: string;
  title: string;
  report_date: string | null;
  notes: string | null;
  file_path: string | null;
}

const LabReports = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Lab[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("lab_reports").select("*").order("report_date", { ascending: false, nullsFirst: false });
    if (error) toast.error(error.message);
    else setItems(data ?? []);
  };

  useEffect(() => { document.title = "Lab reports — Cura"; load(); }, []);

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;
    const title = String(fd.get("title") || "").trim();
    if (!title) return toast.error("Title required");
    if (file && file.size > 10 * 1024 * 1024) return toast.error("File too large (max 10MB)");

    setBusy(true);
    let file_path: string | null = null;
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("lab-reports").upload(path, file);
      if (upErr) { setBusy(false); return toast.error(upErr.message); }
      file_path = path;
    }
    const { error } = await supabase.from("lab_reports").insert({
      user_id: user.id,
      title,
      report_date: (fd.get("report_date") as string) || null,
      notes: String(fd.get("notes") || "").trim() || null,
      file_path,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Report added");
    setOpen(false);
    load();
  };

  const remove = async (lab: Lab) => {
    if (!confirm("Delete this report?")) return;
    if (lab.file_path) await supabase.storage.from("lab-reports").remove([lab.file_path]);
    const { error } = await supabase.from("lab_reports").delete().eq("id", lab.id);
    if (error) toast.error(error.message);
    else { toast.success("Removed"); load(); }
  };

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from("lab-reports").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">Reports</span>
          <h1 className="mt-2 font-display text-3xl md:text-4xl font-medium tracking-tight">Lab reports</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="warm"><Plus className="h-4 w-4" /> Add report</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add lab report</DialogTitle></DialogHeader>
            <form onSubmit={add} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" name="title" required maxLength={200} /></div>
              <div className="space-y-2"><Label htmlFor="report_date">Date</Label><Input id="report_date" name="report_date" type="date" /></div>
              <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={3} maxLength={1000} /></div>
              <div className="space-y-2"><Label htmlFor="file">File (PDF / image, max 10MB)</Label><Input id="file" name="file" type="file" accept="image/*,application/pdf" /></div>
              <Button type="submit" variant="warm" className="w-full" disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-sm text-muted-foreground -mt-2">
        Lab reports are kept for your own records and are <strong>never included</strong> in share links.
      </p>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-card border border-dashed border-border">
          <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No lab reports yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((l) => (
            <div key={l.id} className="p-5 rounded-2xl bg-card border border-border/60 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-display text-lg">{l.title}</span>
                  {l.report_date && <span className="text-sm text-muted-foreground">{format(new Date(l.report_date), "MMM d, yyyy")}</span>}
                </div>
                {l.notes && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{l.notes}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                {l.file_path && <Button variant="ghost" size="icon" onClick={() => download(l.file_path!)}><Download className="h-4 w-4" /></Button>}
                <Button variant="ghost" size="icon" onClick={() => remove(l)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabReports;
