import { motion } from "framer-motion";

const quotes = [
  { q: "I cried after my first visit — in a good way. I finally felt heard.", a: "Priya S.", r: "Member since 2024" },
  { q: "Booking a doctor used to feel like a part-time job. Cura made it feel like texting a friend.", a: "Daniel K.", r: "Member since 2023" },
  { q: "My care plan actually fits my life. That's a first.", a: "Lena M.", r: "Member since 2025" },
];

const Testimonials = () => {
  return (
    <section id="stories" className="py-28 bg-warm relative overflow-hidden">
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">Patient stories</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-medium tracking-tight text-balance">
            Care worth talking about.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 rounded-3xl bg-card/80 backdrop-blur border border-border/60 shadow-soft"
            >
              <div className="font-display text-5xl text-primary/40 leading-none mb-4">"</div>
              <p className="font-display text-xl leading-snug mb-6">{t.q}</p>
              <footer className="text-sm">
                <div className="font-medium">{t.a}</div>
                <div className="text-muted-foreground">{t.r}</div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
