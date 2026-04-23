import { motion } from "framer-motion";

const steps = [
  { n: "01", title: "Tell us how you feel", text: "A 2-minute intake — no jargon, no judgment. Share what's going on in your own words." },
  { n: "02", title: "Meet your clinician", text: "We match you with a doctor who fits your needs and schedule. Hop on a video call when you're ready." },
  { n: "03", title: "Get a plan, get better", text: "Leave with a clear, kind plan — prescriptions, follow-ups, and a care team in your pocket." },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-28 bg-sage relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-secondary/10 blur-3xl" />
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">How it works</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-medium tracking-tight text-balance">
            Three steps to feeling better.
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
