import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Upload,
  BarChart3,
  Users,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description:
      "TF-IDF vectorization and cosine similarity scoring automatically rank candidates against job requirements.",
  },
  {
    icon: Upload,
    title: "Smart CV Parsing",
    description:
      "Upload PDF or DOCX resumes and our NLP engine extracts skills, experience, and qualifications instantly.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time insights on job performance, candidate engagement, and conversion metrics.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "JWT authentication, role-based access control, and secure file handling.",
  },
  {
    icon: Users,
    title: "Talent Pool",
    description:
      "Build and manage your candidate database with intelligent filtering and AI scoring.",
  },
  {
    icon: Zap,
    title: "Instant Rankings",
    description:
      "Candidates are automatically scored and ranked the moment they apply, saving hours of manual screening.",
  },
];

const steps = [
  {
    num: "01",
    title: "Post a Job",
    description:
      "Recruiters create detailed job listings with requirements and descriptions.",
  },
  {
    num: "02",
    title: "Candidates Apply",
    description: "Candidates upload their CV and apply to matching positions.",
  },
  {
    num: "03",
    title: "AI Analyzes",
    description:
      "Our AI extracts CV data, computes TF-IDF vectors, and calculates compatibility scores.",
  },
  {
    num: "04",
    title: "Ranked Results",
    description:
      "Recruiters see candidates ranked by AI score, making hiring decisions faster.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 to-foreground/80" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-secondary/20 text-secondary border-secondary/30 backdrop-blur-sm px-4 py-1.5">
            <Sparkles className="w-3 h-3 mr-1" /> AI-Powered Recruitment
          </Badge>
          <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-primary-foreground max-w-4xl mx-auto leading-tight">
            Find the Perfect
            <span className="block text-secondary"> Talent Match</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto">
            Tanit-Talent uses advanced AI to analyze CVs, rank candidates, and
            connect the right people with the right opportunities across
            Tunisia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/auth">
              <Button variant="warm" size="xl" className="gap-2">
                Start Hiring <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 text-black hover:bg-primary-foreground/10"
              >
                Browse Jobs
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-primary-foreground/50 text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" /> 2,800+ Candidates
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" /> 150+ Companies
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" /> 94% Match Rate
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              Intelligent Recruitment,{" "}
              <span className="text-primary">Simplified</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From CV parsing to candidate ranking, every step is powered by AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card
                key={f.title}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Process
            </Badge>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="text-5xl font-display font-bold text-primary/20 mb-4">
                  {s.num}
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary-foreground mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-primary-foreground/70 max-w-lg mx-auto mb-10">
            Join hundreds of companies using AI to find their next great hire.
          </p>
          <Link to="/auth">
            <Button variant="warm" size="xl" className="gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
