import { motion } from "framer-motion";

const steps = [
  { n: "01", title: "Create your private vault", text: "Sign up in seconds. Your records stay encrypted and visible only to you." },
  { n: "02", title: "Add medicines & prescriptions", text: "Log meds with dosage and dates. Upload prescription photos and lab reports — all in one place." },
  { n: "03", title: "Share a scoped link", text: "Generate an expiring link for a doctor or pharmacist. They see only what you choose. Revoke anytime." },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-28 bg-sage relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-secondary/10 blur-3xl" />
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">How it works</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-medium tracking-tight text-balance">
            Track. Organise. Share — on your terms.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="font-display text-7xl text-primary/30 mb-4">{s.n}</div>
              <h3 className="font-display text-2xl mb-3">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
