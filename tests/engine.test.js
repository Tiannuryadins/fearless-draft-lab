// Fearless Draft Lab — unit tests (plain Node, no dependencies).
// Run: node --test tests/engine.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { CHAMPIONS, ROLES, SAMPLE_TEAMS } = require('../data.js');
const E = require('../engine.js');

// ---------------------------------------------------------------- data sanity
test('data: 88 champions, unique ids, all matchup refs resolve', () => {
  assert.equal(CHAMPIONS.length, 88);
  const ids = new Set(CHAMPIONS.map(c => c.id));
  assert.equal(ids.size, 88);
  for (const c of CHAMPIONS) {
    assert.ok(c.roles.length >= 1, c.id + ' has a role');
    for (const ref of [...c.beats, ...c.loses, ...c.pairs]) {
      assert.ok(ids.has(ref), c.id + ' references unknown champion ' + ref);
    }
    assert.ok(!c.beats.includes(c.id) && !c.loses.includes(c.id), c.id + ' self-matchup');
    assert.ok(c.early >= 1 && c.early <= 10 && c.late >= 1 && c.late <= 10);
  }
});

test('data: every role has at least 10 champions', () => {
  for (const role of ROLES) {
    const n = CHAMPIONS.filter(c => c.roles.includes(role)).length;
    assert.ok(n >= 10, role + ' has only ' + n);
  }
});

test('data: sample teams reference real champions only', () => {
  const ids = new Set(CHAMPIONS.map(c => c.id));
  for (const t of SAMPLE_TEAMS) {
    assert.equal(t.players.length, 5);
    for (const p of t.players) {
      for (const e of p.pool) {
        assert.ok(ids.has(e.champ), t.tag + ' ' + p.name + ' bad champ ' + e.champ);
        assert.ok(e.wins <= e.games, 'wins exceed games');
      }
    }
    for (const b of t.banTendencies) assert.ok(ids.has(b.champ));
    for (const g of t.game1PickRates) assert.ok(ids.has(g.champ));
  }
});

// ------------------------------------------------------------- draft machine
test('draft order: 20 steps, 10 bans then interleaved, correct teams', () => {
  assert.equal(E.TOTAL_STEPS, 20);
  const bans = E.DRAFT_ORDER.filter(s => s.phase === 'ban').length;
  const picks = E.DRAFT_ORDER.filter(s => s.phase === 'pick').length;
  assert.equal(bans, 10);
  assert.equal(picks, 10);
  assert.deepEqual(E.DRAFT_ORDER.slice(0, 6).map(s => s.team),
    ['blue', 'red', 'blue', 'red', 'blue', 'red']);
  assert.deepEqual(E.DRAFT_ORDER.slice(6, 12).map(s => s.team),
    ['blue', 'red', 'red', 'blue', 'blue', 'red']);
  assert.deepEqual(E.DRAFT_ORDER.slice(12, 16).map(s => s.team),
    ['red', 'blue', 'red', 'blue']);
  assert.deepEqual(E.DRAFT_ORDER.slice(16).map(s => s.team),
    ['red', 'blue', 'blue', 'red']);
});

function playFullDraft(series) {
  // Deterministic full draft driven by the AI on both sides.
  let guard = 0;
  while (!E.isDraftComplete(series) && guard++ < 30) {
    const step = E.getStep(series);
    const move = E.aiChoose(series, step.team);
    assert.ok(move, 'AI returned a move at step ' + series.current.stepIndex);
    E.applyAction(series, move.champ, move.role);
  }
  assert.ok(E.isDraftComplete(series), 'draft did not complete');
}

