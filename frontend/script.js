/* ============================================================
   Smart Study Planner — script.js
   Login auth · Dashboard navigation · Interactive features
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     LOGIN PAGE
     ══════════════════════════════════════════════════════════ */
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    const emailInput  = document.getElementById('emailInput');
    const pwInput     = document.getElementById('pwInput');
    const togglePw    = document.getElementById('togglePw');
    const errorMsg    = document.getElementById('errorMsg');
    const errorText   = document.getElementById('errorText');
    const loginBtn    = document.getElementById('loginBtn');

    // Demo credentials
    const DEMO_EMAIL = 'student@gmail.com';
    const DEMO_PASS  = '123456';

    // Show/hide password
    if (togglePw) {
      togglePw.addEventListener('click', () => {
        const isPassword = pwInput.type === 'password';
        pwInput.type = isPassword ? 'text' : 'password';
        togglePw.textContent = isPassword ? '🙈' : '👁️';
      });
    }

    // Clear error on typing
    [emailInput, pwInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          errorMsg.classList.remove('show');
        });
      }
    });

    // Form submit
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const pass  = pwInput.value;

      // Validation
      if (!email || !pass) {
        showError('Please fill in both email and password.');
        return;
      }

      if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
      }

      // Check credentials
      if (email === DEMO_EMAIL && pass === DEMO_PASS) {
        // Success — show loading then redirect
        loginBtn.classList.add('loading');
        loginBtn.textContent = 'Signing in';
        errorMsg.classList.remove('show');

        // Store login state
        sessionStorage.setItem('ssp_logged_in', 'true');
        sessionStorage.setItem('ssp_user', 'Student');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1200);
      } else {
        showError('Incorrect email or password. Try the demo credentials.');
        pwInput.value = '';
        pwInput.focus();
      }
    });

    function showError(msg) {
      errorText.textContent = msg;
      errorMsg.classList.add('show');
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Auto-fill hint on demo hint click
    const demoHint = document.querySelector('.demo-hint');
    if (demoHint) {
      demoHint.style.cursor = 'pointer';
      demoHint.title = 'Click to auto-fill demo credentials';
      demoHint.addEventListener('click', () => {
        emailInput.value = DEMO_EMAIL;
        pwInput.value    = DEMO_PASS;
        emailInput.focus();
        // Quick flash effect
        demoHint.style.transform = 'scale(.97)';
        setTimeout(() => { demoHint.style.transform = ''; }, 150);
      });
    }
  }


  /* ══════════════════════════════════════════════════════════
     DASHBOARD
     ══════════════════════════════════════════════════════════ */
  const dashboardLayout = document.querySelector('.dashboard-layout');

  if (dashboardLayout) {

    /* ── Auth guard ── */
    // Redirect to login if not authenticated
    if (sessionStorage.getItem('ssp_logged_in') !== 'true') {
      // Allow direct access for development — remove this condition for production
      // window.location.href = 'index.html';
    }

    /* ── Sidebar toggle (mobile) ── */
    const sidebar   = document.querySelector('.sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay   = document.getElementById('overlay');

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }

    /* ── Panel navigation ── */
    const navItems = document.querySelectorAll('.nav-item[data-panel]');
    const panels   = document.querySelectorAll('.panel');

    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.panel;

        // Update active nav
        navItems.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');

        // Show matching panel
        panels.forEach(p => {
          p.classList.remove('active');
          if (p.id === `panel-${target}`) {
            p.classList.add('active');
          }
        });

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          overlay.classList.remove('show');
        }
      });
    });

    /* ── Task checkbox toggle ── */
    const taskChecks   = document.querySelectorAll('.task-check');
    const completedEl  = document.getElementById('completedCount');

    taskChecks.forEach(check => {
      check.addEventListener('click', () => {
        const isDone = check.classList.toggle('done');
        check.textContent = isDone ? '✓' : '';

        // Update subject text styling
        const taskRow = check.closest('.study-task');
        if (taskRow) {
          const subject = taskRow.querySelector('.task-subject');
          const pill    = taskRow.querySelector('.task-pill');
          if (isDone) {
            subject.classList.add('done-text');
            if (pill) {
              pill.className = 'task-pill pill-blue';
              pill.textContent = 'Done';
            }
          } else {
            subject.classList.remove('done-text');
            if (pill) {
              pill.className = 'task-pill pill-amber';
              pill.textContent = 'Pending';
            }
          }
        }

        // Update completed count
        updateCompletedCount();
      });
    });

    function updateCompletedCount() {
      if (completedEl) {
        const done = document.querySelectorAll('.task-check.done').length;
        completedEl.textContent = done;

        // Animate the number
        completedEl.style.transform = 'scale(1.3)';
        completedEl.style.transition = 'transform .2s ease';
        setTimeout(() => { completedEl.style.transform = ''; }, 200);
      }
    }

    /* ── Live clock ── */
    const clockEl = document.getElementById('liveClock');

    function updateClock() {
      if (clockEl) {
        const now = new Date();
        const opts = {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        clockEl.textContent = '🕐 ' + now.toLocaleTimeString('en-US', opts);
      }
    }

    updateClock();
    setInterval(updateClock, 1000);

    /* ── Animate progress bars on load ── */
    function animateProgressBars() {
      const fills = document.querySelectorAll('.progress-bar-fill[data-width]');
      fills.forEach((fill, i) => {
        setTimeout(() => {
          fill.style.width = fill.dataset.width + '%';
        }, 200 + (i * 120));
      });
    }

    // Use IntersectionObserver for lazy animation
    const progressSection = document.querySelector('.progress-wrap');
    if (progressSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateProgressBars();
            observer.disconnect();
          }
        });
      }, { threshold: 0.2 });
      observer.observe(progressSection);
    } else {
      // Fallback: animate after a delay
      setTimeout(animateProgressBars, 500);
    }

    /* ── Generate AI Timetable button ── */
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        generateBtn.style.pointerEvents = 'none';
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '⏳ Generating…';
        generateBtn.style.opacity = '.7';

        setTimeout(() => {
          generateBtn.innerHTML = '✅ Timetable Ready!';
          generateBtn.style.opacity = '1';
          showToast('AI Timetable generated successfully!', '🤖');

          // Switch to timetable panel
          setTimeout(() => {
            const timetableNav = document.querySelector('[data-panel="timetable"]');
            if (timetableNav) timetableNav.click();
            generateBtn.innerHTML = originalText;
            generateBtn.style.pointerEvents = '';
          }, 1500);
        }, 2000);
      });
    }

    /* ── Logout ── */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('ssp_logged_in');
        sessionStorage.removeItem('ssp_user');
        showToast('Logged out successfully!', '👋');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 800);
      });
    }

    /* ── Summary card hover sparkle ── */
    const summaryCards = document.querySelectorAll('.summary-card');
    summaryCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'all .3s cubic-bezier(.4, 0, .2, 1)';
      });
    });

    /* ── Keyboard shortcuts ── */
    document.addEventListener('keydown', (e) => {
      // Ctrl + K → focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) searchInput.focus();
      }

      // Escape → close sidebar on mobile
      if (e.key === 'Escape') {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     GLOBAL: Toast notification
     ══════════════════════════════════════════════════════════ */
  window.showToast = function (message, icon) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.innerHTML = (icon ? `<span style="font-size:1.2rem">${icon}</span>` : '') + message;
    toast.classList.add('show');

    // Auto-hide
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  };

})();
