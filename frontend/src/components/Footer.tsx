import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground/80 py-16">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-primary-foreground">Tanit-Talent</span>
          </Link>
          <p className="text-sm text-primary-foreground/60 max-w-sm">
            AI-powered recruitment platform connecting talent with opportunity across Tunisia and beyond.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-primary-foreground mb-4">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/jobs" className="hover:text-primary-foreground transition-colors">Browse Jobs</Link></li>
            <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">For Candidates</Link></li>
            <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">For Recruiters</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-primary-foreground mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-primary-foreground transition-colors cursor-pointer">About</span></li>
            <li><span className="hover:text-primary-foreground transition-colors cursor-pointer">Privacy</span></li>
            <li><span className="hover:text-primary-foreground transition-colors cursor-pointer">Terms</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 text-center text-sm text-primary-foreground/40">
        © {new Date().getFullYear()} Tanit-Talent AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
