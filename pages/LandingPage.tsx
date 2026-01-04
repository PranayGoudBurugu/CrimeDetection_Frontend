import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  ScanSearch,
  BarChart3,
  FileText,
  Play,
  ChevronRight,
  Sparkles,
  Eye,
  Music,
  Footprints,
} from "lucide-react";
import heroDancer from "@/assets/hero-dancer.jpg";
import mudraHands from "@/assets/mudra-hands.jpg";
import danceFeet from "@/assets/dance-feet.jpg";
import { supabase } from "../lib/supabase";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const featuresRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      navigate("/dashboard/analysis");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Upload,
      title: "Upload Your Performance",
      description:
        "Simply upload your Bharatanatyam dance video in any format. Our AI processes high-quality footage seamlessly.",
    },
    {
      icon: ScanSearch,
      title: "AI-Powered Analysis",
      description:
        "Advanced computer vision identifies each adavu, mudra, and expression with precision timing.",
    },
    {
      icon: BarChart3,
      title: "Timeline Breakdown",
      description:
        "Get a complete timeline showing every step name, position, and transition throughout your performance.",
    },
    {
      icon: FileText,
      title: "Detailed Report",
      description:
        "Receive comprehensive feedback on technique, rhythm accuracy, and areas for improvement.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Upload",
      desc: "Share your dance video",
      icon: Upload,
    },
    {
      number: "02",
      title: "Process",
      desc: "AI analyzes every frame",
      icon: ScanSearch,
    },
    {
      number: "03",
      title: "Review",
      desc: "Get detailed step names",
      icon: Eye,
    },
    {
      number: "04",
      title: "Improve",
      desc: "Learn from insights",
      icon: Sparkles,
    },
  ];

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="w-full min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              background: `radial-gradient(circle, var(--primary) 0%, transparent 70%)`,
              opacity: 0.3 + Math.random() * 0.4,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-30 animate-pulse-slow"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            opacity: 0.15,
            transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.1}px)`,
          }}
        />
        <div
          className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20 animate-pulse-slow"
          style={{
            background:
              "radial-gradient(circle, var(--secondary) 0%, transparent 70%)",
            opacity: 0.15,
            transform: `translate(${-scrollY * 0.03}px, ${scrollY * 0.08}px)`,
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-15 animate-pulse-slow"
          style={{
            background:
              "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            opacity: 0.1,
            transform: `translateY(${-scrollY * 0.05}px)`,
            animationDelay: "4s",
          }}
        />
      </div>

      {/* Animated Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrollY > 50
            ? "bg-background/80 backdrop-blur-2xl border-b border-border"
            : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 transition-all duration-1000 cursor-pointer ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden group bg-muted p-2">
              <img
                src="/nav_logo.png"
                alt="Nritya AI Logo"
                className="w-full h-full object-contain"
                style={{ imageRendering: "crisp-edges" }}
              />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-foreground">NRITYA</span>
              <span className="text-primary ml-1">AI</span>
            </span>
          </div>

          <div
            className={`hidden md:flex items-center gap-10 transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a
              href="#about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            <button
              onClick={handleAnalyze}
              className="group relative px-5 py-2.5 rounded-full text-sm font-medium overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
            >
              <span className="relative flex items-center gap-2">
                Get Started
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
            {/* Left Content */}
            <div className="flex flex-col justify-center text-center lg:text-left z-10">
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-muted border border-border mb-8 transition-all duration-1000 self-center lg:self-start ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  AI-Powered Dance Analysis
                </span>
              </div>

              {/* Heading */}
              <h1
                className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8 transition-all duration-1000 delay-150 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <span className="block text-foreground">Master Your</span>
                <span className="block mt-2 text-primary">Bharatanatyam</span>
              </h1>

              {/* Description */}
              <p
                className={`text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed transition-all duration-1000 delay-300 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                Upload your dance video and let our AI identify every{" "}
                <span className="text-primary font-medium">adavu</span>,{" "}
                <span className="text-secondary font-medium">mudra</span>, and{" "}
                <span className="text-accent font-medium">abhinaya</span> — with
                precise timestamps and detailed analysis.
              </p>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center transition-all duration-1000 delay-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <button
                  onClick={handleAnalyze}
                  className="group relative px-8 py-4 rounded-full font-semibold text-base overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all duration-500"
                >
                  <span className="relative flex items-center gap-2.5">
                    Analyze Your Dance
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
                <button className="group px-8 py-4 rounded-full font-semibold text-base border border-border text-muted-foreground hover:border-primary hover:text-foreground hover:bg-muted transition-all duration-300 flex items-center gap-2.5">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div
              className={`flex items-center justify-center lg:justify-end transition-all duration-1000 delay-500 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="relative w-full max-w-sm lg:max-w-md my-16">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-3xl scale-90" />

                {/* Main image */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border shadow-2xl">
                  <img
                    src={heroDancer}
                    alt="Bharatanatyam dancer in traditional pose"
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                </div>

                {/* Floating accent images */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-2xl overflow-hidden border border-border shadow-xl animate-float-slow backdrop-blur-sm">
                  <img
                    src={danceFeet}
                    alt="Dance feet"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl overflow-hidden border border-border shadow-xl animate-float-slow backdrop-blur-sm"
                  style={{ animationDelay: "1s" }}
                >
                  <img
                    src={mudraHands}
                    alt="Mudra hands"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Decorative elements */}
                <div className="absolute top-1/2 -left-12 w-24 h-24 border border-primary/20 rounded-full animate-spin-slow" />
                <div
                  className="absolute top-1/4 -right-8 w-16 h-16 border border-secondary/20 rounded-full animate-spin-slow"
                  style={{ animationDirection: "reverse" }}
                />
              </div>
            </div>
          </div>

          {/* Stats - Bottom of hero */}
          <div
            className={`mt-20 transition-all duration-1000 delay-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="grid grid-cols-3 gap-8 md:gap-16 pt-8 border-t border-border">
              {[
                { value: "108+", label: "Adavus Recognized" },
                { value: "24", label: "Mudra Types" },
                { value: "99%", label: "Accuracy Rate" },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-2xl md:text-4xl font-bold text-primary group-hover:scale-105 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float-slow {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .animate-float-slow {
            animation: float-slow 3s ease-in-out infinite;
          }

          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
        `}</style>
      </section>
      {/* Features Section */}
      <section
        id="features"
        className="py-32 px-6 lg:px-8 relative"
        ref={featuresRef}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm uppercase tracking-widest text-primary mb-4">
              Features
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Powerful Analysis
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Our AI understands the nuances of Bharatanatyam like a seasoned
              guru
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`group relative p-8 rounded-2xl border transition-all duration-500 cursor-pointer ${
                    activeFeature === i
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card border-border hover:border-primary/20 hover:bg-card/80"
                  }`}
                  onMouseEnter={() => setActiveFeature(i)}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 ${
                      activeFeature === i
                        ? "bg-primary"
                        : "bg-muted group-hover:bg-accent"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 transition-colors duration-500 ${
                        activeFeature === i
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold mb-3 transition-colors duration-300 ${
                      activeFeature === i ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Active indicator line */}
                  <div
                    className={`absolute bottom-0 left-8 right-8 h-px transition-all duration-500 ${
                      activeFeature === i ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <p className="text-sm uppercase tracking-widest text-secondary mb-4">
              Process
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              From upload to insights in minutes
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-border" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative group">
                    <div className="text-center">
                      {/* Step Circle */}
                      <div className="relative mx-auto w-32 h-32 mb-8">
                        {/* Outer ring */}
                        <div className="absolute inset-0 rounded-full border border-border group-hover:border-primary/30 transition-colors duration-500" />
                        {/* Inner circle */}
                        <div className="absolute inset-3 rounded-full bg-muted group-hover:bg-primary/10 transition-all duration-500 flex items-center justify-center">
                          <div className="text-center">
                            <span className="block text-2xl font-bold text-primary">
                              {step.number}
                            </span>
                            <Icon className="w-5 h-5 mx-auto mt-1 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                          </div>
                        </div>
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-accent mb-4">
                About
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                <span className="text-foreground">Preserving Tradition</span>
                <br />
                <span className="text-primary">Through Technology</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                NRITYA AI combines the ancient wisdom of Bharatanatyam with
                cutting-edge artificial intelligence. Our technology recognizes
                the 108 karanas, various adavus, and subtle expressions that
                make this art form so profound.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                Whether you're a student perfecting your aramandi or a guru
                analyzing performances, NRITYA AI provides the insights you need
                to elevate your art.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Adavu Detection", icon: Footprints },
                  { label: "Mudra Recognition", icon: Eye },
                  { label: "Expression Analysis", icon: ScanSearch },
                  { label: "Rhythm Tracking", icon: Music },
                ].map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-all duration-300 cursor-default"
                  >
                    <tag.icon className="w-4 h-4" />
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual Element with Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-xl transform hover:scale-105 transition-transform duration-500">
                    <img
                      src={mudraHands}
                      alt="Mudra hands gesture"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">108</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Karanas
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-secondary">
                        2000+
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Years of Heritage
                      </p>
                    </div>
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-xl transform hover:scale-105 transition-transform duration-500">
                    <img
                      src={danceFeet}
                      alt="Dance feet with ghungroo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Decorative blurs */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent/15 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-20 rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-primary/10" />
            <div className="absolute inset-0 border border-border rounded-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2" />

            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="text-foreground">Ready to </span>
                <span className="text-primary">Transform</span>
                <br />
                <span className="text-foreground">Your Practice?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
                Join thousands of dancers and gurus using AI to perfect the
                timeless art of Bharatanatyam
              </p>
              <button
                onClick={handleAnalyze}
                className="group relative px-10 py-5 rounded-full font-semibold text-lg overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl transition-all duration-500"
              >
                <span className="relative flex items-center gap-3">
                  Start Analyzing Now
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted p-2">
                <img
                  src="/nav_logo.png"
                  alt="Nritya AI Logo"
                  className="w-full h-full object-contain"
                  style={{ imageRendering: "crisp-edges" }}
                />
              </div>
              <span className="text-lg font-semibold">
                <span className="text-foreground">NRITYA</span>
                <span className="text-primary ml-1">AI</span>
              </span>
            </div>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <a
                href="#"
                className="hover:text-foreground transition-colors duration-300"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors duration-300"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors duration-300"
              >
                Contact
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 NRITYA AI. Celebrating the art of Bharatanatyam.
            </p>
          </div>
        </div>
      </footer>

      {/* Global Animations */}
      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-30px) translateX(10px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-60px) translateX(-10px) scale(0.8);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-30px) translateX(20px) scale(1.1);
            opacity: 0.7;
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-float-particle {
          animation: float-particle 15s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
