import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "@/assets/cura-hero.jpg";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-warm">
      <div className="absolute inset-0 bg-sun pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 -left-32 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />

      <div className="container relative grid lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 space-y-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/60 backdrop-blur border border-border/60 text-xs font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Your medical record. Your control.
          </span>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-tight text-balance">
            Your meds. Your records.{" "}
            <span className="italic text-primary">Your call</span>
            <br />
            on who sees them.
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Cura is your private medical vault. Track every medicine and prescription, then share
            a scoped, expiring link with any doctor or pharmacist — only what you choose, nothing more.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="warm" size="xl" className="group">
              <Link to="/auth">
                Start your vault
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="ghostWarm" size="xl">
              <a href="#how">See how it works</a>
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              Encrypted storage
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-secondary" />
              You hold the keys
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 relative"
        >
          <div className="relative rounded-[2rem] overflow-hidden shadow-warm">
            <img
              src={heroImg}
              alt="A calming home setting with a tablet showing a Cura video consultation"
              width={1024}
              height={1024}
              className="w-full h-auto"
            />
          </div>

          {/* floating badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:flex absolute -left-6 top-12 bg-background/90 backdrop-blur rounded-2xl px-5 py-4 shadow-soft border border-border/60 items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-secondary/20 grid place-items-center">
              <Heart />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Share link</div>
              <div className="font-display text-lg">expires in 24h</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:flex absolute -right-4 bottom-10 bg-background/90 backdrop-blur rounded-2xl px-5 py-4 shadow-soft border border-border/60 items-center gap-3"
          >
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-primary/30 border-2 border-background" />
              <div className="w-7 h-7 rounded-full bg-secondary/40 border-2 border-background" />
              <div className="w-7 h-7 rounded-full bg-accent/40 border-2 border-background" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Trusted by</div>
              <div className="font-display text-lg">patients & docs</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Heart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default Hero;
