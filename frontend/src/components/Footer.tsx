import { TrendingUp } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/40 bg-card/30">
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-2">
        {/* Brand */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold">AI <span className="text-primary">PredictX</span></span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Smart AI-powered stock market predictions and analysis platform.
          </p>
        </div>

        {/* Company */}
        {/* <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["About Us", "Careers", "Press", "Blog"].map((item) => (
              <li key={item}><a href="#" className="hover:text-foreground transition-colors">{item}</a></li>
            ))}
          </ul>
        </div> */}

        {/* Legal */}
        {/* <div>
          <h4 className="mb-3 text-sm font-semibold">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["Privacy Policy", "Terms & Conditions", "Cookie Policy", "Disclaimer"].map((item) => (
              <li key={item}><a href="#" className="hover:text-foreground transition-colors">{item}</a></li>
            ))}
          </ul>
        </div> */}

        {/* Contact */}
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>tejaspatil9284@gmail.com</li>
            <li>+91 7709288629</li>
            <li className="flex gap-3 pt-2">
              {["LinkedIn", "GitHub"].map((s) => (
                <a key={s} href="#" className="hover:text-primary transition-colors">{s}</a>
              ))}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
         {new Date().getFullYear()} AI PredictX TD3 ML model. Not financial advice.
      </div>
    </div>
  </footer>
);

export default Footer;
