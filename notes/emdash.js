/**
 * Why I Use Emdash — Refined Inline Interactive Script
 */

(() => {
  // --- STATE ---
  let isSimulating = false;
  let term1Timeout = null;
  let term2Timeout = null;
  let activeWorktree = 'bug-fix-cors';

  // --- DOM ELEMENTS ---
  const worktreeNodes = document.querySelectorAll('.worktree-node');
  const btnRunParallel = document.getElementById('btnRunParallel');
  const widgetStatus = document.getElementById('widgetStatus');
  const term1Logs = document.getElementById('term1Logs');
  const term2Logs = document.getElementById('term2Logs');
  const term1Status = document.getElementById('term1Status');
  const term2Status = document.getElementById('term2Status');
  
  const gitDiffBox = document.getElementById('gitDiffBox');
  const notifBox = document.getElementById('notifBox');

  // --- AUDIO SYNTHESIS CHIME (Web Audio API) ---
  function playSuccessChime() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      
      // Node 1: Tone 1 (C5 - 523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.04, ctx.currentTime); // Low volume, elegant
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      // Node 2: Tone 2 (E5 - 659.25 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0.04, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Chime could not be synthesized: ", e);
    }
  }

  // --- LOG ENTRIES ---
  const logsAgent1 = [
    { text: 'claude run "fix unkeyed react mapping warning"', type: 'cmd', delay: 150 },
    { text: 'Indexing Workspace components...', type: 'info', delay: 300 },
    { text: 'Found React unkeyed map in src/components/Grid.jsx:124', type: 'output', delay: 250 },
    { text: 'Replacing file range lines 124...', type: 'output', delay: 400 },
    { text: 'Diff patched successfully.', type: 'success', delay: 300 }
  ];

  const logsAgent2 = [
    { text: 'npm run test:components', type: 'cmd', delay: 100 },
    { text: 'Spinning up test suite inside auth-service-v2 worktree...', type: 'info', delay: 300 },
    { text: 'Asserting: Auth handler validation', type: 'output', delay: 300 },
    { text: '✓ Component keys mapped correctly', type: 'success', delay: 250 },
    { text: '✓ All 4 component assertions passed.', type: 'success', delay: 300 }
  ];

  // --- SIMULATION HANDLER ---
  function runParallelSimulation() {
    if (isSimulating) return;

    isSimulating = true;
    btnRunParallel.disabled = true;
    btnRunParallel.textContent = 'Executing workstreams...';
    
    // Status
    widgetStatus.classList.add('active');
    widgetStatus.querySelector('span:last-child').textContent = 'EXECUTING';

    // Clear UI
    term1Logs.innerHTML = '';
    term2Logs.innerHTML = '';
    gitDiffBox.style.display = 'none';
    notifBox.style.display = 'none';

    term1Status.textContent = 'RUNNING';
    term1Status.className = 'running';
    term2Status.textContent = 'RUNNING';
    term2Status.className = 'running';

    let t1Done = false;
    let t2Done = false;

    // Typewriter Terminal 1
    let idx1 = 0;
    function type1() {
      if (idx1 < logsAgent1.length) {
        const log = logsAgent1[idx1];
        const p = document.createElement('p');
        p.className = `log-line ${log.type}`;
        p.textContent = log.text;
        term1Logs.appendChild(p);
        term1Logs.scrollTop = term1Logs.scrollHeight;
        idx1++;
        term1Timeout = setTimeout(type1, log.delay || 300);
      } else {
        t1Done = true;
        term1Status.textContent = 'COMPLETED';
        term1Status.className = 'done';
        checkCompletion();
      }
    }

    // Typewriter Terminal 2
    let idx2 = 0;
    function type2() {
      if (idx2 < logsAgent2.length) {
        const log = logsAgent2[idx2];
        const p = document.createElement('p');
        p.className = `log-line ${log.type}`;
        p.textContent = log.text;
        term2Logs.appendChild(p);
        term2Logs.scrollTop = term2Logs.scrollHeight;
        idx2++;
        term2Timeout = setTimeout(type2, log.delay || 250);
      } else {
        t2Done = true;
        term2Status.textContent = 'COMPLETED';
        term2Status.className = 'done';
        checkCompletion();
      }
    }

    function checkCompletion() {
      if (t1Done && t2Done) {
        isSimulating = false;
        btnRunParallel.disabled = false;
        btnRunParallel.textContent = 'Run Parallel Agents';
        
        widgetStatus.classList.remove('active');
        widgetStatus.querySelector('span:last-child').textContent = 'ONLINE';

        // Synthesis audio succeed chime
        playSuccessChime();

        // Slide-in Notification Alert card inside the widget
        setTimeout(() => {
          notifBox.style.display = 'block';
        }, 500);
      }
    }

    type1();
    type2();
  }

  // --- WORKTREE NAVIGATION ---
  function selectWorktree(worktreeId) {
    if (activeWorktree === worktreeId) return;
    activeWorktree = worktreeId;

    // Update list state
    worktreeNodes.forEach(node => {
      node.classList.toggle('active', node.getAttribute('data-worktree') === worktreeId);
    });

    // Feedback logs in Terminal 1
    if (!isSimulating) {
      const p = document.createElement('p');
      p.className = 'log-line info';
      p.textContent = `Shifted active git worktree context to [${worktreeId}]...`;
      term1Logs.appendChild(p);
      term1Logs.scrollTop = term1Logs.scrollHeight;
    }
  }

  // --- EVENTS ---
  worktreeNodes.forEach(node => {
    node.addEventListener('click', () => {
      selectWorktree(node.getAttribute('data-worktree'));
    });
  });

  btnRunParallel.addEventListener('click', runParallelSimulation);

  notifBox.addEventListener('click', () => {
    notifBox.style.display = 'none';
    gitDiffBox.style.display = 'block';
    
    // Smooth scroll down to diff
    gitDiffBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // --- GENERAL UTILS ---
  const bar = document.getElementById('rp');
  const article = document.querySelector('article.post');

  function updateProgress() {
    if (!article) return;
    const rect = article.getBoundingClientRect();
    const start = rect.top + window.scrollY - 80;
    const end = rect.bottom + window.scrollY - window.innerHeight;
    const p = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start)));
    bar.style.width = (p * 100).toFixed(1) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // Smooth scroll ToC clicks
  const tocLinks = [...document.querySelectorAll('.toc a')];
  tocLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', '#' + id);
      
      // Update TOC active state
      tocLinks.forEach(lnk => lnk.classList.toggle('is-active', lnk === a));
    });
  });

})();
