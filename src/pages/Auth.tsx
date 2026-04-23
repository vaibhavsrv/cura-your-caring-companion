import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(255);
const passwordSchema = z.string().min(8, { message: "At least 8 characters" }).max(72);
const nameSchema = z.string().trim().min(1, { message: "Name required" }).max(100);

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Sign in — Cura";
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else navigate("/app");
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get("full_name"));
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    try {
      nameSchema.parse(full_name);
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name },
      },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Welcome to Cura. Check your email to confirm.");
      navigate("/app");
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <main className="min-h-screen bg-warm grid place-items-center px-4 py-12">
      <div className="absolute inset-0 bg-sun pointer-events-none -z-0" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8 group">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-gradient shadow-soft">
            <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">cura</span>
        </Link>

        <div className="bg-card border border-border/60 rounded-3xl p-8 shadow-soft">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-password">Password</Label>
                  <Input id="si-password" name="password" type="password" required />
                </div>
                <Button type="submit" variant="warm" className="w-full" disabled={busy}>
                  {busy ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" name="full_name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password">Password</Label>
                  <Input id="su-password" name="password" type="password" required minLength={8} />
                </div>
                <Button type="submit" variant="warm" className="w-full" disabled={busy}>
                  {busy ? "Creating..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button type="button" variant="ghostWarm" className="w-full" onClick={handleGoogle}>
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </p>
      </div>
    </main>
  );
};

export default Auth;
