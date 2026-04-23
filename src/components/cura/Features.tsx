import { motion } from "framer-motion";
import { Video, MessageCircleHeart, ClipboardList, Pill, Sparkles, Users } from "lucide-react";

const features = [
  { icon: Video, title: "Video visits", text: "Talk with a clinician in minutes, not weeks. Same-day slots, every day." },
  { icon: MessageCircleHeart, title: "Always-on chat", text: "Message your care team between visits — no awkward phone trees." },
  { icon: ClipboardList, title: "Living care plans", text: "Plans that evolve with you, written in plain language you can act on." },
  { icon: Pill, title: "Refills made easy", text: "Prescriptions sent to your pharmacy or shipped, free of charge." },
  { icon: Sparkles, title: "Whole-person care", text: "Mind, body, sleep, hormones — we treat the whole picture." },
  { icon: Users, title: "Family accounts", text: "Manage care for kids and aging parents in one gentle place." },
];

const Features = () => {
  return (
    <section id="care" className="py-28 relative">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <span className="text-sm uppercase tracking-[0.2em] text-secondary font-medium">What we do</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-medium tracking-tight text-balance">
            A softer kind of healthcare,
            <br />
            built around <em className="text-primary not-italic">you</em>.
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