test('full draft completes with 5 picks + 5 bans per team, no duplicates', () => {
  const s = E.createSeries('Cloud9', 'NXF');
  playFullDraft(s);
  assert.equal(s.current.bluePicks.length, 5);
  assert.equal(s.current.redPicks.length, 5);
  assert.equal(s.current.blueBans.length, 5);
  assert.equal(s.current.redBans.length, 5);
  const all = [
    ...s.current.bluePicks.map(p => p.champ), ...s.current.redPicks.map(p => p.champ),
    ...s.current.blueBans, ...s.current.redBans
  ];
  assert.equal(new Set(all).size, 20);
  // Every role filled exactly once per team.
  for (const picks of [s.current.bluePicks, s.current.redPicks]) {
    assert.deepEqual(picks.map(p => p.role).sort(), [...ROLES].sort());
  }
});

test('applyAction rejects banned/picked/unknown champions and bad roles', () => {
  const s = E.createSeries();
  E.applyAction(s, 'azir'); // blue ban 1
  assert.throws(() => E.applyAction(s, 'azir'), /not available/);
  assert.throws(() => E.applyAction(s, 'not-a-champ'), /Unknown champion/);
  // Fast-forward to first pick (blue) then try a role the champ cannot play.
  E.applyAction(s, 'aurora'); E.applyAction(s, 'corki');
  E.applyAction(s, 'yone'); E.applyAction(s, 'kalista'); E.applyAction(s, 'jinx');
  assert.equal(E.getStep(s).phase, 'pick');
  assert.throws(() => E.applyAction(s, 'thresh', 'TOP'), /cannot play TOP/);
  E.applyAction(s, 'thresh', 'SUP'); // blue pick 1
  E.applyAction(s, 'aatrox', 'TOP'); // red pick 1
  E.applyAction(s, 'sejuani', 'JGL'); // red pick 2
  // Blue's turn again: SUP is already filled on blue.
  assert.throws(() => E.applyAction(s, 'leona', 'SUP'), /already filled/);
});

test('undo reverts bans and picks step by step', () => {
  const s = E.createSeries();
  E.applyAction(s, 'azir');
  E.applyAction(s, 'aurora');
  assert.equal(s.current.stepIndex, 2);
  assert.equal(E.undo(s), true);
  assert.equal(s.current.stepIndex, 1);
  assert.deepEqual(s.current.redBans, []);
  assert.equal(E.availableChamps(s).some(c => c.id === 'aurora'), true);
  assert.equal(E.undo(s), true);
  assert.equal(s.current.stepIndex, 0);
  assert.equal(E.undo(s), false);
});

// ------------------------------------------------------------------ fearless
test('fearless: picks from completed games are locked in later games', () => {
  const s = E.createSeries('C9', 'NXF', { fearless: true });
  playFullDraft(s);
  const game1Picks = new Set([
    ...s.current.bluePicks.map(p => p.champ), ...s.current.redPicks.map(p => p.champ)
  ]);
  E.completeGame(s, 'blue');
  assert.equal(s.score.blue, 1);
  assert.equal(s.current.number, 2);
  assert.equal(E.fearlessPool(s).size, 10);
  for (const id of game1Picks) {
    assert.ok(!E.availableChamps(s).some(c => c.id === id), id + ' should be fearless-locked');
  }
  // Bans from game 1 are NOT locked — only picks are.
  const game1Bans = [...s.games[0].blueBans, ...s.games[0].redBans];
  for (const id of game1Bans) {
    assert.ok(E.availableChamps(s).some(c => c.id === id), id + ' ban should be reusable');
  }
});

test('fearless off: game-1 picks remain available in game 2', () => {
  const s = E.createSeries('C9', 'NXF', { fearless: false });
  playFullDraft(s);
  const first = s.current.bluePicks[0].champ;
  E.completeGame(s, 'red');
  assert.equal(E.fearlessPool(s).size, 0);
  assert.ok(E.availableChamps(s).some(c => c.id === first));
});

test('series ends at 3 wins in a best-of-5; no game 6', () => {
  const s = E.createSeries('C9', 'NXF', { bestOf: 5 });
  for (let i = 0; i < 3; i++) {
    playFullDraft(s);
    E.completeGame(s, 'blue');
  }
  assert.equal(E.seriesWinner(s), 'blue');
  assert.throws(() => E.completeGame(s, 'blue'), /already decided/);
  assert.equal(s.games.length, 3);
});

