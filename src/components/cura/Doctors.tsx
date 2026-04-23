import { motion } from "framer-motion";
import { Star } from "lucide-react";
import d1 from "@/assets/doctor-1.jpg";
import d2 from "@/assets/doctor-2.jpg";
import d3 from "@/assets/doctor-3.jpg";

const doctors = [
  { img: d1, name: "Dr. Anika Rao", spec: "Internal Medicine", rating: 4.9, blurb: "Calm, thorough, and a great listener — Anika treats sleep, hormones, and everyday primary care." },
  { img: d2, name: "Dr. Marcus Hale", spec: "Family Medicine", rating: 4.9, blurb: "From toddlers to grandparents, Marcus takes care of the whole family with warmth and patience." },
  { img: d3, name: "Dr. Mei Chen", spec: "Mental Health", rating: 5.0, blurb: "Mei brings a gentle, evidence-based approach to anxiety, burnout, and life's harder seasons." },
];

const Doctors = () => {
  return (
    <section id="doctors" className="py-28">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">Your care team</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-medium tracking-tight text-balance">
              Real doctors. <em className="text-primary not-italic">Really listening.</em>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            Every Cura clinician is board-certified and trained in our gentle,
            evidence-based approach to whole-person care.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {doctors.map((d, i) => (
            <motion.article
              key={d.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-3xl overflow-hidden bg-card border border-border/60 hover:shadow-warm transition-all duration-500"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={d.img}
                  alt={`Portrait of ${d.name}`}
                  loading="lazy"
                  width={640}
                  height={768}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-xl">{d.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    {d.rating}
                  </div>
                </div>
                <div className="text-sm text-secondary mb-3">{d.spec}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.blurb}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Doctors;
