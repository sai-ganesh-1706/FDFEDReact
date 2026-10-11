import { useEffect, useRef, useState } from "react";

const stats = [
  {
    icon: "🏛️",
    target: 500,
    suffix: "+",
    label: "Colleges",
  },
  {
    icon: "🎓",
    target: 10000,
    suffix: "+",
    label: "Students Placed",
  },
  {
    icon: "🏢",
    target: 200,
    suffix: "+",
    label: "Recruiters",
  },
  {
    icon: "📈",
    target: 98,
    suffix: "%",
    label: "Placement Rate",
  },
];

function Stats() {
  const sectionRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [values, setValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.25,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const duration = 2000;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setValues(stats.map((stat) => Math.round(stat.target * eased)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [started]);

  return (
    <section className="stats" id="stats" ref={sectionRef}>
      <div className="stats-inner">
        {stats.map((stat, index) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value-wrap">
              <span className="stat-number">
                {values[index].toLocaleString()}
              </span>
              <span className="stat-suffix">{stat.suffix}</span>
            </div>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;