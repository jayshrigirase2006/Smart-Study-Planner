/* ============================================================
   Smart Study Planner — script.js
   All vanilla JavaScript logic for login + dashboard
   ============================================================ */

/* ============================================================
   UTILITY
   ============================================================ */

function $(selector, scope) {
  return (scope || document).querySelector(selector);
}

function $$(selector, scope) {
  return [...(scope || document).querySelectorAll(selector)];
}

function showToast(msg, icon = '✅') {
  const toast = $('#toast');
  if (!toast) return;
  toast.innerHTML = `${icon} ${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ============================================================
   LOGIN PAGE  (index.html)
   ============================================================ */

function initLogin() {
  const form      = $('#loginForm');
  if (!form) return;                  // not on login page

  const emailIn   = $('#emailInput');
  const pwIn      = $('#pwInput');
  const toggleBtn = $('#togglePw');
  const errorBox  = $('#errorMsg');
  const loginBtn  = $('#loginBtn');

  // Demo credentials
  const DEMO_EMAIL = 'student@gmail.com';
  const DEMO_PASS  = '123456';

  /* Show / hide password */
  toggleBtn.addEventListener('click', () => {
    const isText = pwIn.type === 'text';
    pwIn.type            = isText ? 'password' : 'text';
    toggleBtn.textContent = isText ? '👁️' : '🙈';
  });

  /* Remember me — restore saved email */
  const saved = localStorage.getItem('ssp_remember');
  if (saved) {
    emailIn.value = saved;
    $('#rememberMe').checked = true;
  }

  /* Clear error on input */
  [emailIn, pwIn].forEach(inp => inp.addEventListener('input', () => {
    errorBox.classList.remove('show');
    inp.classList.remove('error');
  }));

  /* Form submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailIn.value.trim();
    const pass  = pwIn.value.trim();
    let   valid = true;

    // Basic empty check
    if (!email) { emailIn.classList.add('error'); valid = false; }
    if (!pass)  { pwIn.classList.add('error');   valid = false; }

    if (!valid) {
      showError('Please fill in both fields.');
      return;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailIn.classList.add('error');
      showError('Please enter a valid email address.');
      return;
    }

    // Credential check
    if (email !== DEMO_EMAIL || pass !== DEMO_PASS) {
      emailIn.classList.add('error');
      pwIn.classList.add('error');
      showError('Incorrect email or password. Use the demo credentials below.');
      return;
    }

    // Remember me
    if ($('#rememberMe').checked) {
      localStorage.setItem('ssp_remember', email);
    } else {
      localStorage.removeItem('ssp_remember');
    }

    // Success — animate button then redirect
    loginBtn.textContent = '✅ Logging in…';
    loginBtn.disabled    = true;
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  });

  function showError(msg) {
    $('#errorText').textContent = msg;
    errorBox.classList.add('show');
  }
}

/* ============================================================
   DASHBOARD  (dashboard.html)
   ============================================================ */

function initDashboard() {
  if (!$('.dashboard-layout')) return;   // not on dashboard

  initSidebar();
  initNavigation();
  initStudyTasks();
  initProgressBars();
  initLogout();
  initGenerateBtn();
  initClock();
}

/* --- Sidebar (mobile toggle) --- */
function initSidebar() {
  const sidebar   = $('.sidebar');
  const hamburger = $('#hamburger');
  const overlay   = $('#overlay');

  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  });

  overlay.addEventListener('click', closeSidebar);

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }

  // Close on nav item click (mobile)
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', closeSidebar);
  });
}

/* --- Section navigation --- */
function initNavigation() {
  const navItems = $$('.nav-item[data-panel]');
  const panels   = $$('.panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.panel;

      // Update active nav
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Show target panel
      panels.forEach(p => p.classList.remove('active'));
      const targetPanel = $(`#panel-${target}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

/* --- Study task check/uncheck --- */
function initStudyTasks() {
  $$('.task-check').forEach(btn => {
    btn.addEventListener('click', () => {
      const isDone = btn.classList.toggle('done');
      const subject = btn.closest('.study-task').querySelector('.task-subject');

      if (isDone) {
        btn.textContent = '✓';
        subject.classList.add('done-text');
        showToast(`"${subject.textContent.trim()}" marked complete!`, '✅');
        updateCompletedCount(1);
      } else {
        btn.textContent = '';
        subject.classList.remove('done-text');
        updateCompletedCount(-1);
      }
    });
  });
}

function updateCompletedCount(delta) {
  const el = $('#completedCount');
  if (!el) return;
  const cur = parseInt(el.textContent) || 0;
  el.textContent = Math.max(0, cur + delta);
}

/* --- Animate progress bars on load --- */
function initProgressBars() {
  // Trigger after a short delay so the CSS transition is visible
  setTimeout(() => {
    $$('.progress-bar-fill').forEach(bar => {
      const target = bar.dataset.width || '0';
      bar.style.width = target + '%';
    });
  }, 300);
}

/* --- Logout --- */
function initLogout() {
  const logoutBtn = $('#logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      window.location.href = 'index.html';
    }
  });
}

/* --- Generate AI Timetable button --- */
function initGenerateBtn() {
  const btn = $('#generateBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.textContent = '⏳ Generating…';
    btn.disabled    = true;

    setTimeout(() => {
      btn.innerHTML   = '🤖 Generate AI Timetable';
      btn.disabled    = false;
      showToast('AI Timetable generated! Check AI Timetable section.', '🤖');

      // Navigate to timetable panel
      const ttNav = $('[data-panel="timetable"]');
      if (ttNav) ttNav.click();
    }, 2000);
  });
}

/* --- Live clock in topbar --- */
function initClock() {
  const clockEl = $('#liveClock');
  if (!clockEl) return;

  function tick() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   BOOT — runs on every page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initDashboard();
});