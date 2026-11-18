// Fearless Draft Lab — UI layer. Plain DOM, no framework, no dependencies.
// All logic lives in engine.js; this file only renders state and wires events.
(function () {
  'use strict';
  const E = window.DraftEngine;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  // ------------------------------------------------------------------ state
  const LS_SERIES = 'fdl_series_v1';
  const LS_TEAMS = 'fdl_teams_v1';
  const LS_REPORTS = 'fdl_reports_v1';

  function lsGet(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  }

  let series = lsGet(LS_SERIES);
  if (!series || !series.current || !Array.isArray(series.games)) {
    series = E.createSeries('Cloud9', 'Opponent');
  }
  let importedTeams = lsGet(LS_TEAMS) || [];
  let savedReports = lsGet(LS_REPORTS) || [];

  const ui = {
    view: 'draft',
    draftSearch: '', draftRole: 'ALL', targetRole: null,
    scoutTeamId: 'nxf',
    champSearch: '', champRole: 'ALL', champSort: 'name', selectedChamp: null,
    aiRed: true
  };
  let aiTimer = null;

  function saveAll() {
    lsSet(LS_SERIES, series);
    lsSet(LS_TEAMS, importedTeams);
    lsSet(LS_REPORTS, savedReports);
  }
  function allTeams() { return SAMPLE_TEAMS.concat(importedTeams); }
  function scoutTeam() {
    return allTeams().find(t => t.id === ui.scoutTeamId) || SAMPLE_TEAMS[0];
  }

  let toastTimer = null;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  // ------------------------------------------------------------------ views
  function showView(v) {
    ui.view = v;
    document.querySelectorAll('.tab').forEach(b =>
      b.classList.toggle('active', b.dataset.view === v));
    document.querySelectorAll('.view').forEach(s =>
      s.classList.toggle('active', s.id === 'view-' + v));
    if (v === 'draft') renderDraft();
    if (v === 'scout') renderScout();
    if (v === 'champs') renderChamps();
    if (v === 'reports') renderReports();
  }

  function roleChipsHtml(current, onclickPrefix) {
    const roles = ['ALL'].concat(E.ROLES);
    return roles.map(r => {
      const label = r === 'ALL' ? 'All roles' : r;
      const active = r === current ? ' active' : '';
      return '<button class="chip' + active + '" onclick="' + onclickPrefix + '(\'' + r + '\')">' + label + '</button>';
    }).join('');
  }

  // ------------------------------------------------------------------ draft
  function renderDraft() {
    renderBadge();
    renderTurnBanner();
    renderBoard();
    renderWinProb();
    renderComp();
    renderReco();
    renderChampGrid();
    renderFearless();
    renderLog();
    $('draft-role-chips').innerHTML = roleChipsHtml(ui.draftRole, 'App.setDraftRole');
    renderTargetRole();
  }

  function renderBadge() {
    const winner = E.seriesWinner(series);
    $('series-badge').innerHTML = winner
      ? esc(series[winner + 'Name']) + ' wins the series ' + series.score.blue + '–' + series.score.red
      : esc(series.blueName) + ' ' + series.score.blue + ' – ' + series.score.red + ' ' + esc(series.redName) +
        ' · Game ' + series.current.number + ' of ' + series.bestOf;
  }

  function renderTurnBanner() {
    const el = $('turn-banner');
    const winner = E.seriesWinner(series);
    const step = E.getStep(series);
    if (winner) {
      el.className = 'turn-banner done';
      el.innerHTML = 'Series complete — <strong>' + esc(series[winner + 'Name']) + '</strong> wins ' +
        series.score.blue + '–' + series.score.red + '. Start a new series or review it under Reports &amp; Data.';
      return;
    }
    if (!step) {
      el.className = 'turn-banner done';
      el.innerHTML = 'Draft complete for Game ' + series.current.number +
        '. Record the result below to lock the picks into the Fearless pool and start Game ' + (series.current.number + 1) + '.';
      return;
    }
    const teamName = step.team === 'blue' ? series.blueName : series.redName;
    el.className = 'turn-banner ' + step.team;
    el.innerHTML = 'Game ' + series.current.number + ' · Step ' + (series.current.stepIndex + 1) + '/' + E.TOTAL_STEPS +
      ' — <strong>' + esc(teamName) + ' ' + step.phase.toUpperCase() + '</strong>' +
      (step.phase === 'pick' ? ' — click a champion below, or a recommendation on the right.' : ' — click a champion to ban it.');
  }

  function renderBoard() {
    $('board-blue-name').textContent = series.blueName;
    $('board-red-name').textContent = series.redName;
    const g = series.current;
    const banHtml = (bans, label) => {
      let h = '';
      for (let i = 0; i < 5; i++) {
        h += bans[i]
          ? '<span class="ban-chip">' + esc(E.champName(bans[i])) + '</span>'
          : '<span class="ban-slot">' + label + ' ban ' + (i + 1) + '</span>';
      }
      return h;
    };
    $('blue-bans').innerHTML = banHtml(g.blueBans, 'Blue');
    $('red-bans').innerHTML = banHtml(g.redBans, 'Red');
    const pickHtml = picks => E.ROLES.map(role => {
      const p = picks.find(x => x.role === role);
      if (!p) {
        return '<div class="pick-slot empty' + (ui.targetRole === role ? ' target' : '') +
          '" onclick="App.setTargetRole(\'' + role + '\')"><span class="role-tag">' + role +
          '</span><span>Empty — click to target</span><span></span></div>';
      }
      const c = E.champ(p.champ);
      return '<div class="pick-slot' + (ui.targetRole === role ? ' target' : '') +
        '" onclick="App.setTargetRole(\'' + role + '\')"><span class="role-tag">' + role +
        '</span><span class="champ-name">' + esc(c.name) + '</span><span class="champ-meta">' +
        esc(c.cls) + ' · ' + c.dmg + '</span></div>';
    }).join('');
    $('blue-picks').innerHTML = pickHtml(g.bluePicks);
    $('red-picks').innerHTML = pickHtml(g.redPicks);

    const cc = $('complete-controls');
    if (!E.getStep(series) && !E.seriesWinner(series)) {
      cc.innerHTML =
        '<button class="btn blue-win" onclick="App.completeGame(\'blue\')">' + esc(series.blueName) + ' wins Game ' + g.number + '</button>' +
        '<button class="btn red-win" onclick="App.completeGame(\'red\')">' + esc(series.redName) + ' wins Game ' + g.number + '</button>';
    } else {
      cc.innerHTML = '';
    }
  }

  function renderWinProb() {
    const g = series.current;
    const el = $('winprob');
    $('game-score').textContent = 'Game ' + g.number + ' · Series ' + series.score.blue + '–' + series.score.red;
    if (g.bluePicks.length === 0 && g.redPicks.length === 0) {
      el.innerHTML = '<div class="wp-bar"><div class="wp-blue" style="width:50%"></div></div>' +
        '<div class="wp-labels"><span>50%</span><span>50%</span></div>' +
        '<div class="wp-note">Live draft model activates after the first picks.</div>';
      return;
    }
    const d = E.draftScore(g.bluePicks, g.redPicks);
    const bp = E.winProb(d.diff);
    el.innerHTML = '<div class="wp-bar"><div class="wp-blue" style="width:' + bp + '%"></div></div>' +
      '<div class="wp-labels"><span>' + esc(series.blueName) + ' ' + bp + '%</span><span>' +
      (100 - bp) + '% ' + esc(series.redName) + '</span></div>' +
      '<div class="wp-note">Heuristic model estimate from lane matchups, synergy &amp; comp balance — not a prediction.</div>';
  }

  function renderComp() {
    const g = series.current;
    const el = $('comp-panel');
    if (g.bluePicks.length === 0 && g.redPicks.length === 0) {
      el.innerHTML = '<h2>Composition analysis</h2><p class="muted">Picks will be compared here: damage mix, engage, crowd control, range and power curve — plus the factors driving the win-rate model.</p>';
      return;
    }
    const d = E.draftScore(g.bluePicks, g.redPicks);
    const bp = d.blueProfile, rp = d.redProfile;
    const row = (label, b, r, fmt) => {
      const bf = fmt ? fmt(b) : b, rf = fmt ? fmt(r) : r;
      const bLead = b > r, rLead = r > b;
      return '<tr><td>' + label + '</td><td class="' + (bLead ? 'lead' : '') + '">' + bf +
        '</td><td class="' + (rLead ? 'lead' : '') + '">' + rf + '</td></tr>';
    };
    const one = v => (Math.round(v * 10) / 10).toFixed(1);
    el.innerHTML = '<h2>Composition analysis</h2>' +
      '<table class="comp-table"><tr><th></th><th>' + esc(series.blueName) + '</th><th>' + esc(series.redName) + '</th></tr>' +
      row('Damage mix', bp.ad + ' AD / ' + bp.ap + ' AP', rp.ad + ' AD / ' + rp.ap + ' AP') +
      row('Engage', bp.engage, rp.engage, one) +
      row('Crowd control', bp.cc, rp.cc, one) +
      row('Avg range', bp.range, rp.range) +
      row('Early power', bp.early, rp.early, one) +
      row('Late power', bp.late, rp.late, one) +
      '</table>' +
      (d.factors.length
        ? '<h3 style="margin-top:.8rem">Why the model leans this way</h3>' +
          d.factors.map(f => '<div class="factor"><span class="' + (f.side === 'blue' ? 'b' : 'r') + '">' +
            (f.side === 'blue' ? 'BLUE' : 'RED') + '</span> — ' + esc(f.text) + '</div>').join('')
        : '<p class="muted">No decisive factors yet — the draft is even.</p>');
  }

  function currentRecoRole(team) {
    const g = series.current;
    const picks = team === 'blue' ? g.bluePicks : g.redPicks;
    const taken = new Set(picks.map(p => p.role));
    if (ui.targetRole && !taken.has(ui.targetRole)) return ui.targetRole;
    const open = E.ROLES.filter(r => !taken.has(r));
    return open[0] || null;
  }

  function renderReco() {
    const el = $('reco-panel');
    const step = E.getStep(series);
    if (!step || E.seriesWinner(series)) {
      el.innerHTML = '<h2>Recommendations</h2><p class="muted">Recommendations appear during the draft.</p>';
      return;
    }
    if (step.phase === 'ban') {
      // Threat-ban suggestions: highest-value available champions.
      const pool = E.availableChamps(series).map(c => ({
        c, v: c.early + c.late + c.eng * 0.5 + c.cc * 0.5
      })).sort((a, b) => b.v - a.v).slice(0, 5);
      el.innerHTML = '<h2>Suggested bans for ' + esc(series[step.team + 'Name']) + '</h2>' +
        pool.map(x => '<div class="reco-item" onclick="App.applyChamp(\'' + x.c.id + '\')">' +
          '<div class="reco-head"><span>' + esc(x.c.name) + '</span><span class="reco-score">' +
          x.c.roles.join('/') + '</span></div>' +
          '<div class="reco-reason">High overall draft value (early ' + x.c.early + ', late ' + x.c.late +
          ', engage ' + x.c.eng + '). Click to ban.</div></div>').join('');
      return;
    }
    const role = currentRecoRole(step.team);
    if (!role) { el.innerHTML = '<h2>Recommendations</h2><p class="muted">All roles filled.</p>'; return; }
    const recs = E.recommendPicks(series, step.team, role, 5);
    const g = series.current;
    const picks = step.team === 'blue' ? g.bluePicks : g.redPicks;
    const taken = new Set(picks.map(p => p.role));
    const openRoles = E.ROLES.filter(r => !taken.has(r));
    el.innerHTML = '<h2>Counter-pick recommendations</h2>' +
      '<p class="muted">For ' + esc(series[step.team + 'Name']) + ' — pick a role:</p>' +
      '<div class="role-select">' + openRoles.map(r =>
        '<button class="chip' + (r === role ? ' active' : '') + '" onclick="App.setTargetRole(\'' + r + '\')">' + r + '</button>').join('') +
      '</div>' +
      (recs.length ? recs.map(r => '<div class="reco-item" onclick="App.applyChamp(\'' + r.champ + '\', \'' + role + '\')">' +
        '<div class="reco-head"><span>' + esc(r.name) + '</span><span class="reco-score">+' + r.score + '</span></div>' +
        '<div class="reco-reason">' + (r.reasons.length ? esc(r.reasons.join(' · ')) : 'Solid all-round fit for this slot.') + '</div></div>').join('')
        : '<p class="muted">No champions left for ' + role + '.</p>');
  }

  function renderTargetRole() {
    const step = E.getStep(series);
    const el = $('target-role');
    if (!step || step.phase !== 'pick') { el.innerHTML = ''; return; }
    el.innerHTML = '<span class="muted">Picking for role: </span>' +
      '<button class="chip' + (!ui.targetRole ? ' active' : '') + '" onclick="App.setTargetRole(null)">Auto</button> ' +
      E.ROLES.map(r => '<button class="chip' + (ui.targetRole === r ? ' active' : '') +
        '" onclick="App.setTargetRole(\'' + r + '\')">' + r + '</button>').join(' ') +
      '<span class="hint"> — or click a role slot on the board. Auto fills the first open role the champion can play.</span>';
  }

  function renderChampGrid() {
    const grid = $('champ-grid');
    const step = E.getStep(series);
    const taken = E.unavailableIds(series);
    const fearless = E.fearlessPool(series);
    const g = series.current;
    const banned = new Set(g.blueBans.concat(g.redBans));
    const picked = new Set(g.bluePicks.concat(g.redPicks).map(p => p.champ));
    const q = ui.draftSearch.trim().toLowerCase();
    let list = CHAMPIONS.filter(c =>
      (!q || c.name.toLowerCase().includes(q)) &&
      (ui.draftRole === 'ALL' || c.roles.includes(ui.draftRole)));
    const availCount = E.availableChamps(series).length;
    $('draft-hint').textContent = availCount + ' of ' + CHAMPIONS.length + ' champions available' +
      (series.fearless && series.games.length ? ' · ' + fearless.size + ' Fearless-locked' : '');
    grid.innerHTML = list.map(c => {
      const unavail = taken.has(c.id);
      let reason = '';
      if (banned.has(c.id)) reason = 'Banned';
      else if (picked.has(c.id)) reason = 'Picked';
      else if (fearless.has(c.id)) reason = 'Fearless-locked';
      const click = (!unavail && step) ? ' onclick="App.applyChamp(\'' + c.id + '\')"' : '';
      return '<button class="champ-card' + (unavail ? ' unavailable' : '') + '"' + click +
        ' title="' + esc(c.name) + ' — ' + esc(c.cls) + ', ' + c.dmg + ' damage' + (reason ? ' (' + reason + ')' : '') + '">' +
        '<div class="c-name">' + esc(c.name) + (reason ? ' · ' + reason : '') + '</div>' +
        '<div class="c-roles">' + c.roles.join(' / ') + '</div>' +
        '<div class="c-meta">' + esc(c.cls) + ' · ' + c.dmg + ' · Early ' + c.early + ' / Late ' + c.late + '</div>' +
        '<div class="mini-bar"><div style="width:' + (c.late * 10) + '%"></div></div>' +
        '</button>';
    }).join('') || '<p class="muted">No champions match this filter.</p>';
  }

  function renderFearless() {
    const el = $('fearless-pool');
    if (!series.fearless || series.games.length === 0) {
      el.innerHTML = series.fearless
        ? '<strong>Fearless Draft ON:</strong> champions picked in a completed game cannot be picked again for the rest of the series.'
        : '<strong>Fearless Draft OFF</strong> for this series.';
      return;
    }
    const pool = [...E.fearlessPool(series)].map(id => E.champName(id)).sort();
    el.innerHTML = '<strong>Fearless-locked (' + pool.length + '):</strong> ' +
      pool.map(n => '<span class="lock-chip">' + esc(n) + '</span>').join('');
  }

  function renderLog() {
    const g = series.current;
    const el = $('draft-log');
    if (!g.history.length) { el.innerHTML = ''; return; }
    let b = 0, p = 0;
    el.innerHTML = '<strong>Game ' + g.number + ' log</strong>' + g.history.map(h => {
      const n = h.kind === 'ban' ? 'B' + (++b) : 'P' + (++p);
      const teamName = h.team === 'blue' ? series.blueName : series.redName;
      return '<div>' + n + ' · ' + esc(teamName) + ' ' + h.kind + 'ned ' + esc(E.champName(h.champ)) +
        (h.role ? ' (' + h.role + ')' : '') + '</div>';
    }).join('');
  }

  // ---------------------------------------------------------- draft actions
  function afterAction() {
    saveAll();
    renderDraft();
    maybeAiRed();
  }

  function maybeAiRed() {
    clearTimeout(aiTimer);
    if (!ui.aiRed) return;
    const step = E.getStep(series);
    if (!step || step.team !== 'red' || E.seriesWinner(series)) return;
    aiTimer = setTimeout(() => {
      const move = E.aiChoose(series, 'red');
      if (move) {
        try { E.applyAction(series, move.champ, move.role); } catch (e) { toast(e.message); return; }
        afterAction();
      }
    }, 450);
  }

  function applyChamp(champId, role) {
    clearTimeout(aiTimer);
    try {
      E.applyAction(series, champId, role || ui.targetRole || undefined);
    } catch (e) { toast(e.message); return; }
    afterAction();
  }

  function aiMove() {
    clearTimeout(aiTimer);
    const step = E.getStep(series);
    if (!step) { toast('Draft is complete — record the game result.'); return; }
    const move = E.aiChoose(series, step.team);
    if (!move) { toast('AI has no legal move.'); return; }
    try { E.applyAction(series, move.champ, move.role); } catch (e) { toast(e.message); return; }
    toast('AI ' + move.kind + 's ' + E.champName(move.champ) + (move.role ? ' (' + move.role + ')' : ''));
    afterAction();
  }

  function autoPlay() {
    clearTimeout(aiTimer);
    let guard = 0;
    while (E.getStep(series) && guard++ < 25) {
      const step = E.getStep(series);
      const move = E.aiChoose(series, step.team);
      if (!move) break;
      try { E.applyAction(series, move.champ, move.role); } catch (e) { toast(e.message); break; }
    }
    afterAction();
  }

  function undo() {
    clearTimeout(aiTimer);
    const lastBefore = series.current.history[series.current.history.length - 1];
    if (!E.undo(series)) { toast('Nothing to undo.'); return; }
    // If the undone move was the AI's (red), also undo the user's move
    // before it so the user replays their own turn.
    if (ui.aiRed && lastBefore && lastBefore.team === 'red') E.undo(series);
    saveAll();
    renderDraft();
  }

  function resetGame() {
    clearTimeout(aiTimer);
    E.resetGame(series);
    saveAll();
    renderDraft();
    toast('Game ' + series.current.number + ' draft reset.');
  }

  function completeGame(winner) {
    clearTimeout(aiTimer);
    try { E.completeGame(series, winner); } catch (e) { toast(e.message); return; }
    const w = E.seriesWinner(series);
    saveAll();
    renderDraft();
    toast(w
      ? series[w + 'Name'] + ' wins the series ' + series.score.blue + '–' + series.score.red + '!'
      : series[winner + 'Name'] + ' takes Game ' + series.games[series.games.length - 1].number +
        '. Picks are now Fearless-locked.');
  }

  function newSeries() {
    clearTimeout(aiTimer);
    const blue = $('setup-blue').value.trim() || 'Cloud9';
    const red = $('setup-red').value.trim() || 'Opponent';
    const bestOf = parseInt($('setup-bestof').value, 10) === 3 ? 3 : 5;
    const fearless = $('setup-fearless').checked;
    ui.aiRed = $('setup-ai-red').checked;
    ui.targetRole = null;
    series = E.createSeries(blue, red, { bestOf, fearless });
    saveAll();
    renderDraft();
    toast('New ' + (fearless ? 'Fearless ' : '') + 'best-of-' + bestOf + ' series: ' + blue + ' vs ' + red + '.');
  }

  function setDraftSearch(v) { ui.draftSearch = v; renderChampGrid(); }
  function setDraftRole(r) { ui.draftRole = r; renderDraft(); }
  function setTargetRole(r) {
    ui.targetRole = r;
    renderBoard();
    renderReco();
    renderTargetRole();
  }

  // ---------------------------------------------------------------- scouting
  function renderScoutSelect() {
    const sel = $('scout-team-select');
    sel.innerHTML = allTeams().map(t =>
      '<option value="' + esc(t.id) + '"' + (t.id === ui.scoutTeamId ? ' selected' : '') + '>' +
      esc(t.tag + ' — ' + t.name) + (t.sample ? ' (sample)' : ' (imported)') + '</option>').join('');
  }

  function setScoutTeam(id) { ui.scoutTeamId = id; renderScout(); }

  function barRow(label, value, max, display) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return '<div class="tendency"><div class="t-head"><span>' + label + '</span><strong>' +
      display + '</strong></div><div class="t-bar"><div style="width:' + pct + '%"></div></div></div>';
  }

  function renderScout() {
    renderScoutSelect();
    const t = scoutTeam();
    const el = $('scout-content');
    const ten = t.tendencies || {};
    const rateList = (arr, label) => (arr || []).map(x =>
      '<div class="shift-row">' + esc(E.champName(x.champ)) + ' — <strong>' + x.rate + '%</strong></div>').join('')
      || '<p class="muted">No ' + label + ' data.</p>';

    const playersHtml = t.players.map(p => {
      const tot = E.playerTotals(p);
      return '<div class="player-card"><div class="p-head"><span>' + esc(p.name) +
        ' · ' + esc(p.role) + '</span><span>' + tot.games + ' games · ' + tot.winRate + '% WR</span></div>' +
        '<div class="pool-row head"><span>Champion</span><span>Games</span><span>Win rate</span><span></span></div>' +
        p.pool.map(e => '<div class="pool-row"><span>' + esc(E.champName(e.champ)) + '</span><span>' + e.games +
          '</span><span>' + E.poolWinRate(e) + '%</span><span><div class="mini-bar"><div style="width:' +
          E.poolWinRate(e) + '%"></div></div></span></div>').join('') + '</div>';
    }).join('');

    const insights = E.insightsForTeam(t);
    const insightsHtml = insights.map(i =>
      '<div class="insight ' + i.priority + '"><div class="i-title"><span class="pri">' + i.priority +
      '</span>' + esc(i.title) + '</div><div class="i-detail">' + esc(i.detail) + '</div></div>').join('');

    let shiftHtml;
    if (series.games.length > 0) {
      const shift = E.fearlessShift(t, series);
      shiftHtml = '<div class="panel"><h2>Fearless shift — after Game ' + series.games.length +
        ' vs ' + esc(series.redName) + '</h2><p class="muted">How this opponent\'s champion pools look with the current series\' Fearless locks applied.</p>' +
        shift.map(s => '<div class="shift-row"><strong>' + esc(s.player) + '</strong> (' + esc(s.role) + '): ' +
          (s.lost.length ? '<span class="lost">lost ' + esc(s.lost.join(', ')) + '</span> · ' : '') +
          (s.remaining.length
            ? '<span class="left">' + s.remaining.map(r => esc(r.champ) + ' ' + r.winRate + '%').join(', ') + '</span>' +
              ' — remaining pool WR ' + (s.remainingWinRate === null ? 'n/a' : s.remainingWinRate + '%')
            : '<span class="lost">pool exhausted — off comfort picks entirely</span>') +
          '</div>').join('') + '</div>';
    } else {
      shiftHtml = '<div class="panel"><h2>Fearless shift</h2><p class="muted">Complete a game in the Draft Lab and this panel will show how the opponent\'s champion pools shrink as Fearless locks pile up.</p></div>';
    }

    el.innerHTML =
      '<div class="panel"><h2>' + esc(t.tag) + ' — ' + esc(t.name) +
      (t.sample ? ' <span class="sample-note">(synthetic sample data)</span>' : ' <span class="sample-note">(imported)</span>') +
      '</h2><p class="muted">' + esc(t.region || '') + '</p></div>' +
      '<div class="scout-grid">' +
      '<div class="panel"><h2>Macro tendencies</h2>' +
      (typeof ten.firstBlood === 'number' ? barRow('First blood', ten.firstBlood, 100, ten.firstBlood + '%') : '') +
      (typeof ten.firstDragon === 'number' ? barRow('First dragon', ten.firstDragon, 100, ten.firstDragon + '%') : '') +
      (typeof ten.firstHerald === 'number' ? barRow('First Herald', ten.firstHerald, 100, ten.firstHerald + '%') : '') +
      (typeof ten.earlyRating === 'number' ? barRow('Early-game rating', ten.earlyRating, 10, ten.earlyRating + ' / 10') : '') +
      (typeof ten.teamfightRating === 'number' ? barRow('Teamfight rating', ten.teamfightRating, 10, ten.teamfightRating + ' / 10') : '') +
      (typeof ten.objectiveRating === 'number' ? barRow('Objective control', ten.objectiveRating, 10, ten.objectiveRating + ' / 10') : '') +
      (typeof ten.avgGameTimeMin === 'number' ? '<p>Average game length: <strong>' + ten.avgGameTimeMin + ' min</strong></p>' : '') +
      (typeof ten.wardsPerMin === 'number' ? '<p>Wards per minute: <strong>' + ten.wardsPerMin + '</strong></p>' : '') +
      '<h3 style="margin-top:1rem">Game 1 pick rates</h3>' + rateList(t.game1PickRates, 'pick-rate') +
      '<h3 style="margin-top:1rem">Their ban tendencies</h3>' + rateList(t.banTendencies, 'ban') +
      '</div>' +
      '<div><div class="panel"><h2>Player champion pools</h2>' + playersHtml + '</div>' +
      '<div class="panel"><h2>How to Win — data-backed insights</h2>' + insightsHtml + '</div></div>' +
      '</div>' + shiftHtml;
  }

  // --------------------------------------------------------------- champions
  function renderChamps() {
    $('champ-role-chips').innerHTML = roleChipsHtml(ui.champRole, 'App.setChampRole');
    const q = ui.champSearch.trim().toLowerCase();
    let list = CHAMPIONS.filter(c =>
      (!q || c.name.toLowerCase().includes(q)) &&
      (ui.champRole === 'ALL' || c.roles.includes(ui.champRole)));
    const sorters = {
      name: (a, b) => a.name.localeCompare(b.name),
      early: (a, b) => b.early - a.early || a.name.localeCompare(b.name),
      late: (a, b) => b.late - a.late || a.name.localeCompare(b.name),
      diff: (a, b) => b.diff - a.diff || a.name.localeCompare(b.name)
    };
    list.sort(sorters[ui.champSort] || sorters.name);
    $('champ-count').textContent = list.length + ' champions';
    $('champ-db-grid').innerHTML = list.map(c =>
      '<button class="champ-card' + (ui.selectedChamp === c.id ? ' selected' : '') +
      '" onclick="App.selectChamp(\'' + c.id + '\')">' +
      '<div class="c-name">' + esc(c.name) + '</div>' +
      '<div class="c-roles">' + c.roles.join(' / ') + '</div>' +
      '<div class="c-meta">' + esc(c.cls) + ' · ' + c.dmg + ' · Early ' + c.early + ' / Late ' + c.late + '</div>' +
      '<div class="mini-bar"><div style="width:' + (c.late * 10) + '%"></div></div>' +
      '</button>').join('') || '<p class="muted">No champions match this filter.</p>';
    renderChampDetail();
  }

  function renderChampDetail() {
    const el = $('champ-detail');
    const c = ui.selectedChamp ? E.champ(ui.selectedChamp) : null;
    if (!c) { el.innerHTML = ''; return; }
    const linkList = ids => ids.length
      ? '<ul>' + ids.map(id => '<li onclick="App.selectChamp(\'' + id + '\')">' + esc(E.champName(id)) + '</li>').join('') + '</ul>'
      : '<p class="muted">None recorded.</p>';
    el.innerHTML = '<div class="champ-detail"><h2>' + esc(c.name) +
      ' <span class="muted">— ' + esc(c.cls) + ' · ' + c.dmg + ' damage · ' + c.roles.join('/') + '</span></h2>' +
      '<p>Attack range ' + c.rng + ' · Difficulty ' + c.diff + '/10 · Early ' + c.early + '/10 · Late ' + c.late +
      '/10 · Engage ' + c.eng + ' · CC ' + c.cc + ' · Mobility ' + c.mob + '</p>' +
      '<div class="d-grid"><div><h3>Strong against</h3>' + linkList(c.beats) + '</div>' +
      '<div><h3>Weak against</h3>' + linkList(c.loses) + '</div>' +
      '<div><h3>Pairs well with</h3>' + linkList(c.pairs) + '</div></div>' +
      '<p><button class="btn" onclick="App.selectChamp(null)">Close detail</button></p></div>';
  }

  function setChampSearch(v) { ui.champSearch = v; renderChamps(); }
  function setChampRole(r) { ui.champRole = r; renderChamps(); }
  function setChampSort(v) { ui.champSort = v; renderChamps(); }
  function selectChamp(id) {
    ui.selectedChamp = id;
    renderChamps();
    if (id) $('champ-detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---------------------------------------------------------------- reports
  function renderReports() {
    renderSeriesReport();
    renderSavedReports();
    renderImportedTeams();
  }

  function renderSeriesReport() {
    const el = $('series-report');
    const g = series.current;
    const pickList = picks => picks.length
      ? picks.map(p => esc(E.champName(p.champ)) + ' (' + p.role + ')').join(', ')
      : '—';
    const banList = bans => bans.length ? bans.map(b => esc(E.champName(b))).join(', ') : '—';
    let gamesHtml;
    if (!series.games.length && g.stepIndex === 0) {
      gamesHtml = '<p class="muted">No games yet — run a draft in the Draft Lab.</p>';
    } else {
      gamesHtml = '<table class="report"><tr><th>Game</th><th>Winner</th><th>' + esc(series.blueName) +
        ' picks</th><th>' + esc(series.blueName) + ' bans</th><th>' + esc(series.redName) +
        ' picks</th><th>' + esc(series.redName) + ' bans</th></tr>' +
        series.games.map(game => '<tr><td>' + game.number + '</td><td>' +
          esc(series[game.winner + 'Name']) + '</td><td>' + pickList(game.bluePicks) + '</td><td>' +
          banList(game.blueBans) + '</td><td>' + pickList(game.redPicks) + '</td><td>' +
          banList(game.redBans) + '</td></tr>').join('') +
        (g.stepIndex > 0 && !E.seriesWinner(series)
          ? '<tr><td>' + g.number + ' (in progress)</td><td>—</td><td>' + pickList(g.bluePicks) + '</td><td>' +
            banList(g.blueBans) + '</td><td>' + pickList(g.redPicks) + '</td><td>' + banList(g.redBans) + '</td></tr>'
          : '') +
        '</table>';
    }
    const winner = E.seriesWinner(series);
    el.innerHTML = '<h2>Series report — ' + esc(series.blueName) + ' vs ' + esc(series.redName) + '</h2>' +
      '<p><strong>Score: ' + series.score.blue + '–' + series.score.red + '</strong> · Best of ' + series.bestOf +
      ' · Fearless Draft ' + (series.fearless ? 'ON' : 'OFF') +
      (winner ? ' · <span class="ok">Series won by ' + esc(series[winner + 'Name']) + '</span>' : '') + '</p>' +
      gamesHtml;
  }

  function renderSavedReports() {
    const el = $('saved-reports');
    if (!savedReports.length) { el.innerHTML = '<p class="muted">No saved reports yet.</p>'; return; }
    el.innerHTML = savedReports.map((r, i) =>
      '<div class="saved-item"><div><strong>' + esc(r.name) + '</strong><div class="s-meta">' +
      esc(r.series.blueName) + ' ' + r.series.score.blue + '–' + r.series.score.red + ' ' + esc(r.series.redName) +
      ' · ' + r.series.games.length + ' game(s) · saved ' + esc(r.savedAt) + '</div></div>' +
      '<div><button class="btn" onclick="App.loadReport(' + i + ')">Load</button> ' +
      '<button class="btn" onclick="App.deleteReport(' + i + ')">Delete</button></div></div>').join('');
  }

  function renderImportedTeams() {
    const el = $('imported-teams');
    if (!importedTeams.length) { el.innerHTML = ''; return; }
    el.innerHTML = '<h3 style="margin-top:1rem">Imported teams</h3>' + importedTeams.map((t, i) =>
      '<div class="saved-item"><div><strong>' + esc(t.tag + ' — ' + t.name) + '</strong><div class="s-meta">' +
      t.players.length + ' players · stored locally</div></div>' +
      '<div><button class="btn" onclick="App.deleteImportedTeam(' + i + ')">Delete</button></div></div>').join('');
  }

  function saveReport() {
    const name = $('report-name').value.trim() ||
      (series.blueName + ' vs ' + series.redName + ' — ' + new Date().toLocaleString());
    savedReports.unshift({
      name,
      savedAt: new Date().toLocaleString(),
      series: JSON.parse(JSON.stringify(series))
    });
    saveAll();
    $('report-name').value = '';
    renderSavedReports();
    toast('Report saved: ' + name);
  }

  function loadReport(i) {
    const r = savedReports[i];
    if (!r) return;
    series = JSON.parse(JSON.stringify(r.series));
    ui.targetRole = null;
    saveAll();
    showView('draft');
    toast('Loaded report: ' + r.name);
  }

  function deleteReport(i) {
    savedReports.splice(i, 1);
    saveAll();
    renderSavedReports();
  }

  function exportSeries() {
    const blob = new Blob([JSON.stringify(series, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fearless-draft-series-' + series.blueName + '-vs-' + series.redName + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Series exported as JSON.');
  }

  function fillSampleImport() {
    $('import-json').value = JSON.stringify({
      name: 'Example Rivals', tag: 'EXR', region: 'Example — imported',
      tendencies: { firstBlood: 55, firstDragon: 60, firstHerald: 50, avgGameTimeMin: 31.5, wardsPerMin: 2.0, earlyRating: 7.0, teamfightRating: 7.5, objectiveRating: 7.2 },
      banTendencies: [{ champ: 'azir', rate: 70 }, { champ: 'sejuani', rate: 60 }],
      game1PickRates: [{ champ: 'vi', rate: 65 }, { champ: 'kalista', rate: 50 }],
      players: [
        { name: 'TopLaner', role: 'TOP', pool: [{ champ: 'ksante', games: 10, wins: 6 }, { champ: 'aatrox', games: 6, wins: 3 }] },
        { name: 'Jungler', role: 'JGL', pool: [{ champ: 'vi', games: 12, wins: 8 }, { champ: 'sejuani', games: 6, wins: 3 }] },
        { name: 'MidLaner', role: 'MID', pool: [{ champ: 'azir', games: 10, wins: 6 }, { champ: 'orianna', games: 8, wins: 4 }] },
        { name: 'BotLaner', role: 'ADC', pool: [{ champ: 'kalista', games: 9, wins: 5 }, { champ: 'jinx', games: 7, wins: 4 }] },
        { name: 'Support', role: 'SUP', pool: [{ champ: 'rakan', games: 10, wins: 6 }, { champ: 'thresh', games: 6, wins: 3 }] }
      ]
    }, null, 2);
  }

  function importScout() {
    const raw = $('import-json').value.trim();
    const out = $('import-result');
    if (!raw) { out.innerHTML = '<p class="err">Paste a team JSON profile first.</p>'; return; }
    let obj;
    try { obj = JSON.parse(raw); } catch (e) { out.innerHTML = '<p class="err">Invalid JSON: ' + esc(e.message) + '</p>'; return; }
    const v = E.validateScoutImport(obj);
    if (!v.ok) {
      out.innerHTML = '<p class="err">Import rejected:</p><ul>' +
        v.errors.map(e => '<li>' + esc(e) + '</li>').join('') + '</ul>';
      return;
    }
    const id = 'imp-' + (obj.tag || obj.name).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    obj.id = id;
    obj.sample = false;
    importedTeams.push(obj);
    ui.scoutTeamId = id;
    saveAll();
    renderScoutSelect();
    renderImportedTeams();
    out.innerHTML = '<p class="ok">Imported ' + esc(obj.name) + ' (' + obj.players.length +
      ' players). It now appears in the Scouting team selector.</p>';
    toast('Scouting profile imported: ' + obj.name);
  }

  function deleteImportedTeam(i) {
    const t = importedTeams[i];
    importedTeams.splice(i, 1);
    if (ui.scoutTeamId === t.id) ui.scoutTeamId = 'nxf';
    saveAll();
    renderScoutSelect();
    renderImportedTeams();
  }

  // ------------------------------------------------------------------- init
  function init() {
    $('setup-blue').value = series.blueName;
    $('setup-red').value = series.redName;
    $('setup-bestof').value = String(series.bestOf);
    $('setup-fearless').checked = series.fearless;
    $('setup-ai-red').checked = ui.aiRed;
    $('setup-ai-red').addEventListener('change', e => {
      ui.aiRed = e.target.checked;
      maybeAiRed();
    });
    renderDraft();
  }

  window.App = {
    showView, newSeries, applyChamp, aiMove, autoPlay, undo, resetGame, completeGame,
    setDraftSearch, setDraftRole, setTargetRole,
    setScoutTeam,
    setChampSearch, setChampRole, setChampSort, selectChamp,
    saveReport, loadReport, deleteReport, exportSeries,
    fillSampleImport, importScout, deleteImportedTeam
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
