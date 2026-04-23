import { motion } from "framer-motion";
import { Pill, FileText, Share2, ShieldCheck, Clock, Lock } from "lucide-react";

const features = [
  { icon: Pill, title: "Medicine track record", text: "Log every medicine — past and present. Dosage, frequency, dates. Always at your fingertips." },
  { icon: FileText, title: "Prescriptions & reports", text: "Snap a photo or upload PDFs. Your full history lives in one private place." },
  { icon: Share2, title: "Scoped share links", text: "Generate a private link for a doctor or pharmacist. Choose what they see — meds, prescriptions, or both." },
  { icon: Clock, title: "Expiring access", text: "Every link auto-expires. Revoke anytime with one click. Recipients can never edit anything." },
  { icon: Lock, title: "Lab reports stay private", text: "Lab results are kept just for you — they're never included in share links." },
  { icon: ShieldCheck, title: "Yours, always", text: "Your records belong to you. End-to-end access controls, encrypted storage, no ads." },
];

const Features = () => {
  return (
    <section id="care" className="py-28 relative">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">What Cura does</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-medium tracking-tight text-balance">
            Your medical history,
            <br />
            organised the way <em className="text-primary not-italic">you</em> want.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative p-8 rounded-3xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-soft transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 grid place-items-center mb-5 group-hover:bg-primary/15 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
