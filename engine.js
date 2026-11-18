// Fearless Draft Lab — core engine (pure logic, no DOM).
// Works in the browser (classic <script>, globals from data.js) and in Node
// tests (require). Covers: draft state machine, Fearless Draft series rules,
// matchup / composition scoring, pick recommendations, and scouting insights.

(function (root, factory) {
  // Node: load data via require. Browser / vm: classic <script> globals —
  // top-level `const` in data.js lives in the shared global lexical scope,
  // NOT as a property of window, so resolve the bare identifiers (with a
  // root-property fallback for environments that attach them).
  const deps = (typeof require === 'function')
    ? require('./data.js')
    : {
        CHAMPIONS: typeof CHAMPIONS !== 'undefined' ? CHAMPIONS : root.CHAMPIONS,
        ROLES: typeof ROLES !== 'undefined' ? ROLES : root.ROLES,
        SAMPLE_TEAMS: typeof SAMPLE_TEAMS !== 'undefined' ? SAMPLE_TEAMS : root.SAMPLE_TEAMS
      };
  const api = factory(deps);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DraftEngine = api;
})(typeof self !== 'undefined' ? self : this, function ({ CHAMPIONS, ROLES }) {

  const CHAMP_BY_ID = new Map(CHAMPIONS.map(c => [c.id, c]));
  function champ(id) { return CHAMP_BY_ID.get(id) || null; }
  function champName(id) { const c = champ(id); return c ? c.name : id; }

  // Official LoL pick/ban order: 6 bans, 6 picks, 4 bans, 4 picks.
  const DRAFT_ORDER = [
    { phase: 'ban', team: 'blue' }, { phase: 'ban', team: 'red' },
    { phase: 'ban', team: 'blue' }, { phase: 'ban', team: 'red' },
    { phase: 'ban', team: 'blue' }, { phase: 'ban', team: 'red' },
    { phase: 'pick', team: 'blue' },
    { phase: 'pick', team: 'red' }, { phase: 'pick', team: 'red' },
    { phase: 'pick', team: 'blue' }, { phase: 'pick', team: 'blue' },
    { phase: 'pick', team: 'red' },
    { phase: 'ban', team: 'red' }, { phase: 'ban', team: 'blue' },
    { phase: 'ban', team: 'red' }, { phase: 'ban', team: 'blue' },
    { phase: 'pick', team: 'red' },
    { phase: 'pick', team: 'blue' }, { phase: 'pick', team: 'blue' },
    { phase: 'pick', team: 'red' }
  ];
  const TOTAL_STEPS = DRAFT_ORDER.length; // 20

  // ------------------------------------------------------------------ series
  function createSeries(blueName, redName, opts) {
    opts = opts || {};
    return {
      blueName: blueName || 'Cloud9',
      redName: redName || 'Opponent',
      fearless: opts.fearless !== false, // Fearless Draft ON by default
      bestOf: opts.bestOf === 3 ? 3 : 5,
      games: [], // completed games
      score: { blue: 0, red: 0 },
      current: newGame(1)
    };
  }

  function newGame(number) {
    return {
      number,
      stepIndex: 0,
      bluePicks: [], // { champ, role }
      redPicks: [],
      blueBans: [], // champ ids
      redBans: [],
      history: [] // for undo: { stepIndex, kind, team, champ, role }
    };
  }

  function getStep(series) {
    const g = series.current;
    return g.stepIndex >= TOTAL_STEPS ? null : DRAFT_ORDER[g.stepIndex];
  }

  function isDraftComplete(series) { return series.current.stepIndex >= TOTAL_STEPS; }

  function seriesWinner(series) {
    const need = Math.floor(series.bestOf / 2) + 1;
    if (series.score.blue >= need) return 'blue';
    if (series.score.red >= need) return 'red';
    return null;
  }

  // Champions picked in any completed game are Fearless-locked for the series.
  function fearlessPool(series) {
    const pool = new Set();
    if (!series.fearless) return pool;
    for (const g of series.games) {
      for (const p of g.bluePicks.concat(g.redPicks)) pool.add(p.champ);
    }
    return pool;
  }

  function unavailableIds(series) {
    const g = series.current;
    const out = new Set(fearlessPool(series));
    for (const id of g.blueBans.concat(g.redBans)) out.add(id);
    for (const p of g.bluePicks.concat(g.redPicks)) out.add(p.champ);
    return out;
  }

  function availableChamps(series, role) {
    const taken = unavailableIds(series);
    return CHAMPIONS.filter(c =>
      !taken.has(c.id) && (!role || c.roles.includes(role)));
  }

  function rolesTaken(picks) { return new Set(picks.map(p => p.role)); }

  // First empty role slot this champion can play (for auto-assign).
  function autoRole(picks, champId) {
    const c = champ(champId);
    if (!c) return null;
    const taken = rolesTaken(picks);
    for (const r of c.roles) if (!taken.has(r)) return r;
    return null;
  }

  function applyAction(series, champId, role) {
    const step = getStep(series);
    if (!step) throw new Error('Draft is complete — record the game result to continue.');
    const c = champ(champId);
    if (!c) throw new Error('Unknown champion: ' + champId);
    if (unavailableIds(series).has(champId)) {
      throw new Error(champName(champId) + ' is not available (banned, picked, or Fearless-locked).');
    }
    const g = series.current;
    if (step.phase === 'ban') {
      (step.team === 'blue' ? g.blueBans : g.redBans).push(champId);
      g.history.push({ stepIndex: g.stepIndex, kind: 'ban', team: step.team, champ: champId, role: null });
    } else {
      const picks = step.team === 'blue' ? g.bluePicks : g.redPicks;
      const finalRole = role || autoRole(picks, champId);
      if (!finalRole) throw new Error(champName(champId) + ' has no open role slot on this team.');
      if (!c.roles.includes(finalRole)) throw new Error(champName(champId) + ' cannot play ' + finalRole + '.');
      if (rolesTaken(picks).has(finalRole)) throw new Error('Role ' + finalRole + ' is already filled.');
      picks.push({ champ: champId, role: finalRole });
      g.history.push({ stepIndex: g.stepIndex, kind: 'pick', team: step.team, champ: champId, role: finalRole });
    }
    g.stepIndex += 1;
    return step;
  }

  function undo(series) {
    const g = series.current;
    const last = g.history.pop();
    if (!last) return false;
    if (last.kind === 'ban') {
      const bans = last.team === 'blue' ? g.blueBans : g.redBans;
      const i = bans.lastIndexOf(last.champ);
      if (i >= 0) bans.splice(i, 1);
    } else {
      const picks = last.team === 'blue' ? g.bluePicks : g.redPicks;
      const i = picks.findIndex(p => p.champ === last.champ && p.role === last.role);
      if (i >= 0) picks.splice(i, 1);
    }
    g.stepIndex = last.stepIndex;
    return true;
  }

  function completeGame(series, winner) {
    if (winner !== 'blue' && winner !== 'red') throw new Error('Winner must be "blue" or "red".');
    if (!isDraftComplete(series)) throw new Error('Draft is not complete yet.');
    if (seriesWinner(series)) throw new Error('Series is already decided.');
    const g = series.current;
    series.games.push({
      number: g.number, winner,
      bluePicks: g.bluePicks.slice(), redPicks: g.redPicks.slice(),
      blueBans: g.blueBans.slice(), redBans: g.redBans.slice()
    });
    series.score[winner] += 1;
    if (!seriesWinner(series)) series.current = newGame(g.number + 1);
    return series.games[series.games.length - 1];
  }

  function resetGame(series) {
    series.current = newGame(series.current.number);
  }

  // --------------------------------------------------------------- matchups
  // Matchup score for A into B, roughly -5..+5. Explicit curated relations
  // dominate; small stat modifiers break ties (range, early power).
  function matchupScore(aId, bId) {
    const a = champ(aId), b = champ(bId);
    if (!a || !b) return 0;
    let s = 0;
    if (a.beats.includes(bId)) s += 3;
    if (a.loses.includes(bId)) s -= 3;
    if (b.loses.includes(aId)) s += 1.5;
    if (b.beats.includes(aId)) s -= 1.5;
    s += (a.early - b.early) * 0.15;
    const rangeDiff = a.rng - b.rng;
    if (rangeDiff > 200) s += 0.5;
    else if (rangeDiff < -200) s -= 0.5;
    return Math.round(s * 10) / 10;
  }

  function laneMatchups(bluePicks, redPicks) {
    const out = [];
    for (const role of ROLES) {
      const bp = bluePicks.find(p => p.role === role);
      const rp = redPicks.find(p => p.role === role);
      if (bp && rp) {
        out.push({ role, blue: bp.champ, red: rp.champ, score: matchupScore(bp.champ, rp.champ) });
      }
    }
    return out;
  }

  function compProfile(picks) {
    const cs = picks.map(p => champ(p.champ)).filter(Boolean);
    const n = cs.length || 1;
    const avg = k => cs.reduce((s, c) => s + c[k], 0) / n;
    const ad = cs.filter(c => c.dmg === 'AD').length;
    const ap = cs.filter(c => c.dmg === 'AP').length;
    const mx = cs.filter(c => c.dmg === 'MX').length;
    return {
      size: cs.length,
      ad, ap, mx,
      adShare: ad / n, apShare: ap / n,
      engage: avg('eng'), cc: avg('cc'), mob: avg('mob'),
      range: Math.round(avg('rng')),
      early: avg('early'), late: avg('late'),
      dive: (avg('eng') + avg('mob')) / 2,
      protect: (avg('cc') + avg('rng') / 100) / 2
    };
  }

  // Draft score: lane matchups + synergy + comp balance. Heuristic model —
  // the UI labels the win probability as a model estimate, not a prediction.
  function draftScore(bluePicks, redPicks) {
    const lanes = laneMatchups(bluePicks, redPicks);
    const laneSum = lanes.reduce((s, l) => s + l.score, 0);
    const bp = compProfile(bluePicks), rp = compProfile(redPicks);
    const synergy = picks => {
      const ids = picks.map(p => p.champ);
      let s = 0;
      for (const p of picks) {
        const c = champ(p.champ);
        if (c) for (const partner of c.pairs) if (ids.includes(partner)) s += 0.5;
      }
      return s;
    };
    const synDiff = synergy(bluePicks) - synergy(redPicks);
    // Damage-mix penalty: a one-dimensional comp is easy to itemise against.
    const mixPenalty = prof => (prof.adShare >= 0.8 || prof.apShare >= 0.8) ? -1.5 : 0;
    const balance = (mixPenalty(bp) - mixPenalty(rp));
    const statDiff = (bp.engage - rp.engage) * 0.25 + (bp.cc - rp.cc) * 0.25
      + (bp.early - rp.early) * 0.2 + (bp.late - rp.late) * 0.2
      + (bp.range - rp.range) / 500;
    const diff = laneSum * 1.0 + synDiff + balance + statDiff;
    const factors = [];
    for (const l of lanes) {
      if (l.score >= 2) factors.push({ text: champName(l.blue) + ' wins the ' + l.role + ' matchup vs ' + champName(l.red), side: 'blue' });
      else if (l.score <= -2) factors.push({ text: champName(l.red) + ' wins the ' + l.role + ' matchup vs ' + champName(l.blue), side: 'red' });
    }
    if (mixPenalty(bp) < 0) factors.push({ text: 'Blue comp is one-dimensional damage — easy to itemise against', side: 'red' });
    if (mixPenalty(rp) < 0) factors.push({ text: 'Red comp is one-dimensional damage — easy to itemise against', side: 'blue' });
    if (bp.engage - rp.engage >= 1.5) factors.push({ text: 'Blue has far stronger engage tools', side: 'blue' });
    if (rp.engage - bp.engage >= 1.5) factors.push({ text: 'Red has far stronger engage tools', side: 'red' });
    if (bp.late - rp.late >= 1.2) factors.push({ text: 'Blue out-scales — the longer the game, the better for Blue', side: 'blue' });
    if (rp.late - bp.late >= 1.2) factors.push({ text: 'Red out-scales — the longer the game, the better for Red', side: 'red' });
    return { laneSum, synDiff, balance, statDiff, diff: Math.round(diff * 10) / 10, factors, blueProfile: bp, redProfile: rp };
  }

  function winProb(diff) {
    const p = 50 + diff * 4;
    return Math.max(5, Math.min(95, Math.round(p)));
  }

  // --------------------------------------------------------- recommendations
  function recommendPicks(series, team, role, count) {
    count = count || 5;
    const g = series.current;
    const myPicks = team === 'blue' ? g.bluePicks : g.redPicks;
    const enemyPicks = team === 'blue' ? g.redPicks : g.bluePicks;
    const myProfile = compProfile(myPicks);
    const enemySameRole = enemyPicks.find(p => p.role === role);
    const out = [];
    for (const c of availableChamps(series, role)) {
      let score = 0;
      const reasons = [];
      if (enemySameRole) {
        const m = matchupScore(c.id, enemySameRole.champ);
        score += m * 2;
        if (m >= 2) reasons.push('Counters ' + champName(enemySameRole.champ) + ' in lane (+' + m + ')');
        else if (m <= -2) reasons.push('Loses lane vs ' + champName(enemySameRole.champ) + ' (' + m + ')');
      }
      let syn = 0;
      for (const p of myPicks) if (c.pairs.includes(p.champ)) { syn += 1; reasons.push('Synergy with ' + champName(p.champ)); }
      score += syn * 1.5;
      // Damage-balance need: fill the missing damage type.
      if (myPicks.length >= 2) {
        if (myProfile.apShare < 0.2 && c.dmg === 'AP') { score += 1.5; reasons.push('Adds missing magic damage'); }
        if (myProfile.adShare < 0.2 && c.dmg === 'AD') { score += 1.5; reasons.push('Adds missing physical damage'); }
      }
      if (myPicks.length >= 2 && myProfile.engage < 6 && c.eng >= 8) { score += 1; reasons.push('Adds engage the comp lacks'); }
      if (myPicks.length >= 2 && myProfile.cc < 6 && c.cc >= 8) { score += 1; reasons.push('Adds crowd control the comp lacks'); }
      // Counter value vs the whole enemy comp.
      let counterSum = 0;
      for (const p of enemyPicks) { const m = matchupScore(c.id, p.champ); if (m >= 2) counterSum += m; }
      score += counterSum * 0.4;
      if (counterSum >= 4) reasons.push('Strong into the enemy comp overall');
      score += (c.early + c.late) * 0.05; // slight preference for strong champs
      out.push({ champ: c.id, name: c.name, score: Math.round(score * 10) / 10, reasons: reasons.slice(0, 3) });
    }
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, count);
  }

  // Simple AI: picks the top recommendation for its next open role.
  // Guarded so it can never strand a role: bans keep a spare champion in
  // every role the banned champion plays, and picks never remove the last
  // playable champion of an open role. This matters in game 4-5 of a
  // Fearless series, where the pool is heavily depleted.
  function wouldStrand(series, team, role, champId) {
    const g = series.current;
    const remaining = availableChamps(series).filter(c => c.id !== champId);
    const slots = { blue: new Set(ROLES), red: new Set(ROLES) };
    for (const p of g.bluePicks) slots.blue.delete(p.role);
    for (const p of g.redPicks) slots.red.delete(p.role);
    slots[team].delete(role);
    for (const t of ['blue', 'red']) {
      for (const r of slots[t]) {
        if (!remaining.some(c => c.roles.includes(r))) return true;
      }
    }
    return false;
  }

  function aiChoose(series, team) {
    const step = getStep(series);
    if (!step || step.team !== team) return null;
    const g = series.current;
    const picks = team === 'blue' ? g.bluePicks : g.redPicks;
    if (step.phase === 'ban') {
      const pool = availableChamps(series);
      // Open pick slots per role across both teams.
      const openSlots = {};
      for (const r of ROLES) openSlots[r] = 0;
      for (const ps of [g.bluePicks, g.redPicks]) {
        const taken = rolesTaken(ps);
        for (const r of ROLES) if (!taken.has(r)) openSlots[r] += 1;
      }
      const depth = {};
      for (const c of pool) for (const r of c.roles) depth[r] = (depth[r] || 0) + 1;
      // A ban is safe if every role the champion can play keeps at least one
      // spare champion beyond the open slots after the ban.
      const safe = pool.filter(c => c.roles.every(r => (depth[r] || 0) - 1 > openSlots[r]));
      const candidates = safe.length ? safe : pool;
      let best = null, bestVal = -Infinity;
      for (const c of candidates) {
        const roleDepth = Math.max(...c.roles.map(r => depth[r] || 0));
        const v = c.early + c.late + c.eng * 0.5 + c.cc * 0.5 + roleDepth;
        if (v > bestVal) { bestVal = v; best = c; }
      }
      return best ? { kind: 'ban', champ: best.id, role: null } : null;
    }
    const taken = rolesTaken(picks);
    const openRoles = ROLES.filter(r => !taken.has(r));
    // Prefer the role with an enemy already revealed (counter-pick value).
    const enemyPicks = team === 'blue' ? g.redPicks : g.bluePicks;
    openRoles.sort((a, b) => (enemyPicks.some(p => p.role === b) ? 1 : 0) - (enemyPicks.some(p => p.role === a) ? 1 : 0));
    for (const role of openRoles) {
      const recs = recommendPicks(series, team, role, 5);
      for (const rec of recs) {
        if (!wouldStrand(series, team, role, rec.champ)) {
          return { kind: 'pick', champ: rec.champ, role };
        }
      }
      if (recs.length) return { kind: 'pick', champ: recs[0].champ, role };
    }
    return null;
  }

  // -------------------------------------------------------------- scouting
  function poolWinRate(entry) {
    return entry.games > 0 ? Math.round((entry.wins / entry.games) * 100) : 0;
  }

  function playerTotals(player) {
    const games = player.pool.reduce((s, e) => s + e.games, 0);
    const wins = player.pool.reduce((s, e) => s + e.wins, 0);
    return { games, wins, winRate: games ? Math.round((wins / games) * 100) : 0 };
  }

  // Rule-based "How to Win" insights from a scouting profile.
  function insightsForTeam(team) {
    const insights = [];
    const t = team.tendencies || {};
    // 1. Game-1 comfort pick -> early ban recommendation.
    const g1 = (team.game1PickRates || []).slice().sort((a, b) => b.rate - a.rate)[0];
    if (g1 && g1.rate >= 55) {
      const owner = team.players.find(p => p.pool.some(e => e.champ === g1.champ));
      const entry = owner && owner.pool.find(e => e.champ === g1.champ);
      const wr = entry ? poolWinRate(entry) : null;
      const fallback = owner && owner.pool.filter(e => e.champ !== g1.champ)
        .sort((a, b) => b.games - a.games)[0];
      insights.push({
        priority: 'HIGH',
        title: 'Ban ' + champName(g1.champ) + ' early',
        detail: 'Picked in ' + g1.rate + '% of Game 1s' +
          (owner ? ' by ' + owner.name + ' (' + owner.role + ')' : '') +
          (wr !== null ? ' at a ' + wr + '% win rate' : '') +
          (fallback ? '. Denying it forces ' + (owner ? owner.name : 'them') + ' onto ' + champName(fallback.champ) +
            ' (' + poolWinRate(fallback) + '% WR over ' + fallback.games + ' games)' : '') +
          ' — and in Fearless Draft it can never come back later in the series.'
      });
    }
    // 2. One-trick / narrow pool detection.
    for (const p of team.players) {
      const tot = playerTotals(p);
      const top = p.pool.slice().sort((a, b) => b.games - a.games)[0];
      if (top && tot.games > 0 && top.games / tot.games >= 0.45 && p.pool.length <= 3) {
        insights.push({
          priority: 'HIGH',
          title: p.name + ' is a ' + champName(top.champ) + ' one-trick risk',
          detail: top.games + ' of ' + tot.games + ' tracked games (' + Math.round((top.games / tot.games) * 100) +
            '%) on one champion at ' + poolWinRate(top) + '% WR. Two targeted ' + p.role +
            ' bans in a Fearless series push them deep into uncomfortable picks by Game 3.'
        });
      }
    }
    // 3. Early-game exploit.
    if (typeof t.firstBlood === 'number' && t.firstBlood <= 50) {
      insights.push({
        priority: 'MEDIUM',
        title: 'Attack the early game',
        detail: 'Only ' + t.firstBlood + '% first-blood rate and an early-game rating of ' + t.earlyRating +
          '/10. Draft early jungle-mid priority and invade: this team is at its weakest before 14 minutes.'
      });
    }
    if (typeof t.firstBlood === 'number' && t.firstBlood >= 60) {
      insights.push({
        priority: 'MEDIUM',
        title: 'Respect their level-1 / early aggression',
        detail: t.firstBlood + '% first-blood rate. Do not contest early skirmishes without vision — ' +
          'play for a safe level 1 and match their jungle pathing.'
      });
    }
    // 4. Objective control.
    if (typeof t.firstDragon === 'number' && t.firstDragon < 55) {
      insights.push({
        priority: 'MEDIUM',
        title: 'Stack dragons early',
        detail: 'First-dragon rate is only ' + t.firstDragon + '%. Prioritise bot-side control and ' +
          'force dragon fights on your timers — soul point is a realistic win condition.'
      });
    }
    if (typeof t.firstHerald === 'number' && t.firstHerald >= 60) {
      insights.push({
        priority: 'MEDIUM',
        title: 'Contest Herald — they play through top side',
        detail: 'First-Herald rate of ' + t.firstHerald + '% with a ' + t.objectiveRating +
          '/10 objective rating. Track their jungler after first back; a Herald trade for dragon is acceptable.'
      });
    }
    // 5. Game-length / scaling read.
    if (typeof t.avgGameTimeMin === 'number' && t.avgGameTimeMin >= 33 && t.teamfightRating >= 8) {
      insights.push({
        priority: 'HIGH',
        title: 'Close before 30 minutes or lose the teamfight',
        detail: 'Average game length ' + t.avgGameTimeMin + ' min with a ' + t.teamfightRating +
          '/10 teamfight rating. Draft early tempo, siege, and objective pressure — do not let this team reach 5v5s at full build.'
      });
    }
    if (typeof t.avgGameTimeMin === 'number' && t.avgGameTimeMin <= 30 && t.earlyRating >= 7.5) {
      insights.push({
        priority: 'MEDIUM',
        title: 'Survive the first 20 minutes',
        detail: 'They close games in ' + t.avgGameTimeMin + ' min on average with a ' + t.earlyRating +
          '/10 early rating. Draft safe lanes and scaling — if the game reaches 30 minutes, the edge flips to you.'
      });
    }
    // 6. Their own ban habits -> free information.
    const theirTopBan = (team.banTendencies || []).slice().sort((a, b) => b.rate - a.rate)[0];
    if (theirTopBan && theirTopBan.rate >= 65) {
      insights.push({
        priority: 'LOW',
        title: 'They ban ' + champName(theirTopBan.champ) + ' ' + theirTopBan.rate + '% of the time',
        detail: 'Expect that ban to be spent for you — plan your draft as if ' + champName(theirTopBan.champ) +
          ' is already off the table, and use your own bans elsewhere.'
      });
    }
    return insights;
  }

  // Fearless shift: which of a player's pool survives into Game N.
  function fearlessShift(team, series) {
    const locked = new Set();
    for (const g of series.games) for (const p of g.bluePicks.concat(g.redPicks)) locked.add(p.champ);
    return team.players.map(p => {
      const remaining = p.pool.filter(e => !locked.has(e.champ));
      const lost = p.pool.filter(e => locked.has(e.champ));
      const remGames = remaining.reduce((s, e) => s + e.games, 0);
      const remWins = remaining.reduce((s, e) => s + e.wins, 0);
      return {
        player: p.name, role: p.role,
        lost: lost.map(e => champName(e.champ)),
        remaining: remaining.map(e => ({ champ: champName(e.champ), games: e.games, winRate: poolWinRate(e) })),
        remainingWinRate: remGames ? Math.round((remWins / remGames) * 100) : null,
        poolDepth: remaining.length
      };
    });
  }

  // ------------------------------------------------------------ import check
  function validateScoutImport(obj) {
    const errors = [];
    if (!obj || typeof obj !== 'object') return { ok: false, errors: ['Import must be a JSON object.'] };
    if (typeof obj.name !== 'string' || !obj.name.trim()) errors.push('Team "name" (string) is required.');
    if (!Array.isArray(obj.players) || obj.players.length === 0) errors.push('"players" must be a non-empty array.');
    else {
      for (const p of obj.players) {
        if (!p || typeof p.name !== 'string') errors.push('Each player needs a "name".');
        if (!p || !ROLES.includes(p.role)) errors.push('Player "' + (p && p.name) + '" has an invalid "role" (use TOP/JGL/MID/ADC/SUP).');
        if (!p || !Array.isArray(p.pool)) errors.push('Player "' + (p && p.name) + '" needs a "pool" array.');
        else for (const e of p.pool) {
          if (!champ(e.champ)) errors.push('Unknown champion id in pool: "' + e.champ + '".');
          if (typeof e.games !== 'number' || typeof e.wins !== 'number') errors.push('Pool entry for "' + e.champ + '" needs numeric "games" and "wins".');
        }
      }
    }
    if (obj.tendencies && typeof obj.tendencies !== 'object') errors.push('"tendencies" must be an object.');
    return { ok: errors.length === 0, errors };
  }

  return {
    CHAMP_BY_ID, champ, champName, ROLES,
    DRAFT_ORDER, TOTAL_STEPS,
    createSeries, newGame, getStep, isDraftComplete, seriesWinner,
    fearlessPool, unavailableIds, availableChamps, autoRole,
    applyAction, undo, completeGame, resetGame,
    matchupScore, laneMatchups, compProfile, draftScore, winProb,
    recommendPicks, aiChoose,
    poolWinRate, playerTotals, insightsForTeam, fearlessShift,
    validateScoutImport
  };
});
