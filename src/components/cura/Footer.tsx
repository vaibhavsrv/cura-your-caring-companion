import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-gradient">
                <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </span>
              <span className="font-display text-2xl font-semibold">cura</span>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Thoughtful, modern healthcare that meets you where you are —
              warmly, gently, and on your schedule.
            </p>
          </div>

          <div>
            <h4 className="font-display text-base mb-4">Care</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Primary care</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Mental health</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Women's health</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Pediatrics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-base mb-4">Cura</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/60 flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Cura Health, Inc. — Made with care.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">HIPAA</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