test('completeGame requires a finished draft', () => {
  const s = E.createSeries();
  assert.throws(() => E.completeGame(s, 'blue'), /not complete/);
});

test('a full 5-game fearless series never runs out of champions', () => {
  const s = E.createSeries('C9', 'NXF', { fearless: true });
  // 5 games x 10 picks = 50 unique picks needed; pool is 64.
  for (let i = 0; i < 5; i++) {
    playFullDraft(s);
    E.completeGame(s, i % 2 === 0 ? 'blue' : 'red');
    if (E.seriesWinner(s)) break;
  }
  // Alternate winners 3-2: series must reach game 5.
  assert.equal(s.games.length, 5);
  assert.equal(E.seriesWinner(s), 'blue');
  assert.equal(E.fearlessPool(s).size, 50);
});

// ------------------------------------------------------------------- scoring
test('matchupScore: curated relations dominate, symmetric-ish', () => {
  assert.ok(E.matchupScore('camille', 'aatrox') >= 2, 'Camille beats Aatrox');
  assert.ok(E.matchupScore('aatrox', 'camille') <= -2, 'Aatrox loses to Camille');
  assert.ok(E.matchupScore('kalista', 'jinx') >= 2, 'Kalista beats Jinx');
  assert.equal(E.matchupScore('azir', 'azir'), 0);
});

test('compProfile: damage mix and averages are computed', () => {
  const picks = [
    { champ: 'aatrox', role: 'TOP' }, { champ: 'sejuani', role: 'JGL' },
    { champ: 'azir', role: 'MID' }, { champ: 'jinx', role: 'ADC' },
    { champ: 'thresh', role: 'SUP' }
  ];
  const p = E.compProfile(picks);
  assert.equal(p.size, 5);
  assert.equal(p.ad, 2); // Aatrox, Jinx
  assert.equal(p.ap, 3); // Sejuani, Azir, Thresh
  assert.ok(p.engage > 5 && p.engage < 9);
  assert.ok(p.range > 200 && p.range < 600);
});

test('draftScore + winProb: counter-picked comp scores higher, prob in 5..95', () => {
  const blue = [
    { champ: 'camille', role: 'TOP' }, { champ: 'vi', role: 'JGL' },
    { champ: 'orianna', role: 'MID' }, { champ: 'kalista', role: 'ADC' },
    { champ: 'renata', role: 'SUP' }
  ];
  const red = [
    { champ: 'aatrox', role: 'TOP' }, { champ: 'kindred', role: 'JGL' },
    { champ: 'annie', role: 'MID' }, { champ: 'jinx', role: 'ADC' },
    { champ: 'lulu', role: 'SUP' }
  ];
  const d = E.draftScore(blue, red);
  assert.ok(d.diff > 0, 'blue should lead on counters, got diff ' + d.diff);
  const p = E.winProb(d.diff);
  assert.ok(p > 50 && p <= 95, 'win prob ' + p);
  assert.ok(d.factors.length >= 1, 'factors explain the score');
  assert.equal(E.winProb(0), 50);
  assert.equal(E.winProb(100), 95);
  assert.equal(E.winProb(-100), 5);
});

test('draftScore penalises one-dimensional damage', () => {
  const allAd = [
    { champ: 'aatrox', role: 'TOP' }, { champ: 'vi', role: 'JGL' },
    { champ: 'yone', role: 'MID' }, { champ: 'jinx', role: 'ADC' },
    { champ: 'braum', role: 'SUP' }
  ];
  const mixed = [
    { champ: 'ksante', role: 'TOP' }, { champ: 'sejuani', role: 'JGL' },
    { champ: 'azir', role: 'MID' }, { champ: 'jinx', role: 'ADC' },
    { champ: 'thresh', role: 'SUP' }
  ];
  const d = E.draftScore(allAd, mixed);
  assert.ok(d.factors.some(f => f.text.includes('one-dimensional')), 'penalty factor present');
});

