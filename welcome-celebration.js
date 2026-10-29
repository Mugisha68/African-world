/**
 * Africa & The World — Welcoming Celebration & Confetti Starburst Explosion
 * Triggers on user registration (signup) and login on the user side.
 * Displays a blurred backdrop, moving celebration explosion matching the attached artwork,
 * and a personalized welcoming message thanking the traveler.
 */

(function () {
  "use strict";

  // Prevent multiple initializations
  if (window.__welcomeCelebrationInitialized) return;
  window.__welcomeCelebrationInitialized = true;

  // Configuration & Colors inspired by the celebration explosion artwork
  const PALETTE = [
    "#00a8e8", // Cyan / sky blue
    "#023e8a", // Cobalt blue
    "#ffb703", // Radiant gold / sunshine yellow
    "#fb8500", // Vibrant amber
    "#e63946", // Crimson celebration red
    "#d81159", // Festive magenta / pink
    "#059669", // Emerald green
    "#10b981", // Bright mint
    "#8b5cf6", // Royal purple
    "#f43f5e"  // Hot rose
  ];

  class Particle {
    constructor(cx, cy, isSecondary = false) {
      this.cx = cx;
      this.cy = cy;
      this.x = cx;
      this.y = cy;

      // Particle shape types matching the user's reference image:
      // 'ray' = long tapered explosion ray
      // 'star' = 4-pointed or 5-pointed celebration star
      // 'ribbon' = fluttering confetti rectangle
      // 'circle' = confetti dot
      // 'square' = rotating diamond / square
      const types = ['ray', 'star', 'ribbon', 'ribbon', 'circle', 'square', 'ray'];
      this.type = types[Math.floor(Math.random() * types.length)];
      this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];

      // Initial angle & explosive velocity outward from center
      const angle = Math.random() * Math.PI * 2;
      const speed = this.type === 'ray' 
        ? (isSecondary ? 7 + Math.random() * 8 : 9 + Math.random() * 12)
        : (isSecondary ? 4 + Math.random() * 7 : 6 + Math.random() * 11);

      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      // Dimensions
      if (this.type === 'ray') {
        this.length = 24 + Math.random() * 32;
        this.width = 3 + Math.random() * 4;
      } else if (this.type === 'ribbon') {
        this.width = 7 + Math.random() * 8;
        this.height = 12 + Math.random() * 14;
      } else if (this.type === 'star') {
        this.size = 10 + Math.random() * 14;
        this.points = Math.random() > 0.4 ? 4 : 5;
      } else if (this.type === 'circle') {
        this.radius = 4 + Math.random() * 5;
      } else {
        this.size = 8 + Math.random() * 8;
      }

      // Rotation & 3D flutter
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.22;
      this.tilt = Math.random() * Math.PI;
      this.tiltSpeed = 0.08 + Math.random() * 0.12;

      // Life and decay
      this.opacity = 1;
      this.decay = 0.005 + Math.random() * 0.008;
      this.gravity = this.type === 'ray' ? 0.05 : 0.12;
      this.drag = this.type === 'ray' ? 0.965 : 0.982;
      this.sparkle = Math.random() * Math.PI * 2;
      this.sparkleSpeed = 0.15 + Math.random() * 0.2;
    }

    update() {
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;

      this.rotation += this.rotationSpeed;
      this.tilt += this.tiltSpeed;
      this.sparkle += this.sparkleSpeed;

      this.opacity -= this.decay;
      return this.opacity > 0;
    }

    draw(ctx) {
      if (this.opacity <= 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
      ctx.fillStyle = this.color;
      ctx.strokeStyle = this.color;

      if (this.type === 'ray') {
        // Tapered celebration spike radiating along its travel angle
        const rayAngle = Math.atan2(this.vy, this.vx);
        ctx.rotate(rayAngle);
        ctx.beginPath();
        ctx.moveTo(this.length, 0);
        ctx.lineTo(-this.length * 0.2, this.width / 2);
        ctx.lineTo(-this.length * 0.4, 0);
        ctx.lineTo(-this.length * 0.2, -this.width / 2);
        ctx.closePath();
        ctx.fill();

      } else if (this.type === 'star') {
        // 4-pointed or 5-pointed star sparkle
        ctx.rotate(this.rotation);
        const scale = 0.8 + Math.sin(this.sparkle) * 0.3;
        ctx.scale(scale, scale);
        drawStar(ctx, 0, 0, this.points, this.size, this.size * 0.42);
        ctx.fill();

      } else if (this.type === 'ribbon') {
        // 3D flipping ribbon
        ctx.rotate(this.rotation);
        const xOffset = Math.sin(this.tilt) * (this.width / 2);
        ctx.beginPath();
        ctx.moveTo(-xOffset, -this.height / 2);
        ctx.lineTo(xOffset, -this.height / 2);
        ctx.lineTo(-xOffset, this.height / 2);
        ctx.lineTo(xOffset, this.height / 2);
        ctx.closePath();
        ctx.fill();

      } else if (this.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Rotating square / diamond
        ctx.rotate(this.rotation);
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      }

      ctx.restore();
    }
  }

  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  // Inject CSS styles for modal, blur backdrop, and animations
  function injectStyles() {
    if (document.getElementById("welcomeCelebrationStyles")) return;
    const style = document.createElement("style");
    style.id = "welcomeCelebrationStyles";
    style.textContent = `
      .welcome-celebration-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(10, 14, 20, 0.78);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        opacity: 0;
        transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
      }

      .welcome-celebration-overlay.is-visible {
        opacity: 1;
      }

      .welcome-celebration-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      }

      .welcome-celebration-card {
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 540px;
        background: linear-gradient(155deg, rgba(24, 28, 38, 0.98), rgba(12, 16, 24, 0.98));
        border: 1.5px solid rgba(201, 130, 34, 0.5);
        box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.7),
                    0 0 50px rgba(201, 130, 34, 0.22);
        border-radius: 22px;
        padding: 34px 30px 28px;
        color: #f8fafc;
        text-align: center;
        transform: scale(0.9) translateY(20px);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .welcome-celebration-overlay.is-visible .welcome-celebration-card {
        transform: scale(1) translateY(0);
      }

      .celebrate-close-btn {
        position: absolute;
        top: 16px;
        right: 18px;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.06);
        color: #94a3b8;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .celebrate-close-btn:hover {
        background: rgba(239, 68, 68, 0.18);
        border-color: #ef4444;
        color: #ef4444;
      }

      .celebrate-icon-crest {
        width: 76px;
        height: 76px;
        margin: 0 auto 18px;
        border-radius: 50%;
        background: linear-gradient(135deg, #c87a1e, #f59e0b);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 34px;
        box-shadow: 0 10px 25px rgba(201, 130, 34, 0.45);
        animation: celebratePulse 2s infinite ease-in-out;
      }

      @keyframes celebratePulse {
        0%, 100% { transform: scale(1); box-shadow: 0 10px 25px rgba(201, 130, 34, 0.45); }
        50% { transform: scale(1.06); box-shadow: 0 14px 34px rgba(201, 130, 34, 0.65); }
      }

      .celebrate-tagline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 14px;
        border-radius: 20px;
        background: rgba(201, 130, 34, 0.16);
        border: 1px solid rgba(201, 130, 34, 0.35);
        color: #fcd34d;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        margin-bottom: 12px;
      }

      .celebrate-title {
        font-size: 1.65rem;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 10px;
        line-height: 1.25;
      }

      .celebrate-message {
        font-size: 0.95rem;
        color: #cbd5e1;
        line-height: 1.6;
        margin: 0 0 20px;
      }

      .celebrate-user-badge {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 22px;
        font-size: 13px;
        color: #e2e8f0;
      }

      .celebrate-user-badge .user-verified-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
      }

      .celebrate-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }

      .celebrate-primary-btn {
        background: linear-gradient(135deg, #c87a1e, #d97706);
        color: #ffffff;
        font-weight: 700;
        font-size: 14.5px;
        padding: 12px 28px;
        border-radius: 12px;
        border: none;
        cursor: pointer;
        transition: all 0.25s ease;
        box-shadow: 0 8px 20px rgba(201, 130, 34, 0.35);
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .celebrate-primary-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(201, 130, 34, 0.5);
        background: linear-gradient(135deg, #d97706, #f59e0b);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Main function to trigger the welcoming celebration
   * @param {Object} options - { type: 'signup'|'login', name: string, email: string }
   */
  window.showWelcomeCelebration = function (options = {}) {
    const isSignup = options.type === "signup";
    const userName = options.name || "Distinguished Traveler";
    const userEmail = options.email || "";

    injectStyles();

    // Remove any existing overlay
    const existing = document.getElementById("welcomeCelebrationOverlay");
    if (existing) existing.remove();

    // Create overlay DOM
    const overlay = document.createElement("div");
    overlay.id = "welcomeCelebrationOverlay";
    overlay.className = "welcome-celebration-overlay";

    // Create Canvas for the particle explosion
    const canvas = document.createElement("canvas");
    canvas.className = "welcome-celebration-canvas";
    overlay.appendChild(canvas);

    // Create Card
    const card = document.createElement("div");
    card.className = "welcome-celebration-card";

    const titleText = isSignup
      ? "Welcome to Africa & The World! 🌍✨"
      : `Welcome Back, ${userName}! 🌍✨`;

    const tagText = isSignup
      ? "🎉 Account Created Successfully"
      : "👋 Welcome Back to Your Portal";

    const messageText = isSignup
      ? "Thank you for creating your account and joining our global cultural and educational initiative! We warmly welcome you to explore rich African civilizations, indigenous historical scholarship, archival documentaries, and curated expeditions across the continent."
      : "Thank you for returning to Africa & The World! We are delighted to have you back. Your traveler passport and customized itineraries are fully loaded and ready for exploration.";

    card.innerHTML = `
      <button type="button" class="celebrate-close-btn" id="welcomeCelebrationCloseBtn" aria-label="Close message">&times;</button>
      <div class="celebrate-icon-crest">
        <i class="fas fa-globe-africa"></i>
      </div>
      <div class="celebrate-tagline">
        <i class="fas fa-sparkles"></i>
        <span>${tagText}</span>
      </div>
      <h2 class="celebrate-title">${titleText}</h2>
      <p class="celebrate-message">${messageText}</p>
      <div class="celebrate-user-badge">
        <span class="user-verified-dot"></span>
        <strong>${userName}</strong>
        ${userEmail ? `<span style="color:#94a3b8;">&bull; ${userEmail}</span>` : ""}
      </div>
      <div class="celebrate-actions">
        <button type="button" class="celebrate-primary-btn" id="welcomeCelebrationActionBtn">
          <span>Start Exploring Now</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Animation variables
    let animationFrameId;
    let particles = [];
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Spawn explosion particles bursting from the center
    function spawnExplosionBurst(cx, cy, count, isSecondary = false) {
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(cx, cy, isSecondary));
      }
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Initial big explosion (matching the vibrant starburst reference image!)
    spawnExplosionBurst(centerX, centerY, 190, false);

    // Follow-up bursts for continuous celebration motion
    setTimeout(() => {
      spawnExplosionBurst(centerX, centerY, 70, true);
    }, 450);

    setTimeout(() => {
      spawnExplosionBurst(centerX, centerY, 50, true);
    }, 900);

    // Particle Animation Loop
    function renderLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.update()) {
          p.draw(ctx);
        } else {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    }
    renderLoop();

    // Trigger visual entry transition
    requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
    });

    // Dismiss Handler
    function closeCelebration() {
      overlay.classList.remove("is-visible");
      cancelAnimationFrame(animationFrameId);
      setTimeout(() => {
        overlay.remove();
        window.removeEventListener("resize", resizeCanvas);
      }, 400);
      try {
        sessionStorage.removeItem("africa_world_welcome_event");
      } catch (e) {}
    }

    // Attach dismissal events
    const closeBtn = card.querySelector("#welcomeCelebrationCloseBtn");
    const actionBtn = card.querySelector("#welcomeCelebrationActionBtn");

    if (closeBtn) closeBtn.addEventListener("click", closeCelebration);
    if (actionBtn) actionBtn.addEventListener("click", closeCelebration);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeCelebration();
    });

    // Auto-dismiss after 12 seconds if not interacted with
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        closeCelebration();
      }
    }, 12000);
  };

  // Check if a welcome celebration event was pending from login or registration
  function checkPendingCelebration() {
    try {
      const raw = sessionStorage.getItem("africa_world_welcome_event");
      if (raw) {
        const eventData = JSON.parse(raw);
        // Small delay to ensure the DOM has painted nicely
        setTimeout(() => {
          window.showWelcomeCelebration(eventData);
        }, 300);
      }
    } catch (e) {
      console.warn("Welcome celebration check notice:", e);
    }
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkPendingCelebration);
  } else {
    checkPendingCelebration();
  }
})();
