import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";

const links = [
  { label: "How it works", href: "#how" },
  { label: "Care", href: "#care" },
  { label: "Doctors", href: "#doctors" },
  { label: "Stories", href: "#stories" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-md bg-background/70 border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-20 items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-primary-gradient shadow-soft transition-transform group-hover:scale-105">
            <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight">cura</span>
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
            Sign in
          </Button>
          <Button variant="warm" size="sm">
            Book a visit
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <div className="container py-6 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base text-foreground/80"
              >
                {l.label}
              </a>
            ))}
            <Button variant="warm" className="mt-2">Book a visit</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
