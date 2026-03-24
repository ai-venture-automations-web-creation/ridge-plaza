/**
 * Ridge Plaza — script.js
 * Handles: sticky header, mobile menu, smooth scroll,
 * Intersection Observer reveals, scroll-based animations
 */

(function () {
  'use strict';

  /* --------------------------------------------------
     1. Sticky Header — scroll state
     -------------------------------------------------- */
  const header = document.getElementById('site-header');

  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* --------------------------------------------------
     2. Mobile Menu Toggle
     -------------------------------------------------- */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const isOpen = !mobileNav.hidden;

      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close menu when a link is clicked
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileMenu();
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mobileNav.hidden) {
        closeMobileMenu();
        hamburger.focus();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (
        !mobileNav.hidden &&
        !header.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    mobileNav.hidden = false;
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    // Trap focus within nav for accessibility
    mobileNav.querySelector('a') && mobileNav.querySelector('a').focus();
  }

  function closeMobileMenu() {
    mobileNav.hidden = true;
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
  }

  /* --------------------------------------------------
     3. Smooth Scroll for Anchor Links
     -------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 76;
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });

  /* --------------------------------------------------
     4. Intersection Observer — Reveal Animations
     -------------------------------------------------- */
  const revealElements = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.12
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all elements immediately for browsers without support
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* --------------------------------------------------
     5. Gallery Item Keyboard Accessibility
         (allow Enter/Space on gallery items)
     -------------------------------------------------- */
  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');

    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Simulate a "lightbox" focus — could be extended to a real lightbox
        item.classList.toggle('gallery-focused');
      }
    });
  });

  /* --------------------------------------------------
     6. Tenant Card — subtle parallax tilt on hover
     -------------------------------------------------- */
  const tenantCards = document.querySelectorAll('.tenant-card');

  tenantCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      if (window.innerWidth < 1024) return; // desktop only

      const rect  = card.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const cx    = rect.width  / 2;
      const cy    = rect.height / 2;
      const rotX  = ((y - cy) / cy) * -4;   // max ±4deg
      const rotY  = ((x - cx) / cx) *  4;

      card.style.transform =
        'translateY(-6px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform  = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });

  /* --------------------------------------------------
     7. Lazy-load Images (native lazy + polyfill fallback)
     -------------------------------------------------- */
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading — nothing extra needed
  } else {
    // Basic IntersectionObserver polyfill for images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            observer.unobserve(img);
          }
        });
      });

      lazyImages.forEach(function (img) {
        imgObserver.observe(img);
      });
    }
  }

  /* --------------------------------------------------
     8. Header nav — active link highlighting on scroll
     -------------------------------------------------- */
  const sections    = document.querySelectorAll('section[id]');
  const navLinks    = document.querySelectorAll('.nav-desktop a[href^="#"]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + (header ? header.offsetHeight : 76) + 20;

    let currentId = '';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('nav-active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('nav-active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* --------------------------------------------------
     9. Add nav-active style dynamically
     -------------------------------------------------- */
  const activeStyle = document.createElement('style');
  activeStyle.textContent =
    '.nav-desktop a.nav-active { color: #E67E22 !important; background: rgba(230,126,34,0.1) !important; }';
  document.head.appendChild(activeStyle);

  /* --------------------------------------------------
     10. Hero Stats — count-up animation
     -------------------------------------------------- */
  function animateCounter(element, target, duration, suffix) {
    let start     = 0;
    const isFloat = String(target).includes('.');
    const step    = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current  = eased * target;

      if (isFloat) {
        element.textContent = current.toFixed(1) + (suffix || '');
      } else if (typeof target === 'string') {
        element.textContent = target; // already a string like "Open"
      } else {
        element.textContent = Math.floor(current) + (suffix || '');
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = (isFloat ? target.toFixed(1) : target) + (suffix || '');
      }
    };
    requestAnimationFrame(step);
  }

  // Only animate numeric stats
  const statNums = document.querySelectorAll('.hero-stats .stat-num');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statNums.forEach(function (el) {
          const text = el.textContent.trim();
          if (text === '4.4') {
            animateCounter(el, 4.4, 1200, '');
          } else if (text === '8+') {
            animateCounter(el, 8, 900, '+');
          }
          // "Open" stays as text
        });
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  /* --------------------------------------------------
     11. Scroll-to-top on logo click (already handled
         by href="#" + smooth scroll above)
     -------------------------------------------------- */

  /* --------------------------------------------------
     12. Page Load — remove loading jank
     -------------------------------------------------- */
  document.documentElement.classList.add('js-loaded');

})();
