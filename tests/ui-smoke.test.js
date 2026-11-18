// Fearless Draft Lab — UI smoke tests (plain Node, no dependencies).
// ---------------------------------------------------------------------------
// These tests load the REAL app.js in a Node vm context with a small,
// purpose-built DOM shim (elements, innerHTML, classList, localStorage).
// They exercise every view and the main user flows end to end: full draft,
// Fearless locking, undo, scouting, champion detail, reports, import.
// This is NOT a real browser: layout, CSS, and real event dispatch are not
// covered here. For a real-browser check, serve the project and open
// tests/browser-harness.html, which drives the app in an iframe.
// Run: node --test tests/ui-smoke.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------- DOM shim
class El {
  constructor(id) {
    this.id = id;
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.checked = false;
    this.dataset = {};
    this._cls = new Set();
    this._listeners = {};
    this.children = [];
  }
  get classList() {
    const set = this._cls;
    return {
      add: c => set.add(c),
      remove: c => set.delete(c),
      toggle: (c, force) => {
        if (force === undefined) { set.has(c) ? set.delete(c) : set.add(c); }
        else if (force) set.add(c); else set.delete(c);
      },
      contains: c => set.has(c)
    };
  }
  addEventListener(ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); }
  appendChild(child) { this.children.push(child); return child; }
  remove() { /* stub */ }
  click() { /* stub: tests call App.* directly */ }
  scrollIntoView() { /* stub */ }
}

function loadApp() {
  const elements = new Map();
  const el = id => {
    if (!elements.has(id)) elements.set(id, new El(id));
    return elements.get(id);
  };
  const tabs = ['draft', 'scout', 'champs', 'reports'].map(v => {
    const t = new El('tab-' + v);
    t.dataset.view = v;
    return t;
  });
  const views = ['draft', 'scout', 'champs', 'reports'].map(v => new El('view-' + v));
  const store = new Map();
  const sandbox = {
    console,
    setTimeout, clearTimeout,
    Blob: class { constructor(parts) { this.parts = parts; } },
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k)
    },
    document: {
      readyState: 'complete',
      getElementById: id => el(id),
      querySelectorAll: sel => (sel === '.tab' ? tabs : sel === '.view' ? views : []),
      createElement: tag => new El(tag),
      body: new El('body'),
      addEventListener: () => {}
    }
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const file of ['data.js', 'engine.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox, { filename: file });
  }
  return { App: sandbox.App, el, elements, store };
}

function count(html, needle) { return html.split(needle).length - 1; }

// ------------------------------------------------------------------- tests
test('ui: draft view renders with 88 champions and a BAN first step', () => {
  const { App, el } = loadApp();
  assert.ok(App, 'App global exists');
  assert.match(el('turn-banner').innerHTML, /BAN/);
  assert.equal(count(el('champ-grid').innerHTML, 'champ-card'), 88);
  assert.match(el('winprob').innerHTML, /50%/);
  assert.equal(count(el('reco-panel').innerHTML, 'reco-item'), 5);
});

test('ui: full draft via auto-play, then Fearless locks after game 1', async () => {
  const { App, el } = loadApp();
  App.autoPlay();
  assert.match(el('turn-banner').innerHTML, /Draft complete/);
  assert.equal(count(el('blue-picks').innerHTML, 'pick-slot'), 5);
  assert.equal(count(el('red-picks').innerHTML, 'pick-slot'), 5);
  assert.equal(count(el('blue-picks').innerHTML, 'pick-slot empty'), 0);
  assert.doesNotMatch(el('winprob').innerHTML, /activates after/);
  App.completeGame('blue');
  assert.match(el('series-badge').innerHTML, /1 – 0/);
  assert.equal(count(el('fearless-pool').innerHTML, 'lock-chip'), 10);
  assert.match(el('turn-banner').innerHTML, /Game 2/);
  // Game 2 grid: 10 champions are Fearless-locked (labelled in the card name).
  assert.equal(count(el('champ-grid').innerHTML, ' · Fearless-locked'), 10);
});