// ---------------------------------------------------------- recommendations
test('recommendPicks: returns ranked, available, role-correct suggestions', () => {
  const s = E.createSeries();
  // Bans: remove 6 champs, then blue picks Azir mid.
  for (const id of ['aurora', 'corki', 'yone', 'kalista', 'jinx', 'vi']) E.applyAction(s, id);
  E.applyAction(s, 'azir', 'MID');
  // Red's turn: two picks. Recommend a MID counter to Azir.
  const recs = E.recommendPicks(s, 'red', 'MID', 5);
  assert.equal(recs.length, 5);
  for (let i = 1; i < recs.length; i++) assert.ok(recs[i - 1].score >= recs[i].score, 'sorted desc');
  for (const r of recs) {
    const c = E.champ(r.champ);
    assert.ok(c.roles.includes('MID'), r.champ + ' cannot play MID');
    assert.ok(E.availableChamps(s).some(x => x.id === r.champ), r.champ + ' unavailable');
  }
  // Ahri/Akali/Sylas counter Azir — at least one should top the list.
  const topNames = recs.slice(0, 3).map(r => r.champ);
  assert.ok(topNames.some(id => ['ahri', 'akali', 'sylas', 'taliyah'].includes(id)),
    'expected an Azir counter at the top, got ' + topNames.join(','));
});

test('recommendPicks suggests damage the comp lacks', () => {
  const s = E.createSeries();
  for (const id of ['aurora', 'corki', 'yone', 'kalista', 'jinx', 'vi']) E.applyAction(s, id);
  E.applyAction(s, 'aatrox', 'TOP'); // blue AD top
  E.applyAction(s, 'azir', 'MID'); // red pick 1
  E.applyAction(s, 'jhin', 'ADC'); // red pick 2
  E.applyAction(s, 'xin-zhao', 'JGL'); // blue pick 2 (AD)
  const recs = E.recommendPicks(s, 'blue', 'MID', 5);
  // Blue is all-AD so far; AP mids should rank above AD mids.
  const top = recs[0];
  assert.equal(E.champ(top.champ).dmg, 'AP');
  assert.ok(top.reasons.some(r => r.includes('magic damage')), 'reason mentions magic damage');
});

test('aiChoose plays a legal full draft on both sides', () => {
  const s = E.createSeries('C9', 'NXF');
  let guard = 0;
  while (!E.isDraftComplete(s) && guard++ < 30) {
    const step = E.getStep(s);
    const move = E.aiChoose(s, step.team);
    assert.ok(move, 'AI returned a move');
    E.applyAction(s, move.champ, move.role);
  }
  assert.ok(E.isDraftComplete(s));
  assert.equal(s.current.bluePicks.length, 5);
  assert.equal(s.current.redPicks.length, 5);
});

// ----------------------------------------------------------------- scouting
test('insightsForTeam: NXF yields a Sejuani ban + one-trick insight', () => {
  const insights = E.insightsForTeam(SAMPLE_TEAMS[0]);
  assert.ok(insights.length >= 3, 'got ' + insights.length + ' insights');
  assert.ok(insights.some(i => i.title.includes('Sejuani')), 'Sejuani ban insight present');
  assert.ok(insights.some(i => i.title.includes('Burrow')), 'one-trick insight present');
  assert.ok(insights.every(i => ['HIGH', 'MEDIUM', 'LOW'].includes(i.priority)));
});

test('insightsForTeam: PSN yields a close-early insight (long games)', () => {
  const insights = E.insightsForTeam(SAMPLE_TEAMS[1]);
  assert.ok(insights.some(i => i.title.includes('Close before 30 minutes')));
});

