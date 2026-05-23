/**
 * Subagent Designs — Refined Inline Interactive Script
 */

(() => {
  // --- LEVEL 1: CATALOG TABS ---
  const catalogTabs = document.querySelectorAll('.catalog-tab');
  const catalogPanels = document.querySelectorAll('.catalog-panel');

  catalogTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');

      // Update tabs active state
      catalogTabs.forEach(t => t.classList.toggle('active', t === tab));

      // Update panels active state
      catalogPanels.forEach(panel => {
        panel.classList.toggle('active', panel.getAttribute('id') === `panel-${tabId}`);
      });
    });
  });

  // --- LEVEL 3: DAG GRAPH SIMULATOR ---
  let isDagSimulating = false;
  let dagTimeout = null;
  const btnRunDag = document.getElementById('btnRunDag');
  const dagStatus = document.getElementById('dagStatus');
  const dagConsole = document.getElementById('dagConsole');

  // Mermaid nodes highlighting maps
  function highlightMermaidNode(labelText, highlightType = 'cyan') {
    const nodes = document.querySelectorAll('.mermaid .node');
    nodes.forEach(node => {
      const textEl = node.querySelector('.label') || node;
      if (textEl.textContent.toLowerCase().replace(/&amp;/g, '&').includes(labelText.toLowerCase())) {
        const shapes = node.querySelectorAll('rect, polygon, circle, path, .label-container');
        shapes.forEach(shape => {
          shape.classList.add(highlightType === 'purple' ? 'dag-node-highlight-purple' : 'dag-node-highlight');
        });
      }
    });
  }

  function clearMermaidHighlights() {
    document.querySelectorAll('.mermaid .node rect, .mermaid .node polygon, .mermaid .node circle, .mermaid .node path, .mermaid .node .label-container').forEach(shape => {
      shape.classList.remove('dag-node-highlight', 'dag-node-highlight-purple');
    });
  }

  // Refactored to represent true parallel execution waves
  const dagWaves = [
    {
      logs: [
        { text: 'DAG-LEAD: Decomposing task requirements...', type: 'cmd' }
      ],
      nodes: [
        { label: 'Tech Lead', color: 'purple' }
      ],
      clearPrevious: true,
      delayAfter: 700
    },
    {
      logs: [
        { text: 'DAG-LEAD: Spawning Backend, Frontend, and QA branches in parallel.', type: 'cmd' },
        { text: 'BACKEND: Initializing API endpoints setup...', type: 'output' },
        { text: 'FRONTEND: Mapping UI component layouts...', type: 'output' },
        { text: 'QA-LEAD: Structuring integration test scope...', type: 'info' }
      ],
      nodes: [
        { label: 'Backend', color: 'cyan' },
        { label: 'Frontend', color: 'cyan' },
        { label: 'QA Lead', color: 'purple' }
      ],
      clearPrevious: false,
      delayAfter: 1200
    },
    {
      logs: [
        { text: 'BACKEND: Spawning Migration and Handlers child workers in parallel...', type: 'info' },
        { text: 'FRONTEND: Spawning Components and State child workers in parallel...', type: 'info' }
      ],
      nodes: [
        { label: 'Migration', color: 'cyan' },
        { label: 'Handlers', color: 'cyan' },
        { label: 'Components', color: 'cyan' },
        { label: 'State', color: 'cyan' }
      ],
      clearPrevious: false,
      delayAfter: 1000
    },
    {
      logs: [
        { text: 'MIGRATION: Schema successfully migrated.', type: 'success' },
        { text: 'COMPONENTS: Responsive LoginBox constructed.', type: 'success' },
        { text: 'HANDLERS: Endpoint /api/v2/auth active.', type: 'success' },
        { text: 'STATE: Redux state sync completed.', type: 'success' }
      ],
      nodes: [], // Keep active nodes highlighted
      clearPrevious: false,
      delayAfter: 1200
    },
    {
      logs: [
        { text: 'QA-LEAD: Executing parallel unit & integration tests...', type: 'cmd' },
        { text: 'UNIT-TESTS: Running 24 local unit assertions...', type: 'output' },
        { text: 'INTEGRATION: Performing Puppeteer end-to-end check...', type: 'output' }
      ],
      nodes: [
        { label: 'Unit Tests', color: 'cyan' },
        { label: 'Integration', color: 'cyan' }
      ],
      clearPrevious: true, // clear details, keep test scopes focused
      delayAfter: 1200
    },
    {
      logs: [
        { text: 'UNIT-TESTS: ✓ All 24 unit assertions successful.', type: 'success' },
        { text: 'INTEGRATION: ✓ E2E user auth flow verified.', type: 'success' },
        { text: 'DAG-LEAD: All team branches verified. Merging branch clean.', type: 'success' }
      ],
      nodes: [
        { label: 'Tech Lead', color: 'purple' }
      ],
      clearPrevious: true,
      delayAfter: 800
    }
  ];

  function runDagSimulation() {
    if (isDagSimulating) return;

    isDagSimulating = true;
    btnRunDag.disabled = true;
    btnRunDag.textContent = 'Executing graph...';
    dagStatus.classList.add('active');
    dagStatus.querySelector('span:last-child').textContent = 'EXECUTING';
    dagConsole.style.display = 'block';
    dagConsole.innerHTML = '';
    clearMermaidHighlights();

    let waveIdx = 0;

    function executeWave() {
      if (!isDagSimulating || waveIdx >= dagWaves.length) {
        finishDagSimulation();
        return;
      }

      const wave = dagWaves[waveIdx];

      // Highlight/Clear nodes in parallel
      if (wave.clearPrevious) {
        clearMermaidHighlights();
      }
      wave.nodes.forEach(node => {
        highlightMermaidNode(node.label, node.color);
      });

      // Stream logs for this wave with very short staggered delays to mimic concurrency
      let logIdx = 0;
      function printWaveLog() {
        if (!isDagSimulating) return;
        if (logIdx < wave.logs.length) {
          const log = wave.logs[logIdx];
          const line = document.createElement('p');
          line.className = `inline-console-line ${log.type === 'info' ? 'cmd' : log.type}`;
          line.textContent = log.text;
          dagConsole.appendChild(line);
          dagConsole.scrollTop = dagConsole.scrollHeight;

          logIdx++;
          setTimeout(printWaveLog, 150); // fast staggered stdout prints
        } else {
          // Finished this wave, schedule next wave
          waveIdx++;
          dagTimeout = setTimeout(executeWave, wave.delayAfter || 800);
        }
      }

      printWaveLog();
    }

    executeWave();
  }

  function finishDagSimulation() {
    isDagSimulating = false;
    btnRunDag.disabled = false;
    btnRunDag.textContent = 'Run Graph Simulation';
    dagStatus.classList.remove('active');
    dagStatus.querySelector('span:last-child').textContent = 'ONLINE';
    setTimeout(clearMermaidHighlights, 3000);
  }

  btnRunDag.addEventListener('click', runDagSimulation);

  // --- GENERAL READING UTILITIES ---
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
