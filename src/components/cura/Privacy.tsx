import { Lock, ShieldCheck, Eye, Ban } from "lucide-react";
import { motion } from "framer-motion";

const points = [
  { icon: Lock, title: "Your vault is yours", text: "Records are stored encrypted. Only you can read them — not even our team can peek." },
  { icon: Eye, title: "Scoped sharing", text: "Each share link shows only what you toggled on. Lab reports never travel through links." },
  { icon: ShieldCheck, title: "Time-bound access", text: "Every link auto-expires. You set the duration — minutes, days, or weeks." },
  { icon: Ban, title: "Revoke any time", text: "Change your mind? One click kills the link. Recipient sees a 'no longer available' notice." },
];

const Privacy = () => {
  return (
    <section id="privacy" className="py-28 bg-card/40">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">Privacy by design</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-medium tracking-tight text-balance">
            Built so <em className="text-primary not-italic">you</em> stay in control.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.06 }}
              className="p-8 rounded-3xl bg-background border border-border/60 flex gap-5"
            >
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-secondary/15 grid place-items-center">
                <p.icon className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-display text-xl mb-2">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Privacy;
