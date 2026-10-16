import { useEffect, useMemo, useState } from "react";

const heroImages = [
  "https://img.collegepravesh.com/2023/03/IIIT-Sri-City.jpg",
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80",
];

function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    heroImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      top: `${(index * 29) % 100}%`,
      size: `${(index % 4) + 2}px`,
      delay: `${(index % 6) * 0.8}s`,
      duration: `${4 + (index % 4)}s`,
      opacity: 0.15 + (index % 5) * 0.08,
    }));
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero" id="hero">
      <div
        className="hero-bg-slider"
        id="hero-bg-slider"
        style={{
          backgroundImage: `url(${heroImages[currentImage]})`,
        }}
      />

      <div className="hero-overlay" />

      <div className="particles" id="particles">
        {particles.map((p) => (
          <div
            className="particle"
            key={p.id}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <span>🎓</span>
          <span>Trusted by 500+ Colleges Nationwide</span>
        </div>

        <h1>
          <span className="hero-line">Empowering</span>
          <span className="hero-line gradient-text">Campus Placements</span>
          <span className="hero-line">with Transparency</span>
        </h1>

        <p className="hero-subtitle">
          A centralized, structured platform connecting students, recruiters, alumni, 
          and placement officers — replacing spreadsheets and emails with clarity.
        </p>

        <div className="hero-cta">
          <button
            className="btn-primary"
            onClick={() => scrollTo("roles")}
          >
            <span>Explore Roles</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          <button
            className="btn-outline"
            onClick={() => scrollTo("process")}
          >
            <span>How It Works</span>
          </button>
        </div>
      </div>

      <div
        className="hero-scroll-indicator"
        onClick={() => scrollTo("stats")}
        style={{ cursor: "pointer" }}
      >
        <div className="mouse">
          <div className="mouse-wheel" />
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}

export default Hero;