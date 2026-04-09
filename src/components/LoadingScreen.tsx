import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLoading } from "../context/LoadingProvider";
import "./styles/LoadingScreen.css";

const LETTERS = [
  { char: "A", color: "blue" },
  { char: "M", color: "blue" },
  { char: "R", color: "blue" },
  { char: "O", color: "orange" },
  { char: "S", color: "blue" },
];

const LoadingScreen = () => {
  const { setIsLoading } = useLoading();
  const overlayRef = useRef<HTMLDivElement>(null);
  const riserRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  /* ── Position the riser offscreen initially ── */
  useEffect(() => {
    if (riserRef.current) {
      gsap.set(riserRef.current, { xPercent: -50, yPercent: 100 });
    }
  }, []);

  /* ── Wait for a full fill cycle (~3s), then mark as filled ── */
  useEffect(() => {
    const fillTimer = setTimeout(() => {
      setFilled(true);
    }, 3000);

    return () => clearTimeout(fillTimer);
  }, []);

  /* ── Exit animation once filled ── */
  useEffect(() => {
    if (!filled) return;

    const exitTl = gsap.timeline({
      onComplete: () => {
        import("./utils/initialFX").then((module) => {
          if (module.initialFX) {
            module.initialFX();
          }
          setIsLoading(false);
        });
      },
    });

    /* 1. Fade out the AMROS loader */
    exitTl.to(loaderRef.current, {
      opacity: 0,
      y: -30,
      filter: "blur(6px)",
      duration: 0.5,
      ease: "power3.in",
    });

    /* 2. Curved dark bg sweeps up from bottom to fill the screen */
    exitTl.to(
      riserRef.current,
      {
        yPercent: 0,
        duration: 1.1,
        ease: "power2.inOut",
      },
      ">-0.15"
    );

    /* 3. Match overlay bg to riser so no white flash on removal */
    exitTl.set(overlayRef.current, { background: "#050810" });

    /* 4. Brief hold on the dark filled screen, then we're done */
    exitTl.to({}, { duration: 0.3 });

    return () => {
      exitTl.kill();
    };
  }, [filled]);

  return (
    <div ref={overlayRef} className="ls-overlay" id="loading-screen">
      <div ref={riserRef} className="ls-riser" />

      {/* Center content */}
      <div className="ls-center">
        <div ref={loaderRef} className="ls-loader">
          {LETTERS.map((l, i) => (
            <span
              key={i}
              className={`ls-char ls-char--${l.color}${filled ? " ls-filled" : ""}`}
            >
              {l.char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
