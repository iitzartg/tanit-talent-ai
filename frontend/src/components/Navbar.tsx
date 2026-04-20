import { Link, useLocation } from "react-router-dom";
import { Show, UserButton } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";
import { getStoredUser } from "@/lib/auth";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const stored = getStoredUser();
  const dashboardHref =
    stored?.role === "admin" ? "/admin" : stored?.role === "recruteur" ? "/recruiter" : "/candidate";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isLanding ? "bg-transparent" : "bg-card/80 backdrop-blur-lg border-b border-border"}`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span
            className={`font-display font-bold text-xl ${isLanding ? "text-primary-foreground" : "text-foreground"}`}
          >
            Tanit-Talent
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {isLanding && (
            <>
              <a
                href="#features"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                How It Works
              </a>
            </>
          )}
          <Link to="/jobs">
            <Button
              variant={isLanding ? "outline" : "ghost"}
              size="sm"
              className={
                isLanding
                  ? "border-primary-foreground/30 text-black hover:bg-primary-foreground/10"
                  : ""
              }
            >
              Browse Jobs
            </Button>
          </Link>
          <Show when="signed-out">
            <Link to="/auth">
              <Button variant={isLanding ? "warm" : "default"} size="sm">
                Get Started
              </Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <div className="flex items-center gap-3">
              {stored && (
                <Link to={dashboardHref}>
                  <Button variant={isLanding ? "outline" : "ghost"} size="sm" type="button">
                    Dashboard
                  </Button>
                </Link>
              )}
              <UserButton afterSignOutUrl="/auth" />
            </div>
          </Show>
        </div>

        <button type="button" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? (
            <X className={isLanding ? "text-primary-foreground" : "text-foreground"} />
          ) : (
            <Menu className={isLanding ? "text-primary-foreground" : "text-foreground"} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-3">
          <Link to="/jobs" className="block">
            <Button variant="ghost" className="w-full justify-start">
              Browse Jobs
            </Button>
          </Link>
          <Show when="signed-out">
            <Link to="/auth" className="block">
              <Button variant="default" className="w-full">
                Get Started
              </Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <div className="flex flex-col gap-2 items-stretch">
              {stored && (
                <Link to={dashboardHref} className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
              )}
              <div className="flex justify-center py-2">
                <UserButton afterSignOutUrl="/auth" />
              </div>
            </div>
          </Show>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