test('fearlessShift: locked picks shrink the opponent pool', () => {
  // Construct a series state directly: game 1 took Sejuani, Vi, Kalista.
  const s = E.createSeries('C9', 'NXF', { fearless: true });
  s.games.push({
    number: 1, winner: 'blue',
    bluePicks: [
      { champ: 'ksante', role: 'TOP' }, { champ: 'sejuani', role: 'JGL' },
      { champ: 'azir', role: 'MID' }, { champ: 'jhin', role: 'ADC' },
      { champ: 'thresh', role: 'SUP' }
    ],
    redPicks: [
      { champ: 'aatrox', role: 'TOP' }, { champ: 'vi', role: 'JGL' },
      { champ: 'taliyah', role: 'MID' }, { champ: 'kalista', role: 'ADC' },
      { champ: 'rakan', role: 'SUP' }
    ],
    blueBans: [], redBans: []
  });
  s.score.blue = 1;
  s.current = E.newGame(2);
  const shift = E.fearlessShift(SAMPLE_TEAMS[0], s);
  const burrow = shift.find(p => p.player === 'Burrow');
  assert.deepEqual(burrow.lost, ['Sejuani', 'Vi']);
  assert.equal(burrow.poolDepth, 1); // only Maokai left
  assert.equal(burrow.remaining[0].champ, 'Maokai');
  assert.equal(burrow.remainingWinRate, 67); // 4 wins / 6 games
  const vex = shift.find(p => p.player === 'Vex');
  assert.ok(vex.lost.includes('Kalista'));
  assert.equal(vex.poolDepth, 2);
});

test('validateScoutImport: accepts valid teams, rejects bad ones', () => {
  const good = JSON.parse(JSON.stringify(SAMPLE_TEAMS[0]));
  assert.deepEqual(E.validateScoutImport(good), { ok: true, errors: [] });
  assert.equal(E.validateScoutImport(null).ok, false);
  assert.equal(E.validateScoutImport({}).ok, false);
  const badChamp = JSON.parse(JSON.stringify(SAMPLE_TEAMS[0]));
  badChamp.players[0].pool[0].champ = 'not-real';
  const r1 = E.validateScoutImport(badChamp);
  assert.equal(r1.ok, false);
  assert.ok(r1.errors.some(e => e.includes('not-real')));
  const badRole = JSON.parse(JSON.stringify(SAMPLE_TEAMS[0]));
  badRole.players[0].role = 'ROAM';
  assert.equal(E.validateScoutImport(badRole).ok, false);
});

test('autoRole: fills the first open role a champion can play', () => {
  assert.equal(E.autoRole([], 'aurora'), 'TOP');
  assert.equal(E.autoRole([{ champ: 'aatrox', role: 'TOP' }], 'aurora'), 'MID');
  assert.equal(E.autoRole([{ champ: 'aatrox', role: 'TOP' }, { champ: 'azir', role: 'MID' }], 'aurora'), null);
  assert.equal(E.autoRole([], 'thresh'), 'SUP');
  assert.equal(E.autoRole([{ champ: 'lulu', role: 'SUP' }], 'thresh'), null);
});

test('laneMatchups: only completed lanes are scored', () => {
  const blue = [{ champ: 'camille', role: 'TOP' }, { champ: 'azir', role: 'MID' }];
  const red = [{ champ: 'aatrox', role: 'TOP' }];
  const lanes = E.laneMatchups(blue, red);
  assert.equal(lanes.length, 1);
  assert.equal(lanes[0].role, 'TOP');
  assert.ok(lanes[0].score >= 2, 'Camille beats Aatrox in lane');
  assert.equal(E.laneMatchups([], []).length, 0);
});

test('playerTotals and poolWinRate math', () => {
  const p = SAMPLE_TEAMS[0].players[1]; // Burrow: 18+8+6 games, 13+4+4 wins
  const t = E.playerTotals(p);
  assert.equal(t.games, 32);
  assert.equal(t.wins, 21);
  assert.equal(t.winRate, 66);
  assert.equal(E.poolWinRate({ games: 18, wins: 13 }), 72);
  assert.equal(E.poolWinRate({ games: 0, wins: 0 }), 0);
});