test('ui: manual ban + AI red reply + undo returns to step 1', async () => {
  const { App, el } = loadApp();
  // User bans Azir (step 1, blue). AI red auto-replies after ~450ms.
  App.applyChamp('azir');
  assert.match(el('turn-banner').innerHTML, /Step 2\/20/);
  await sleep(700);
  assert.match(el('turn-banner').innerHTML, /Step 3\/20/);
  assert.equal(count(el('blue-bans').innerHTML, 'ban-chip'), 1);
  assert.equal(count(el('red-bans').innerHTML, 'ban-chip'), 1);
  // Undo reverts both the AI move and the user's move.
  App.undo();
  assert.match(el('turn-banner').innerHTML, /Step 1\/20/);
  assert.equal(count(el('blue-bans').innerHTML, 'ban-chip'), 0);
});

test('ui: invalid champion shows an error toast, draft unchanged', () => {
  const { App, el } = loadApp();
  App.applyChamp('not-a-champ');
  assert.match(el('toast').textContent, /Unknown champion/);
  assert.match(el('turn-banner').innerHTML, /Step 1\/20/);
});

test('ui: scouting view renders profiles, insights and fearless shift', () => {
  const { App, el } = loadApp();
  App.autoPlay();
  App.completeGame('blue');
  App.showView('scout');
  const html = el('scout-content').innerHTML;
  assert.match(html, /Northwind Foxes/);
  assert.match(html, /Ban Sejuani early/);
  assert.match(html, /Burrow/);
  assert.match(html, /Fearless shift/);
  // Switch to a different team.
  App.setScoutTeam('psn');
  assert.match(el('scout-content').innerHTML, /Pacific Sentinels/);
  assert.match(el('scout-content').innerHTML, /Close before 30 minutes/);
});

test('ui: champion database renders, filters and opens detail', () => {
  const { App, el } = loadApp();
  App.showView('champs');
  assert.equal(count(el('champ-db-grid').innerHTML, 'champ-card'), 88);
  App.setChampRole('SUP');
  const supCount = count(el('champ-db-grid').innerHTML, 'champ-card');
  assert.ok(supCount >= 10 && supCount < 88, 'SUP filter narrows the grid, got ' + supCount);
  App.setChampRole('ALL');
  App.setChampSearch('azir');
  assert.equal(count(el('champ-db-grid').innerHTML, 'champ-card'), 1);
  App.setChampSearch('');
  App.selectChamp('azir');
  const detail = el('champ-detail').innerHTML;
  assert.match(detail, /Azir/);
  assert.match(detail, /Strong against/);
  assert.match(detail, /Weak against/);
});

test('ui: reports view, save/load, export, and import validation', () => {
  const { App, el } = loadApp();
  App.autoPlay();
  App.completeGame('red');
  App.showView('reports');
  assert.match(el('series-report').innerHTML, /Score: 0–1/);
  assert.match(el('series-report').innerHTML, /Game/);
  // Save + load round-trip.
  el('report-name').value = 'Smoke report';
  App.saveReport();
  assert.match(el('saved-reports').innerHTML, /Smoke report/);
  App.newSeries();
  assert.match(el('series-badge').innerHTML, /0 – 0/);
  App.loadReport(0);
  assert.match(el('series-badge').innerHTML, /0 – 1/);
  // Export must not throw.
  App.showView('reports');
  assert.doesNotThrow(() => App.exportSeries());
  // Import: invalid rejected, valid example accepted.
  el('import-json').value = '{"name": 123}';
  App.importScout();
  assert.match(el('import-result').innerHTML, /rejected/i);
  App.fillSampleImport();
  App.importScout();
  assert.match(el('import-result').innerHTML, /Imported Example Rivals/);
  // Imported team appears in the scouting selector.
  App.showView('scout');
  assert.match(el('scout-team-select').innerHTML, /Example Rivals/);
});
