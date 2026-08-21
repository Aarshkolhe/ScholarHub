import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ThemeToggle from "../components/dashboard/ThemeToggle";

const SAVED_NAME_KEY = "scholarhub_saved_landing_name";

export default function LandingPage() {
  const { user, isAuthenticated, signOut, updateUser } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const heroRef = useRef(null);

  // Initialize input state from user profile or saved local storage name
  const [userName, setUserName] = useState(() => {
    return user?.fullName || user?.name || localStorage.getItem(SAVED_NAME_KEY) || "";
  });

  // Synchronize when user session updates
  useEffect(() => {
    const existingName = user?.fullName || user?.name || localStorage.getItem(SAVED_NAME_KEY);
    if (existingName) {
      setUserName(existingName);
    }
  }, [user]);

  const isNameSaved = Boolean(userName.trim());

  const handleNameChange = (e) => {
    const val = e.target.value;
    setUserName(val);
    if (val.trim()) {
      localStorage.setItem(SAVED_NAME_KEY, val.trim());
      updateUser({ name: val.trim(), fullName: val.trim() });
    }
  };

  // Particle Canvas Interactive Physics Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;

    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.max(window.devicePixelRatio || 1, 1);
    let particles = [];
    let animationFrameId;
    const mouse = { x: -9999, y: -9999, active: false };

    const PARTICLE_DENSITY = 9000;
    const REPEL_RADIUS = 140;
    const REPEL_STRENGTH = 2600;
    const SPRING = 0.02;
    const DAMPING = 0.9;

    function resize() {
      if (!hero || !canvas) return;
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function buildParticles() {
      const count = Math.max(24, Math.floor((width * height) / PARTICLE_DENSITY));
      const prev = particles;
      particles = [];
      for (let i = 0; i < count; i++) {
        const baseX = Math.random() * width;
        const baseY = Math.random() * height;
        const prior = prev[i];
        particles.push({
          baseX,
          baseY,
          x: prior ? prior.x : baseX,
          y: prior ? prior.y : baseY,
          vx: prior ? prior.vx : 0,
          vy: prior ? prior.vy : 0,
          r: 1.4 + Math.random() * 2.2,
          drift: Math.random() * Math.PI * 2,
          driftSpeed: 0.15 + Math.random() * 0.25,
          alpha: 0.25 + Math.random() * 0.35,
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.drift += 0.006 * p.driftSpeed * 16;
        const floatX = Math.cos(p.drift) * 6;
        const floatY = Math.sin(p.drift * 1.3) * 6;
        const targetX = p.baseX + floatX;
        const targetY = p.baseY + floatY;

        p.vx += (targetX - p.x) * SPRING;
        p.vy += (targetY - p.y) * SPRING;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq) || 0.001;
          if (dist < REPEL_RADIUS) {
            const force = ((1 - dist / REPEL_RADIUS) * REPEL_STRENGTH) / distSq;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx * 0.016 * 16;
        p.y += p.vy * 0.016 * 16;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 74, 198, ${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(step);
    }

    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    };

    window.addEventListener("resize", handleResize);
    resize();

    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(step);
    }

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmedName = userName.trim();
    if (trimmedName) {
      localStorage.setItem(SAVED_NAME_KEY, trimmedName);
      updateUser({ name: trimmedName, fullName: trimmedName });
    }
    const queryParam = trimmedName ? `?q=${encodeURIComponent(trimmedName)}` : "";
    navigate(`/dashboard${queryParam}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="bg-[#f7f9fb] dark:bg-slate-950 text-[#191c1e] dark:text-slate-100 font-sans antialiased min-h-screen selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Header Bar */}
      <header className="w-full top-0 sticky z-50 bg-[#f7f9fb]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-[#c3c6d7] dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center h-16 max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-8">
            <Link className="text-xl text-[#004ac6] dark:text-blue-400 flex items-center font-bold font-display" to="/landing">
              <span className="material-symbols-outlined mr-2 text-[#004ac6] dark:text-blue-400 text-2xl">school</span>
              ScholarHub
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <Link
              to="/dashboard"
              className="text-[#004ac6] dark:text-blue-400 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#e6e8ea] dark:hover:bg-slate-800 transition-colors"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[#565e74] dark:text-slate-400 font-medium text-sm hover:text-[#004ac6] dark:hover:text-blue-400 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-8">
        {/* Hero Section */}
        <section
          id="heroSection"
          ref={heroRef}
          className="relative rounded-3xl overflow-hidden mt-4 mb-24 flex items-center justify-center p-8 bg-white dark:bg-slate-900 border border-[#c3c6d7] dark:border-slate-800 shadow-sm min-h-[560px] h-[calc(100vh-4rem)] transition-colors"
        >
          <div className="absolute inset-0 z-0">
            <canvas ref={canvasRef} className="w-full h-full absolute inset-0 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 dark:from-slate-900/40 via-transparent to-white dark:to-slate-900 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center pointer-events-none">
            <div className="pointer-events-auto inline-block w-full">
              <span className="inline-block py-1.5 px-4 rounded-full bg-[#dae2fd] dark:bg-blue-950/80 text-[#004ac6] dark:text-blue-300 font-bold text-[11px] tracking-wider mb-6 border border-[#b4c5ff] dark:border-blue-800 shadow-sm uppercase">
                EMPOWERING STUDENTS GLOBALLY
              </span>
              <h1 className="font-extrabold text-[36px] leading-[44px] sm:text-[56px] sm:leading-[64px] text-[#191c1e] dark:text-white mb-6 tracking-tight">
                Unlock Your Academic Future
              </h1>
              <p className="text-[16px] leading-[26px] sm:text-[18px] sm:leading-[28px] text-[#434655] dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                Discover and apply for scholarships tailored to your unique profile. Our intelligent matching system makes funding your education simpler than ever.
              </p>

              {/* Saved User Name Form with Green Tick */}
              <div className="max-w-2xl mx-auto">
                <form
                  onSubmit={handleNameSubmit}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-lg relative z-20"
                >
                  <div className="relative flex-grow">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] dark:text-slate-400">
                      person
                    </span>
                    <input
                      name="name"
                      value={userName}
                      onChange={handleNameChange}
                      className={`w-full pl-12 ${
                        isNameSaved ? "pr-12" : "pr-4"
                      } py-3.5 rounded-xl border border-[#c3c6d7] dark:border-slate-700 focus:border-[#004ac6] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#004ac6]/20 bg-white dark:bg-slate-800 text-[#191c1e] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm transition-all h-full min-h-[48px] outline-none`}
                      placeholder="Enter your name..."
                      type="text"
                    />
                    {isNameSaved && (
                      <span
                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xl animate-fade-in"
                        title="Name already saved"
                      >
                        check_circle
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-[#004ac6] dark:bg-blue-600 text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#003ea8] dark:hover:bg-blue-700 transition-all shadow-md flex items-center justify-center whitespace-nowrap min-h-[48px]"
                  >
                    Go to Dashboard
                  </button>
                </form>

                {isNameSaved && (
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                    <span className="material-symbols-outlined text-base text-emerald-500">check_circle</span>
                    Name saved! Click "Go to Dashboard" to proceed.
                  </div>
                )}
              </div>

              {/* Cleaned Trust Badges */}
              <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-[#434655] dark:text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400 text-[18px]">check_circle</span>
                  Free to Use
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400 text-[18px]">check_circle</span>
                  Smart Matching AI
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="mb-32" id="find-scholarships">
          <div className="text-center mb-12">
            <h2 className="text-[28px] sm:text-2xl font-bold text-[#191c1e] dark:text-white mb-3">Why Choose ScholarHub?</h2>
            <p className="text-sm text-[#434655] dark:text-slate-300 max-w-2xl mx-auto">
              Two things stand between students and the funding they deserve: finding the right opportunity, and knowing it's actually the right fit. We built ScholarHub to solve both.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-[#c3c6d7] dark:border-slate-800 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#dae2fd] dark:bg-blue-950/80 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400 text-2xl">manage_search</span>
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] dark:text-white mb-2">Smart Search</h3>
              <p className="text-sm text-[#434655] dark:text-slate-300 flex-grow leading-relaxed">
                Filter by major, degree level, region, and eligibility in seconds. Our search understands context, not just keywords, so you find scholarships that actually apply to you.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[#c3c6d7] dark:border-slate-800 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#007d55] dark:bg-emerald-950/80 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#bdffdb] dark:text-emerald-400 text-2xl">recommend</span>
              </div>
              <h3 className="text-lg font-semibold text-[#191c1e] dark:text-white mb-2">Personalized Matches</h3>
              <p className="text-sm text-[#434655] dark:text-slate-300 flex-grow leading-relaxed">
                Build a profile once and let our matching engine surface scholarships ranked by fit, deadline, and award value, so you spend time applying, not searching.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#c3c6d7] dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-[#434655] dark:text-slate-400">© 2026 ScholarHub. All rights reserved.</span>
          <div className="flex items-center gap-2 text-[#004ac6] dark:text-blue-400 text-xl font-bold font-display">
            <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400">school</span>
            ScholarHub
          </div>
        </div>
      </footer>
    </div>
  );
}
