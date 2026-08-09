import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Mascot for the auth left panel.
 * - Eyes + head gently track the cursor: small range, heavily smoothed, so it
 *   reads as "aware of you" rather than locked-on/staring.
 * - Blinks occasionally on its own for a natural feel.
 * - Exposes reactCorrect()/reactWrong() via ref. These are meant to be called
 *   ONLY from a form's submit handler once the real result is known — never
 *   from onChange/onInput, or it starts nodding at every keystroke again.
 */
const AuthCharacter = forwardRef(function AuthCharacter(_props, ref) {
  const svgRef = useRef(null);
  const eyeLPupilRef = useRef(null);
  const eyeRPupilRef = useRef(null);
  const eyeLGroupRef = useRef(null);
  const eyeRGroupRef = useRef(null);
  const headRef = useRef(null);
  const mouthRef = useRef(null);
  const studentRef = useRef(null);
  const docRef = useRef(null);

  const target = useRef({ x: 300, y: 200 });
  const eyePos = useRef({ x: 0, y: 0 });
  const headTilt = useRef({ x: 0, y: 0 });
  const reacting = useRef(false);

  // ---- calm cursor tracking ----
  useEffect(() => {
    const EYE_ORIGIN = { x: 290, y: 130 };
    let raf;

    const svgPoint = (clientX, clientY) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      return pt.matrixTransform(ctm.inverse());
    };

    const onMouseMove = (e) => {
      target.current = svgPoint(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);

    const loop = () => {
      const dx = target.current.x - EYE_ORIGIN.x;
      const dy = target.current.y - EYE_ORIGIN.y;
      const dist = Math.hypot(dx, dy) || 1;

      // Pupils: small max offset, slow lerp — no darting.
      const MAX_PUPIL = 2.1;
      const desiredX = (dx / dist) * Math.min(MAX_PUPIL, dist / 40);
      const desiredY = (dy / dist) * Math.min(MAX_PUPIL, dist / 40);
      eyePos.current.x += (desiredX - eyePos.current.x) * 0.06;
      eyePos.current.y += (desiredY - eyePos.current.y) * 0.06;

      if (eyeLPupilRef.current && eyeRPupilRef.current) {
        eyeLPupilRef.current.setAttribute("cx", 44 + eyePos.current.x);
        eyeLPupilRef.current.setAttribute("cy", 58 + eyePos.current.y);
        eyeRPupilRef.current.setAttribute("cx", 76 + eyePos.current.x);
        eyeRPupilRef.current.setAttribute("cy", 58 + eyePos.current.y);
      }

      // Head: barely tilts, much slower than the eyes.
      const desiredTiltX = Math.max(-3, Math.min(3, dx / 140));
      const desiredTiltY = Math.max(-2, Math.min(2, dy / 160));
      headTilt.current.x += (desiredTiltX - headTilt.current.x) * 0.025;
      headTilt.current.y += (desiredTiltY - headTilt.current.y) * 0.025;

      if (!reacting.current && headRef.current) {
        headRef.current.setAttribute(
          "transform",
          `rotate(${headTilt.current.x} 60 60) translate(0 ${headTilt.current.y})`
        );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---- idle life: bob, drifting doc, occasional blink ----
  useEffect(() => {
    let bobT = 0;
    let docT = 0;
    const idleIv = setInterval(() => {
      bobT += 0.09;
      docT += 0.045;
      if (studentRef.current) {
        studentRef.current.setAttribute("transform", `translate(230, ${55 + Math.sin(bobT) * 3.5})`);
      }
      if (docRef.current) {
        const fy = Math.sin(docT) * 7;
        const rot = Math.sin(docT * 0.6) * 2;
        docRef.current.setAttribute("transform", `translate(30,${55 + fy}) rotate(${rot} 75 95)`);
      }
    }, 40);

    const blink = () => {
      [eyeLGroupRef.current, eyeRGroupRef.current].forEach((g) => {
        if (!g) return;
        g.style.transform = "scaleY(0.12)";
      });
      setTimeout(() => {
        [eyeLGroupRef.current, eyeRGroupRef.current].forEach((g) => {
          if (!g) return;
          g.style.transform = "scaleY(1)";
        });
      }, 120);
    };
    const blinkIv = setInterval(blink, 3800 + Math.random() * 2500);

    return () => {
      clearInterval(idleIv);
      clearInterval(blinkIv);
    };
  }, []);

  // ---- reactions, called from outside via ref ----
  const reactCorrect = () => {
    if (!headRef.current || !mouthRef.current) return;
    reacting.current = true;
    const steps = [0, -8, 3, -4, 0];
    let i = 0;
    const iv = setInterval(() => {
      headRef.current.setAttribute("transform", `rotate(0 60 60) translate(0 ${steps[i]})`);
      i++;
      if (i >= steps.length) {
        clearInterval(iv);
        reacting.current = false;
      }
    }, 90);
    mouthRef.current.setAttribute("d", "M 44 78 Q 60 94 76 78");
    setTimeout(() => mouthRef.current && mouthRef.current.setAttribute("d", "M 46 80 Q 60 88 74 80"), 900);
  };

  const reactWrong = () => {
    if (!headRef.current || !mouthRef.current) return;
    reacting.current = true;
    const steps = [0, -10, 10, -8, 8, -4, 0];
    let i = 0;
    const iv = setInterval(() => {
      headRef.current.setAttribute("transform", `rotate(${steps[i]} 60 60)`);
      i++;
      if (i >= steps.length) {
        clearInterval(iv);
        reacting.current = false;
      }
    }, 80);
    mouthRef.current.setAttribute("d", "M 46 84 Q 60 76 74 84");
    setTimeout(() => mouthRef.current && mouthRef.current.setAttribute("d", "M 46 80 Q 60 88 74 80"), 900);
  };

  useImperativeHandle(ref, () => ({ reactCorrect, reactWrong }));

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 300"
      className="w-full max-w-sm"
      style={{ overflow: "visible" }}
      role="img"
      aria-label="Illustration of a student mascot next to a document"
    >
      {/* soft halo sitting directly behind the character — bigger and a
          touch brighter, closer to the original mockup's glow */}
      <circle cx="290" cy="150" r="130" fill="rgba(255,255,255,0.12)" />

      <g ref={docRef} transform="translate(30,55)">
        {/* small floating grad-cap accent above the document, like the
            original illustration had */}
        <g transform="translate(50,-42)" opacity="0.95">
          <path d="M0 10 L30 0 L60 10 L30 20 Z" fill="#fbbf24" />
          <rect x="27" y="10" width="6" height="18" fill="#1d4ed8" />
        </g>

        <rect x="0" y="0" width="150" height="190" rx="14" fill="#f4f6fb" />
        <rect x="24" y="40" width="100" height="10" rx="5" fill="#9fb4ff" />
        <rect x="24" y="64" width="80" height="10" rx="5" fill="#c3cffc" />
        <rect x="24" y="88" width="90" height="10" rx="5" fill="#c3cffc" />
      </g>

      <ellipse cx="290" cy="270" rx="90" ry="12" fill="rgba(0,0,0,0.18)" />

      <g ref={studentRef} transform="translate(230,55)">
        <rect x="20" y="90" width="80" height="110" rx="26" fill="#f4f6fb" />

        <g ref={headRef}>
          <circle cx="60" cy="60" r="46" fill="#ffd9a0" />

          <g ref={eyeLGroupRef} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <ellipse cx="44" cy="58" rx="9" ry="9" fill="white" />
            <circle ref={eyeLPupilRef} cx="44" cy="58" r="4.2" fill="#20232d" />
          </g>
          <g ref={eyeRGroupRef} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <ellipse cx="76" cy="58" rx="9" ry="9" fill="white" />
            <circle ref={eyeRPupilRef} cx="76" cy="58" r="4.2" fill="#20232d" />
          </g>

          <path
            ref={mouthRef}
            d="M 46 80 Q 60 88 74 80"
            stroke="#3a2c1f"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          <g transform="translate(60,10)">
            <polygon points="-46,8 0,-14 46,8 0,30" fill="#1d4ed8" />
            <rect x="-6" y="6" width="12" height="14" fill="#1e40af" />
            <circle cx="46" cy="8" r="4" fill="#fbbf24" />
            <line x1="46" y1="8" x2="46" y2="34" stroke="#fbbf24" strokeWidth="2" />
          </g>
        </g>
      </g>
    </svg>
  );
});

export default AuthCharacter;
