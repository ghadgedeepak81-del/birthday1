/* ==========================================================================
   Shivani's Birthday Website - Interaction & Animation Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App components
  initLoader();
  initCanvasParticles();
  initMusicPlayer();
  initStoryTransitions();
  initWishesSection();
  initEditorialSection();
  initEasterEggs();
});

/* ==========================================================================
   1. LOADING SCREEN & ENTRANCE
   ========================================================================== */
function initLoader() {
  const loader = document.getElementById('loader');
  const loaderBar = document.querySelector('.loader-bar');
  document.body.classList.add('loading');

  // Simulate progress loading
  setTimeout(() => {
    if (loaderBar) loaderBar.style.width = '100%';
  }, 100);

  // Transition main site in
  setTimeout(() => {
    if (loader) {
      loader.classList.add('fade-out');
      document.body.classList.remove('loading');
      
      // Auto cleanup loader element after transition
      setTimeout(() => loader.remove(), 1000);
    }
  }, 2000);
}

/* ==========================================================================
   2. CANVAS PARTICLE SYSTEM (Stars, Rose Petals, Gold Dust)
   ========================================================================== */
let particleEngine = null;

function initCanvasParticles() {
  const canvas = document.getElementById('global-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const maxBackgroundParticles = 80;

  // Particle Class
  class Particle {
    constructor(isBurst = false, burstX = 0, burstY = 0, burstType = 'gold') {
      this.isBurst = isBurst;
      
      if (isBurst) {
        this.x = burstX;
        this.y = burstY;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        this.type = burstType; // 'gold' | 'rose'
      } else {
        // Normal background drift
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = Math.random() * 0.6 + 0.2; // drifting down
        this.alpha = Math.random() * 0.4 + 0.1;
        this.type = Math.random() > 0.45 ? 'dust' : (Math.random() > 0.4 ? 'petal' : 'star');
        this.decay = 0;
      }

      this.size = Math.random() * 3.5 + 1;
      
      // Petal specific properties
      if (this.type === 'petal') {
        this.size = Math.random() * 6 + 4;
        this.swaySpeed = Math.random() * 0.02 + 0.005;
        this.swayRange = Math.random() * 1.5 + 0.5;
        this.swayOffset = Math.random() * Math.PI;
      }
      
      // Star specific properties
      if (this.type === 'star') {
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.size = Math.random() * 1.8 + 0.5;
      }
    }

    update() {
      if (this.isBurst) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.04; // gravity drag
        this.alpha -= this.decay;
      } else {
        // Background drift
        if (this.type === 'petal') {
          // sway side to side
          this.swayOffset += this.swaySpeed;
          this.x += Math.sin(this.swayOffset) * this.swayRange * 0.2;
          this.y += this.vy * 0.8;
        } else if (this.type === 'dust') {
          // drift upward/downward slightly
          this.y -= this.vy * 0.5;
          this.x += this.vx * 0.5;
        } else if (this.type === 'star') {
          // sparkle
          this.alpha = Math.sin(Date.now() * this.twinkleSpeed) * 0.3 + 0.4;
        }

        // Wrap around screen boundaries
        if (this.y > height + 20) {
          this.y = -10;
          this.x = Math.random() * width;
        }
        if (this.y < -20) {
          this.y = height + 10;
          this.x = Math.random() * width;
        }
        if (this.x > width + 20) this.x = -10;
        if (this.x < -20) this.x = width + 10;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);

      if (this.type === 'star') {
        ctx.fillStyle = '#fcf8f9';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#d8b06a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'petal') {
        // Draw elegant rose petal shape
        ctx.fillStyle = '#8e3b56';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#4a1627';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size * 0.6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Gold dust
        ctx.fillStyle = '#d8b06a';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#d8b06a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Populate background particles
  for (let i = 0; i < maxBackgroundParticles; i++) {
    particles.push(new Particle());
  }

  // Particle burst generator
  function createBurst(x, y, count = 35, type = 'gold') {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(true, x, y, type));
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();

      // Remove dead burst particles
      if (p.isBurst && p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  // Expose burst generator globally
  particleEngine = {
    triggerBurst: createBurst
  };

  // Canvas click interactivity
  window.addEventListener('click', (e) => {
    // Only trigger if clicked element is not a button or interaction layer
    if (e.target.tagName !== 'BUTTON' && !e.target.closest('.interactive-grid') && !e.target.closest('.music-wrapper')) {
      const type = Math.random() > 0.5 ? 'gold' : 'rose';
      createBurst(e.clientX, e.clientY, 15, type);
    }
  });
}

/* ==========================================================================
   3. BACKGROUND MUSIC ENGINE
   ========================================================================== */
function initMusicPlayer() {
  const music = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  const tooltip = document.getElementById('music-tooltip');
  
  if (!music || !btn) return;

  // Show floating tooltip reminder on start
  setTimeout(() => {
    if (localStorage.getItem('musicChoice') === null) {
      tooltip.classList.add('visible');
    }
  }, 3500);

  // Read previous user settings
  const storedChoice = localStorage.getItem('musicChoice');
  if (storedChoice === 'playing') {
    // Attempt play on interaction start
    document.addEventListener('click', autoPlayMusic, { once: true });
  }

  function autoPlayMusic() {
    playMusic();
  }

  function playMusic() {
    music.play().then(() => {
      btn.classList.add('playing');
      tooltip.classList.remove('visible');
      localStorage.setItem('musicChoice', 'playing');
    }).catch(err => {
      console.warn("Autoplay blocked or music file missing: ", err);
      // Fail silently, reset classes
      btn.classList.remove('playing');
    });
  }

  function pauseMusic() {
    music.pause();
    btn.classList.remove('playing');
    localStorage.setItem('musicChoice', 'paused');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent triggering canvas burst on button click
    tooltip.classList.remove('visible');
    if (music.paused) {
      playMusic();
      // Verify audio play success, if blank file warning, show toast helper
      if (music.duration === 0 || isNaN(music.duration)) {
        showToast("Music is playing, but the track size is 0. Replace assets/music/birthday.mp3 to hear the melody! ♫");
      }
    } else {
      pauseMusic();
    }
  });
}

/* ==========================================================================
   4. STORY TRANSITIONS & TIMELINES
   ========================================================================== */
function initStoryTransitions() {
  const surpriseBtn = document.getElementById('btn-surprise');
  const heroSection = document.getElementById('hero');
  const mainContent = document.getElementById('main-content');
  const progressBar = document.getElementById('progress-bar');
  const scrollIndicator = document.getElementById('hero-scroll-indicator');

  if (!surpriseBtn || !mainContent) return;

  // Handle Surprise Unlock
  surpriseBtn.addEventListener('click', () => {
    // Radial particle burst on surprise button click
    if (particleEngine) {
      const rect = surpriseBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      particleEngine.triggerBurst(x, y, 50, 'gold');
    }

    // Unlock layout scroll boundaries
    mainContent.classList.remove('content-locked');
    mainContent.classList.add('content-unlocked');

    // Fade out hero scroll indicator and animate button
    if (scrollIndicator) scrollIndicator.classList.add('hidden');

    // GSAP Surprise transitions (Scroll locks reveal section)
    if (typeof gsap !== 'undefined') {
      gsap.to(surpriseBtn, { scale: 0.8, opacity: 0, duration: 0.4 });
      
      // Smooth scroll target to Section Reveal
      setTimeout(() => {
        const targetSection = document.getElementById('section-reveal');
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);

      // Initialize all scroll reveals
      setupScrollAnimations();
    } else {
      // Fallback scroll behavior if GSAP fails
      setTimeout(() => {
        const targetSection = document.getElementById('section-reveal');
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      setupIntersectionObserverFallback();
    }
  });

  // Track progress bar on window scroll
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const scrollPercent = (scrollTop / docHeight) * 100;
      if (progressBar) progressBar.style.height = scrollPercent + '%';
    }
  });

  // Setup Back to Top Button
  const backToTopBtn = document.getElementById('btn-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Setup final reveal button
  const finalBtn = document.getElementById('btn-final-msg');
  const finalBox = document.getElementById('final-reveal-box');
  if (finalBtn && finalBox) {
    finalBtn.addEventListener('click', () => {
      finalBtn.style.display = 'none';
      finalBox.classList.add('visible');
      
      if (particleEngine) {
        const rect = finalBtn.getBoundingClientRect();
        particleEngine.triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35, 'rose');
      }

      // Re-trigger scroll positions refresh for GSAP triggers
      if (typeof ScrollTrigger !== 'undefined') {
        setTimeout(() => ScrollTrigger.refresh(), 300);
      }
    });
  }

  // Final Confetti Button trigger
  const confettiBtn = document.getElementById('btn-confetti');
  if (confettiBtn) {
    confettiBtn.addEventListener('click', (e) => {
      if (particleEngine) {
        // Trigger a gorgeous fountain of particles
        const rect = confettiBtn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        particleEngine.triggerBurst(x, y, 40, 'rose');
        setTimeout(() => particleEngine.triggerBurst(x, y, 40, 'gold'), 200);
        setTimeout(() => particleEngine.triggerBurst(x, y, 30, 'rose'), 400);
      }
      showToast("Keep smiling, Shivuu! 🌸✨");
    });
  }
}

/* ==========================================================================
   5. GSAP SCROLL ANIMATIONS (Premium Feel)
   ========================================================================== */
function setupScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Parallax elements
  gsap.utils.toArray('.cinematic-img').forEach(img => {
    gsap.fromTo(img, 
      { scale: 1.12, y: -20 },
      { 
        scale: 1, 
        y: 20, 
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentNode,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });

  // Text Reveal animations (line-by-line fade in)
  gsap.utils.toArray('.text-reveal-trigger').forEach(elem => {
    const delayVal = parseFloat(elem.dataset.delay) || 0;
    gsap.fromTo(elem,
      { opacity: 0, y: 30, filter: 'blur(4px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1,
        delay: delayVal,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Slide reveals
  gsap.utils.toArray('.reveal-slide-left').forEach(elem => {
    gsap.fromTo(elem,
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elem,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // 3D Staggered Cards Reveal
  gsap.fromTo('.flirty-card',
    { opacity: 0, y: 50, rotateX: -15 },
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.cards-grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );

  // Timeline Scale reveals (Photo story scale fades)
  gsap.utils.toArray('.reveal-scale').forEach(elem => {
    gsap.fromTo(elem,
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Fade elements
  gsap.utils.toArray('.reveal-fade').forEach(elem => {
    gsap.fromTo(elem,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.5,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

// Fallback logic in case GSAP fails to load (IntersectionObserver)
function setupIntersectionObserverFallback() {
  const options = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1) rotateX(0)';
        entry.target.style.filter = 'blur(0)';
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Apply fallback CSS properties and observe
  const targets = document.querySelectorAll('.text-reveal-trigger, .reveal-slide-left, .flirty-card, .reveal-scale, .reveal-fade');
  targets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    const delay = el.dataset.delay ? `${el.dataset.delay}s` : '0s';
    el.style.transition = `all 1s ease-out ${delay}`;
    observer.observe(el);
  });
}

/* ==========================================================================
   6. INTERACTIVE SECTIONS (WISHES, EDITORIAL, RULE)
   ========================================================================== */
function initWishesSection() {
  const wishCards = document.querySelectorAll('.wish-card');
  wishCards.forEach(card => {
    const btn = card.querySelector('.wish-action-btn');
    const revealLines = card.querySelectorAll('.wish-reveal-line');
    
    const handleReveal = (e) => {
      e.stopPropagation();
      if (card.classList.contains('revealed')) return;
      
      card.classList.add('revealed');
      
      // Trigger gold dust burst at card location
      if (particleEngine) {
        const rect = card.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        particleEngine.triggerBurst(x, y, 20, 'gold');
      }
      
      // Sequentially show reveal lines
      revealLines.forEach((line, idx) => {
        const pause = parseFloat(line.dataset.pause) || 0;
        setTimeout(() => {
          line.style.opacity = '1';
          line.style.transform = 'translateY(0)';
          
          // Secondary rose burst for extra magic on subsequent reveals
          if (particleEngine && idx > 0) {
            const rect = card.getBoundingClientRect();
            particleEngine.triggerBurst(rect.left + rect.width / 2, rect.bottom - 40, 8, 'rose');
          }
        }, (idx * 1200) + (pause * 500));
      });
    };
    
    if (btn) btn.addEventListener('click', handleReveal);
    card.addEventListener('click', handleReveal);
  });
}

function initEditorialSection() {
  const section = document.getElementById('section-editorial');
  const flash = document.getElementById('camera-flash');
  const img = document.querySelector('.editorial-img');
  
  if (!section || !flash || !img) return;
  
  // Use ScrollTrigger if GSAP is loaded
  if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      once: true,
      onEnter: () => {
        triggerFlash();
      }
    });
  } else {
    // Fallback Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerFlash();
          observer.unobserve(section);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }
  
  function triggerFlash() {
    // Add flash animation class
    flash.classList.add('flash-active');
    
    // Develop B&W image contrast and brightness after instant flash peak
    setTimeout(() => {
      img.classList.add('colored');
      if (particleEngine) {
        const rect = img.getBoundingClientRect();
        particleEngine.triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 30, 'gold');
      }
    }, 150);
  }
}

/* ==========================================================================
   7. EASTER EGGS
   ========================================================================== */
function initEasterEggs() {
  const dateBtn = document.getElementById('click-date');
  const heartBtn = document.getElementById('secret-heart');

  // 1. Click on Date "18"
  if (dateBtn) {
    dateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (particleEngine) {
        const rect = dateBtn.getBoundingClientRect();
        particleEngine.triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20, 'gold');
      }
      showToast("Yep. That's the important number today. 👀");
    });
  }

  // 2. Secret Heart click counts
  if (heartBtn) {
    let clickCount = 0;
    heartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clickCount++;

      if (clickCount === 1) {
        showToast("Tap it a couple more times... 👀");
        if (particleEngine) {
          const rect = heartBtn.getBoundingClientRect();
          particleEngine.triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10, 'rose');
        }
      } else if (clickCount === 3) {
        // Trigger large explosion
        if (particleEngine) {
          const rect = heartBtn.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          particleEngine.triggerBurst(x, y, 40, 'rose');
        }
        
        showToast("Okay okay... you found the secret. 😂");
        
        // Stagger reveal of the secret message lines
        revealSecretLines();
      }
    });
  }
}

// Staggered reveal helper for secret section
function revealSecretLines() {
  const lines = [
    document.querySelector('.secret-reveal-1'),
    document.querySelector('.secret-reveal-2'),
    document.querySelector('.secret-reveal-3'),
    document.querySelector('.secret-reveal-4'),
    document.querySelector('.secret-reveal-5')
  ];

  lines.forEach((line, index) => {
    if (line) {
      setTimeout(() => {
        line.classList.add('visible');
      }, index * 1200);
    }
  });
}

/* ==========================================================================
   8. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  
  // Custom toast styling injected directly for clean scoping
  toast.style.background = 'rgba(22, 11, 18, 0.9)';
  toast.style.color = '#fcf8f9';
  toast.style.border = '1px solid rgba(216, 176, 106, 0.25)';
  toast.style.boxShadow = '0 8px 24px rgba(74, 22, 39, 0.4)';
  toast.style.padding = '0.9rem 1.8rem';
  toast.style.borderRadius = '4px';
  toast.style.fontSize = '0.9rem';
  toast.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
  toast.style.backdropFilter = 'blur(10px)';
  toast.style.webkitBackdropFilter = 'blur(10px)';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(15px)';
  toast.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
  toast.style.marginBottom = '0.8rem';
  toast.style.pointerEvents = 'all';
  toast.innerHTML = message;

  container.appendChild(toast);

  // Force reflow for transitions
  toast.offsetHeight;

  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  // Automatically fade out after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-15px)';
    
    // Remove from DOM
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}
