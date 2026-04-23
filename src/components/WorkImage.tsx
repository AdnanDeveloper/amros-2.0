import { useState, useRef, useCallback, useEffect } from "react";
import { MdArrowOutward } from "react-icons/md";

interface Props {
  image: string;
  alt?: string;
  video?: string;
  link?: string;
  fullPageImage?: string;
}

const WorkImage = (props: Props) => {
  const [isVideo, setIsVideo] = useState(false);
  const [video, setVideo] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }, []);

  const handleMouseEnter = async () => {
    if (props.fullPageImage) {
      if (!isTouchDevice.current) {
        startScrolling();
      }
    } else if (props.video) {
      setIsVideo(true);
      const response = await fetch(`src/assets/${props.video}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setVideo(blobUrl);
    }
  };

  const handleMouseLeave = () => {
    if (props.fullPageImage) {
      if (!isTouchDevice.current) {
        stopScrolling();
      }
    } else {
      setIsVideo(false);
    }
  };

  const handleClick = () => {
    if (props.fullPageImage && isTouchDevice.current) {
      if (isScrolling) {
        stopScrolling();
      } else {
        startScrolling();
      }
    }
  };

  const startScrolling = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsScrolling(true);

    // Cancel any ongoing animation
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    // Reset to top first with a quick transition
    container.style.transition = "background-position 0.4s ease-out";
    container.style.backgroundPosition = "center top";

    setTimeout(() => {
      container.style.transition = "none";

      // Scroll duration: 6 seconds for full scroll
      const duration = 6000;
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out for smooth feel
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Animate background-position from top (0%) to bottom (100%)
        container.style.backgroundPosition = `center ${eased * 100}%`;

        if (progress < 1) {
          animRef.current = requestAnimationFrame(step);
        }
      };

      animRef.current = requestAnimationFrame(step);
    }, 420);
  }, []);

  const stopScrolling = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setIsScrolling(false);

    const container = containerRef.current;
    if (container) {
      // Smoothly scroll back to top
      container.style.transition =
        "background-position 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      container.style.backgroundPosition = "center top";
      setTimeout(() => {
        if (container) container.style.transition = "none";
      }, 650);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  // Render with full-page scrolling image (background-image approach)
  if (props.fullPageImage) {
    return (
      <div className="work-image">
        <div
          className={`work-image-scroll-container${isScrolling ? " is-scrolling" : ""}`}
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          data-cursor="disable"
          style={{
            backgroundImage: `url(${props.fullPageImage})`,
          }}
          role="img"
          aria-label={props.alt}
        >
          <div
            className={`scroll-hint${isScrolling ? " scroll-hint--hidden" : ""}`}
          >
            <div className="scroll-hint-icon">
              <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="14"
                  height="22"
                  rx="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  className="scroll-hint-dot"
                  cx="8"
                  cy="7"
                  r="2"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span>
              {isTouchDevice.current ? "Tap to scroll" : "Hover to scroll"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: original behavior
  return (
    <div className="work-image">
      <a
        className="work-image-in"
        href={props.link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVideo(false)}
        target="_blank"
        data-cursor={"disable"}
      >
        {props.link && (
          <div className="work-link">
            <MdArrowOutward />
          </div>
        )}
        <img src={props.image} alt={props.alt} loading="lazy" decoding="async" />
        {isVideo && <video src={video} autoPlay muted playsInline loop></video>}
      </a>
    </div>
  );
};

export default WorkImage;
