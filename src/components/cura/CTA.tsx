import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[2.5rem] overflow-hidden bg-primary-gradient p-12 md:p-20 text-center shadow-warm"
        >
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-background/20 blur-3xl" />

          <div className="relative max-w-2xl mx-auto text-primary-foreground">
            <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-balance">
              Take back control of your records.
            </h2>
            <p className="mt-6 text-lg opacity-90 leading-relaxed">
              Cura is free to start. No card, no commitments — just your own private medical vault,
              ready whenever you need to share with a doctor.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="cream" size="xl" className="group">
                <Link to="/auth">
                  Create your vault
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outlineCream" size="xl">
                <a href="#how">See how it works</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
