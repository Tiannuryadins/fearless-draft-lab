// Fearless Draft Lab — embedded static data (no API, no keys, no signup).
// ---------------------------------------------------------------------------
// Champion pool: 88 champions relevant to the 2025-2026 professional meta.
// Stats are 1-10 heuristic ratings curated from public pro-play knowledge
// (patch 25.x era). Matchup relations (beats / loses / pairs) are curated
// game knowledge, not scraped data. Everything here is replaceable: coaches
// can import their own GRID exports as JSON (see Reports -> Import).
//
// Roles: TOP, JGL, MID, ADC, SUP
// dmg: AD (physical), AP (magic), MX (mixed)
// early/late: power curve 1-10. eng: engage, cc: crowd control,
// mob: mobility, rng: attack range, diff: difficulty 1-10.

const CHAMPIONS = [
  // ---- TOP ----
  { id: 'aatrox', name: 'Aatrox', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 6, late: 8, eng: 6, cc: 5, mob: 5, rng: 175, diff: 7, beats: ['ksante', 'sion', 'olaf'], loses: ['camille', 'jax', 'yorick'], pairs: ['sejuani', 'orianna', 'rakan'] },
  { id: 'ambessa', name: 'Ambessa', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 7, late: 7, eng: 7, cc: 5, mob: 8, rng: 175, diff: 8, beats: ['renekton', 'ksante', 'gnar'], loses: ['jax', 'camille', 'yorick'], pairs: ['vi', 'taliyah', 'nautilus'] },
  { id: 'aurora', name: 'Aurora', roles: ['TOP', 'MID'], cls: 'Mage', dmg: 'AP', early: 6, late: 8, eng: 5, cc: 5, mob: 8, rng: 550, diff: 7, beats: ['sion', 'ksante', 'rumble'], loses: ['camille', 'jax', 'yorick'], pairs: ['sejuani', 'naafiri', 'rell'] },
  { id: 'camille', name: 'Camille', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 5, late: 9, eng: 8, cc: 6, mob: 8, rng: 175, diff: 8, beats: ['aatrox', 'ksante', 'yorick'], loses: ['renekton', 'jax', 'gnar'], pairs: ['vi', 'orianna', 'thresh'] },
  { id: 'gnar', name: 'Gnar', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 7, late: 7, eng: 7, cc: 6, mob: 6, rng: 400, diff: 7, beats: ['camille', 'renekton', 'sion'], loses: ['jax', 'yorick', 'rumble'], pairs: ['sejuani', 'taliyah', 'rakan'] },
  { id: 'jax', name: 'Jax', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 5, late: 9, eng: 6, cc: 5, mob: 6, rng: 125, diff: 6, beats: ['camille', 'aatrox', 'ambessa'], loses: ['gnar', 'yorick', 'rumble'], pairs: ['vi', 'orianna', 'thresh'] },
  { id: 'ksante', name: "K'Sante", roles: ['TOP'], cls: 'Tank', dmg: 'MX', early: 6, late: 7, eng: 7, cc: 7, mob: 6, rng: 175, diff: 8, beats: ['renekton', 'olaf', 'sion'], loses: ['aatrox', 'camille', 'yorick'], pairs: ['sejuani', 'azir', 'rakan'] },
  { id: 'olaf', name: 'Olaf', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 8, late: 6, eng: 5, cc: 2, mob: 5, rng: 125, diff: 5, beats: ['renekton', 'camille', 'gnar'], loses: ['aatrox', 'ksante', 'yorick'], pairs: ['lulu', 'orianna', 'rell'] },
  { id: 'renekton', name: 'Renekton', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 8, late: 5, eng: 7, cc: 6, mob: 5, rng: 125, diff: 6, beats: ['camille', 'jax', 'gnar'], loses: ['olaf', 'ksante', 'yorick'], pairs: ['vi', 'taliyah', 'nautilus'] },
  { id: 'rumble', name: 'Rumble', roles: ['TOP'], cls: 'Mage', dmg: 'AP', early: 8, late: 7, eng: 6, cc: 5, mob: 4, rng: 550, diff: 7, beats: ['gnar', 'jax', 'sion'], loses: ['aurora', 'camille', 'yorick'], pairs: ['sejuani', 'orianna', 'rell'] },
  { id: 'sion', name: 'Sion', roles: ['TOP'], cls: 'Tank', dmg: 'AD', early: 5, late: 8, eng: 7, cc: 7, mob: 3, rng: 175, diff: 4, beats: ['yorick', 'olaf', 'renekton'], loses: ['aatrox', 'aurora', 'gnar'], pairs: ['kindred', 'azir', 'lulu'] },
  { id: 'yorick', name: 'Yorick', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 6, late: 8, eng: 4, cc: 4, mob: 3, rng: 175, diff: 5, beats: ['jax', 'camille', 'aatrox'], loses: ['sion', 'gnar', 'rumble'], pairs: ['sejuani', 'taliyah', 'thresh'] },

  // ---- JUNGLE ----
  { id: 'jarvan4', name: 'Jarvan IV', roles: ['JGL'], cls: 'Fighter', dmg: 'AD', early: 7, late: 6, eng: 9, cc: 8, mob: 6, rng: 175, diff: 5, beats: ['kindred', 'naafiri', 'vigo'], loses: ['sejuani', 'skarner', 'maokai'], pairs: ['orianna', 'miss-fortune', 'rakan'] },
  { id: 'kindred', name: 'Kindred', roles: ['JGL'], cls: 'Marksman', dmg: 'AD', early: 6, late: 9, eng: 3, cc: 2, mob: 7, rng: 500, diff: 8, beats: ['maokai', 'skarner', 'sejuani'], loses: ['jarvan4', 'vi', 'naafiri'], pairs: ['sion', 'azir', 'lulu'] },
  { id: 'lee-sin', name: 'Lee Sin', roles: ['JGL'], cls: 'Fighter', dmg: 'AD', early: 8, late: 5, eng: 8, cc: 6, mob: 9, rng: 125, diff: 9, beats: ['naafiri', 'vigo', 'kindred'], loses: ['sejuani', 'skarner', 'maokai'], pairs: ['azir', 'kalista', 'thresh'] },
  { id: 'maokai', name: 'Maokai', roles: ['JGL', 'SUP'], cls: 'Tank', dmg: 'AP', early: 6, late: 7, eng: 8, cc: 9, mob: 4, rng: 125, diff: 5, beats: ['lee-sin', 'naafiri', 'vigo'], loses: ['kindred', 'skarner', 'sejuani'], pairs: ['azir', 'caitlyn', 'rakan'] },
  { id: 'naafiri', name: 'Naafiri', roles: ['JGL'], cls: 'Assassin', dmg: 'AD', early: 8, late: 6, eng: 7, cc: 3, mob: 7, rng: 125, diff: 6, beats: ['kindred', 'vigo', 'skarner'], loses: ['lee-sin', 'jarvan4', 'maokai'], pairs: ['taliyah', 'lucian', 'nautilus'] },
  { id: 'nocturne', name: 'Nocturne', roles: ['JGL'], cls: 'Assassin', dmg: 'AD', early: 6, late: 7, eng: 8, cc: 4, mob: 6, rng: 125, diff: 6, beats: ['kindred', 'vigo', 'naafiri'], loses: ['sejuani', 'skarner', 'maokai'], pairs: ['orianna', 'jinx', 'rakan'] },
  { id: 'pantheon', name: 'Pantheon', roles: ['JGL', 'MID'], cls: 'Fighter', dmg: 'AD', early: 9, late: 5, eng: 8, cc: 6, mob: 5, rng: 150, diff: 6, beats: ['lee-sin', 'naafiri', 'vigo'], loses: ['sejuani', 'skarner', 'maokai'], pairs: ['taliyah', 'kalista', 'nautilus'] },
  { id: 'sejuani', name: 'Sejuani', roles: ['JGL'], cls: 'Tank', dmg: 'AP', early: 6, late: 8, eng: 8, cc: 9, mob: 5, rng: 150, diff: 6, beats: ['lee-sin', 'jarvan4', 'pantheon'], loses: ['kindred', 'vigo', 'skarner'], pairs: ['aurora', 'camille', 'renata'] },
  { id: 'skarner', name: 'Skarner', roles: ['JGL'], cls: 'Tank', dmg: 'MX', early: 6, late: 8, eng: 9, cc: 9, mob: 5, rng: 150, diff: 5, beats: ['lee-sin', 'sejuani', 'pantheon'], loses: ['kindred', 'naafiri', 'vigo'], pairs: ['azir', 'jinx', 'rakan'] },
  { id: 'vi', name: 'Vi', roles: ['JGL'], cls: 'Fighter', dmg: 'AD', early: 7, late: 7, eng: 9, cc: 8, mob: 6, rng: 125, diff: 5, beats: ['kindred', 'naafiri', 'vigo'], loses: ['sejuani', 'skarner', 'maokai'], pairs: ['orianna', 'caitlyn', 'thresh'] },
  { id: 'vigo', name: 'Viego', roles: ['JGL'], cls: 'Fighter', dmg: 'AD', early: 6, late: 8, eng: 6, cc: 6, mob: 7, rng: 200, diff: 7, beats: ['sejuani', 'skarner', 'maokai'], loses: ['lee-sin', 'jarvan4', 'vi'], pairs: ['azir', 'aphelios', 'renata'] },
  { id: 'wukong', name: 'Wukong', roles: ['JGL'], cls: 'Fighter', dmg: 'AD', early: 7, late: 7, eng: 8, cc: 7, mob: 7, rng: 175, diff: 6, beats: ['naafiri', 'vigo', 'kindred'], loses: ['sejuani', 'skarner', 'maokai'], pairs: ['orianna', 'jinx', 'nautilus'] },
  { id: 'xin-zhao', name: 'Xin Zhao', roles: ['JGL'], cls: 'Fighter', dmg: 'AD', early: 8, late: 6, eng: 8, cc: 7, mob: 6, rng: 175, diff: 5, beats: ['kindred', 'naafiri', 'vigo'], loses: ['sejuani', 'skarner', 'maokai'], pairs: ['azir', 'kalista', 'rakan'] },

  // ---- MID ----
  { id: 'ahri', name: 'Ahri', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 6, late: 8, eng: 6, cc: 7, mob: 8, rng: 550, diff: 6, beats: ['azir', 'hwei', 'ziggs'], loses: ['akali', 'sylas', 'yone'], pairs: ['vi', 'sejuani', 'rakan'] },
  { id: 'akali', name: 'Akali', roles: ['MID'], cls: 'Assassin', dmg: 'AP', early: 6, late: 8, eng: 7, cc: 3, mob: 9, rng: 125, diff: 9, beats: ['ahri', 'azir', 'hwei'], loses: ['annie', 'taliyah', 'corki'], pairs: ['vi', 'sejuani', 'nautilus'] },
  { id: 'annie', name: 'Annie', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 7, late: 7, eng: 7, cc: 8, mob: 3, rng: 625, diff: 4, beats: ['akali', 'sylas', 'yone'], loses: ['orianna', 'azir', 'viktor'], pairs: ['vi', 'sejuani', 'thresh'] },
  { id: 'azir', name: 'Azir', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 5, late: 10, eng: 7, cc: 6, mob: 6, rng: 525, diff: 9, beats: ['annie', 'orianna', 'viktor'], loses: ['ahri', 'akali', 'taliyah'], pairs: ['skarner', 'sejuani', 'renata'] },
  { id: 'corki', name: 'Corki', roles: ['MID', 'ADC'], cls: 'Marksman', dmg: 'MX', early: 6, late: 8, eng: 5, cc: 3, mob: 6, rng: 550, diff: 6, beats: ['akali', 'taliyah', 'sylas'], loses: ['azir', 'orianna', 'viktor'], pairs: ['sejuani', 'vi', 'lulu'] },
  { id: 'hwei', name: 'Hwei', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 6, late: 9, eng: 5, cc: 7, mob: 3, rng: 575, diff: 9, beats: ['annie', 'sylas', 'yone'], loses: ['ahri', 'akali', 'taliyah'], pairs: ['sejuani', 'maokai', 'renata'] },
  { id: 'orianna', name: 'Orianna', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 6, late: 9, eng: 6, cc: 7, mob: 3, rng: 525, diff: 7, beats: ['annie', 'corki', 'hwei'], loses: ['azir', 'akali', 'sylas'], pairs: ['vi', 'jarvan4', 'rakan'] },
  { id: 'sylas', name: 'Sylas', roles: ['MID'], cls: 'Fighter', dmg: 'AP', early: 6, late: 8, eng: 7, cc: 6, mob: 7, rng: 175, diff: 8, beats: ['ahri', 'orianna', 'azir'], loses: ['annie', 'corki', 'taliyah'], pairs: ['sejuani', 'vi', 'nautilus'] },
  { id: 'taliyah', name: 'Taliyah', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 7, late: 8, eng: 7, cc: 7, mob: 6, rng: 525, diff: 7, beats: ['azir', 'akali', 'hwei'], loses: ['corki', 'annie', 'sylas'], pairs: ['pantheon', 'sejuani', 'rakan'] },
  { id: 'viktor', name: 'Viktor', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 5, late: 10, eng: 5, cc: 6, mob: 3, rng: 525, diff: 7, beats: ['annie', 'corki', 'hwei'], loses: ['azir', 'akali', 'sylas'], pairs: ['sejuani', 'skarner', 'renata'] },
  { id: 'yone', name: 'Yone', roles: ['MID'], cls: 'Fighter', dmg: 'MX', early: 6, late: 9, eng: 7, cc: 6, mob: 8, rng: 175, diff: 8, beats: ['ahri', 'azir', 'orianna'], loses: ['annie', 'taliyah', 'hwei'], pairs: ['sejuani', 'vi', 'lulu'] },
  { id: 'ziggs', name: 'Ziggs', roles: ['MID', 'ADC'], cls: 'Mage', dmg: 'AP', early: 6, late: 8, eng: 4, cc: 5, mob: 3, rng: 550, diff: 5, beats: ['annie', 'sylas', 'yone'], loses: ['ahri', 'akali', 'taliyah'], pairs: ['maokai', 'sejuani', 'thresh'] },

  // ---- ADC ----
  { id: 'aphelios', name: 'Aphelios', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 5, late: 10, eng: 4, cc: 5, mob: 3, rng: 550, diff: 9, beats: ['jinx', 'senna', 'varus'], loses: ['kalista', 'lucian', 'caitlyn'], pairs: ['thresh', 'lulu', 'milio'] },
  { id: 'ashe', name: 'Ashe', roles: ['ADC', 'SUP'], cls: 'Marksman', dmg: 'AD', early: 7, late: 8, eng: 7, cc: 7, mob: 3, rng: 600, diff: 5, beats: ['jinx', 'aphelios', 'senna'], loses: ['kalista', 'lucian', 'zeri'], pairs: ['braum', 'renata', 'thresh'] },
  { id: 'caitlyn', name: 'Caitlyn', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 8, late: 7, eng: 4, cc: 4, mob: 5, rng: 650, diff: 6, beats: ['aphelios', 'jinx', 'varus'], loses: ['kalista', 'lucian', 'zeri'], pairs: ['karma', 'thresh', 'milio'] },
  { id: 'ezreal', name: 'Ezreal', roles: ['ADC'], cls: 'Marksman', dmg: 'MX', early: 6, late: 8, eng: 3, cc: 2, mob: 8, rng: 550, diff: 7, beats: ['jinx', 'senna', 'varus'], loses: ['kalista', 'lucian', 'caitlyn'], pairs: ['karma', 'braum', 'thresh'] },
  { id: 'jhin', name: 'Jhin', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 7, late: 8, eng: 5, cc: 6, mob: 3, rng: 550, diff: 6, beats: ['jinx', 'senna', 'varus'], loses: ['kalista', 'lucian', 'zeri'], pairs: ['thresh', 'milio', 'karma'] },
  { id: 'jinx', name: 'Jinx', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 5, late: 10, eng: 4, cc: 4, mob: 3, rng: 525, diff: 6, beats: ['senna', 'varus', 'ezreal'], loses: ['kalista', 'lucian', 'caitlyn'], pairs: ['lulu', 'milio', 'thresh'] },
  { id: 'kaisa', name: "Kai'Sa", roles: ['ADC'], cls: 'Marksman', dmg: 'MX', early: 6, late: 9, eng: 6, cc: 3, mob: 7, rng: 525, diff: 7, beats: ['jinx', 'senna', 'aphelios'], loses: ['kalista', 'lucian', 'caitlyn'], pairs: ['nautilus', 'rakan', 'alistar'] },
  { id: 'kalista', name: 'Kalista', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 9, late: 6, eng: 6, cc: 4, mob: 8, rng: 525, diff: 8, beats: ['aphelios', 'jinx', 'jhin'], loses: ['ashe', 'ezreal', 'senna'], pairs: ['renata', 'thresh', 'alistar'] },
  { id: 'lucian', name: 'Lucian', roles: ['ADC', 'MID'], cls: 'Marksman', dmg: 'AD', early: 9, late: 6, eng: 6, cc: 3, mob: 7, rng: 500, diff: 7, beats: ['aphelios', 'jinx', 'jhin'], loses: ['ashe', 'ezreal', 'senna'], pairs: ['nami', 'milio', 'braum'] },
  { id: 'miss-fortune', name: 'Miss Fortune', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 8, late: 7, eng: 6, cc: 4, mob: 4, rng: 550, diff: 4, beats: ['jinx', 'senna', 'varus'], loses: ['kalista', 'lucian', 'ezreal'], pairs: ['leona', 'nautilus', 'alistar'] },
  { id: 'senna', name: 'Senna', roles: ['ADC', 'SUP'], cls: 'Marksman', dmg: 'AD', early: 6, late: 9, eng: 4, cc: 5, mob: 3, rng: 600, diff: 6, beats: ['kalista', 'lucian', 'varus'], loses: ['ashe', 'jhin', 'caitlyn'], pairs: ['thresh', 'milio', 'braum'] },
  { id: 'varus', name: 'Varus', roles: ['ADC'], cls: 'Marksman', dmg: 'MX', early: 7, late: 8, eng: 6, cc: 6, mob: 3, rng: 575, diff: 6, beats: ['jinx', 'senna', 'aphelios'], loses: ['kalista', 'lucian', 'ezreal'], pairs: ['renata', 'thresh', 'karma'] },
  { id: 'xayah', name: 'Xayah', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 6, late: 9, eng: 6, cc: 6, mob: 6, rng: 525, diff: 7, beats: ['jinx', 'senna', 'varus'], loses: ['kalista', 'lucian', 'caitlyn'], pairs: ['rakan', 'thresh', 'lulu'] },
  { id: 'zeri', name: 'Zeri', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 6, late: 9, eng: 5, cc: 3, mob: 9, rng: 500, diff: 8, beats: ['caitlyn', 'jhin', 'aphelios'], loses: ['kalista', 'lucian', 'ashe'], pairs: ['lulu', 'milio', 'thresh'] },

  // ---- SUPPORT ----
  { id: 'alistar', name: 'Alistar', roles: ['SUP'], cls: 'Tank', dmg: 'AP', early: 7, late: 7, eng: 9, cc: 9, mob: 4, rng: 125, diff: 6, beats: ['lulu', 'nami', 'milio'], loses: ['thresh', 'braum', 'karma'], pairs: ['kalista', 'kaisa', 'miss-fortune'] },
  { id: 'bard', name: 'Bard', roles: ['SUP'], cls: 'Mage', dmg: 'AP', early: 6, late: 8, eng: 7, cc: 7, mob: 6, rng: 500, diff: 8, beats: ['lulu', 'nami', 'karma'], loses: ['thresh', 'nautilus', 'leona'], pairs: ['ezreal', 'jhin', 'caitlyn'] },
  { id: 'braum', name: 'Braum', roles: ['SUP'], cls: 'Tank', dmg: 'AD', early: 6, late: 7, eng: 7, cc: 8, mob: 3, rng: 125, diff: 5, beats: ['alistar', 'leona', 'nautilus'], loses: ['karma', 'lulu', 'nami'], pairs: ['lucian', 'ashe', 'senna'] },
  { id: 'karma', name: 'Karma', roles: ['SUP'], cls: 'Mage', dmg: 'AP', early: 8, late: 6, eng: 5, cc: 6, mob: 6, rng: 525, diff: 5, beats: ['braum', 'alistar', 'rakan'], loses: ['thresh', 'nautilus', 'bard'], pairs: ['caitlyn', 'ezreal', 'jhin'] },
  { id: 'leona', name: 'Leona', roles: ['SUP'], cls: 'Tank', dmg: 'AP', early: 7, late: 7, eng: 9, cc: 9, mob: 4, rng: 125, diff: 5, beats: ['lulu', 'nami', 'milio'], loses: ['thresh', 'braum', 'karma'], pairs: ['miss-fortune', 'kalista', 'lucian'] },
  { id: 'lulu', name: 'Lulu', roles: ['SUP'], cls: 'Enchanter', dmg: 'AP', early: 6, late: 9, eng: 4, cc: 7, mob: 5, rng: 550, diff: 5, beats: ['braum', 'rakan', 'rell'], loses: ['alistar', 'leona', 'nautilus'], pairs: ['jinx', 'zeri', 'aphelios'] },
  { id: 'milio', name: 'Milio', roles: ['SUP'], cls: 'Enchanter', dmg: 'AP', early: 6, late: 9, eng: 4, cc: 6, mob: 5, rng: 525, diff: 5, beats: ['braum', 'rakan', 'rell'], loses: ['alistar', 'leona', 'nautilus'], pairs: ['jinx', 'zeri', 'aphelios'] },
  { id: 'nami', name: 'Nami', roles: ['SUP'], cls: 'Enchanter', dmg: 'AP', early: 7, late: 8, eng: 6, cc: 7, mob: 5, rng: 550, diff: 6, beats: ['braum', 'rakan', 'rell'], loses: ['alistar', 'leona', 'nautilus'], pairs: ['lucian', 'jinx', 'kalista'] },
  { id: 'nautilus', name: 'Nautilus', roles: ['SUP'], cls: 'Tank', dmg: 'AP', early: 7, late: 7, eng: 9, cc: 9, mob: 4, rng: 175, diff: 5, beats: ['lulu', 'nami', 'karma'], loses: ['thresh', 'braum', 'alistar'], pairs: ['kaisa', 'miss-fortune', 'kalista'] },
  { id: 'rakan', name: 'Rakan', roles: ['SUP'], cls: 'Mage', dmg: 'AP', early: 7, late: 8, eng: 9, cc: 8, mob: 8, rng: 300, diff: 7, beats: ['lulu', 'nami', 'milio'], loses: ['thresh', 'braum', 'karma'], pairs: ['xayah', 'kalista', 'jinx'] },
  { id: 'rell', name: 'Rell', roles: ['SUP', 'JGL'], cls: 'Tank', dmg: 'AP', early: 7, late: 7, eng: 9, cc: 8, mob: 5, rng: 175, diff: 6, beats: ['lulu', 'nami', 'milio'], loses: ['thresh', 'braum', 'karma'], pairs: ['kalista', 'lucian', 'miss-fortune'] },
  { id: 'renata', name: 'Renata Glasc', roles: ['SUP'], cls: 'Mage', dmg: 'AP', early: 6, late: 9, eng: 6, cc: 8, mob: 4, rng: 550, diff: 7, beats: ['braum', 'rakan', 'rell'], loses: ['thresh', 'nautilus', 'alistar'], pairs: ['kalista', 'varus', 'ashe'] },
  { id: 'thresh', name: 'Thresh', roles: ['SUP'], cls: 'Mage', dmg: 'AP', early: 7, late: 8, eng: 8, cc: 8, mob: 5, rng: 450, diff: 8, beats: ['alistar', 'leona', 'nautilus'], loses: ['karma', 'lulu', 'bard'], pairs: ['kalista', 'aphelios', 'jinx'] },

  // ---- TOP (wave 2) ----
  { id: 'darius', name: 'Darius', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 8, late: 6, eng: 6, cc: 5, mob: 3, rng: 175, diff: 5, beats: ['camille', 'jax', 'olaf'], loses: ['gnar', 'yorick', 'kennen'], pairs: ['vi', 'taliyah', 'nautilus'] },
  { id: 'jayce', name: 'Jayce', roles: ['TOP'], cls: 'Fighter', dmg: 'MX', early: 8, late: 7, eng: 5, cc: 4, mob: 6, rng: 500, diff: 8, beats: ['sion', 'ksante', 'olaf'], loses: ['camille', 'jax', 'yorick'], pairs: ['vi', 'orianna', 'thresh'] },
  { id: 'kennen', name: 'Kennen', roles: ['TOP'], cls: 'Mage', dmg: 'AP', early: 7, late: 8, eng: 8, cc: 7, mob: 6, rng: 550, diff: 7, beats: ['darius', 'gnar', 'renekton'], loses: ['camille', 'jax', 'yorick'], pairs: ['sejuani', 'taliyah', 'rakan'] },
  { id: 'sett', name: 'Sett', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 7, late: 6, eng: 7, cc: 6, mob: 4, rng: 125, diff: 5, beats: ['renekton', 'camille', 'olaf'], loses: ['gnar', 'yorick', 'kennen'], pairs: ['vi', 'orianna', 'thresh'] },
  { id: 'volibear', name: 'Volibear', roles: ['TOP'], cls: 'Fighter', dmg: 'AD', early: 7, late: 6, eng: 8, cc: 6, mob: 5, rng: 150, diff: 5, beats: ['camille', 'jax', 'renekton'], loses: ['gnar', 'yorick', 'kennen'], pairs: ['sejuani', 'taliyah', 'nautilus'] },

  // ---- JUNGLE (wave 2) ----
  { id: 'graves', name: 'Graves', roles: ['JGL'], cls: 'Marksman', dmg: 'AD', early: 7, late: 8, eng: 4, cc: 3, mob: 6, rng: 425, diff: 6, beats: ['maokai', 'skarner', 'sejuani'], loses: ['lee-sin', 'vi', 'naafiri'], pairs: ['azir', 'caitlyn', 'thresh'] },
  { id: 'lillia', name: 'Lillia', roles: ['JGL'], cls: 'Mage', dmg: 'AP', early: 6, late: 8, eng: 6, cc: 6, mob: 8, rng: 325, diff: 7, beats: ['maokai', 'skarner', 'sejuani'], loses: ['lee-sin', 'vi', 'naafiri'], pairs: ['azir', 'jinx', 'rakan'] },
  { id: 'poppy', name: 'Poppy', roles: ['JGL', 'SUP'], cls: 'Tank', dmg: 'AD', early: 7, late: 7, eng: 8, cc: 8, mob: 5, rng: 125, diff: 6, beats: ['lee-sin', 'vi', 'wukong'], loses: ['kindred', 'vigo', 'graves'], pairs: ['azir', 'kalista', 'thresh'] },
  { id: 'trundle', name: 'Trundle', roles: ['JGL'], cls: 'Fighter', dmg: 'AD', early: 7, late: 7, eng: 6, cc: 5, mob: 5, rng: 125, diff: 5, beats: ['sejuani', 'skarner', 'maokai'], loses: ['kindred', 'lee-sin', 'naafiri'], pairs: ['azir', 'caitlyn', 'rakan'] },
  { id: 'zac', name: 'Zac', roles: ['JGL'], cls: 'Tank', dmg: 'AP', early: 6, late: 8, eng: 9, cc: 8, mob: 6, rng: 175, diff: 6, beats: ['lee-sin', 'naafiri', 'vigo'], loses: ['kindred', 'graves', 'lillia'], pairs: ['orianna', 'jinx', 'rakan'] },

  // ---- MID (wave 2) ----
  { id: 'kassadin', name: 'Kassadin', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 4, late: 10, eng: 6, cc: 3, mob: 8, rng: 150, diff: 7, beats: ['azir', 'viktor', 'hwei'], loses: ['taliyah', 'annie', 'pantheon'], pairs: ['sejuani', 'vi', 'lulu'] },
  { id: 'leblanc', name: 'LeBlanc', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 8, late: 7, eng: 6, cc: 5, mob: 9, rng: 525, diff: 9, beats: ['azir', 'viktor', 'hwei'], loses: ['taliyah', 'annie', 'kassadin'], pairs: ['vi', 'sejuani', 'thresh'] },
  { id: 'neeko', name: 'Neeko', roles: ['MID', 'SUP'], cls: 'Mage', dmg: 'AP', early: 7, late: 7, eng: 7, cc: 7, mob: 4, rng: 550, diff: 6, beats: ['annie', 'sylas', 'yone'], loses: ['ahri', 'akali', 'taliyah'], pairs: ['sejuani', 'vi', 'rakan'] },
  { id: 'ryze', name: 'Ryze', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 6, late: 9, eng: 5, cc: 6, mob: 5, rng: 550, diff: 8, beats: ['annie', 'corki', 'hwei'], loses: ['azir', 'akali', 'sylas'], pairs: ['sejuani', 'skarner', 'renata'] },
  { id: 'vex', name: 'Vex', roles: ['MID'], cls: 'Mage', dmg: 'AP', early: 7, late: 7, eng: 6, cc: 7, mob: 5, rng: 550, diff: 6, beats: ['ahri', 'akali', 'yone'], loses: ['azir', 'taliyah', 'corki'], pairs: ['vi', 'sejuani', 'nautilus'] },

  // ---- ADC (wave 2) ----
  { id: 'draven', name: 'Draven', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 9, late: 7, eng: 5, cc: 3, mob: 5, rng: 550, diff: 8, beats: ['jinx', 'aphelios', 'senna'], loses: ['kalista', 'lucian', 'ashe'], pairs: ['thresh', 'milio', 'nautilus'] },
  { id: 'samira', name: 'Samira', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 8, late: 8, eng: 7, cc: 3, mob: 6, rng: 500, diff: 8, beats: ['jinx', 'senna', 'varus'], loses: ['kalista', 'lucian', 'ashe'], pairs: ['nautilus', 'rakan', 'alistar'] },
  { id: 'sivir', name: 'Sivir', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 6, late: 8, eng: 5, cc: 3, mob: 6, rng: 500, diff: 4, beats: ['jinx', 'senna', 'varus'], loses: ['kalista', 'lucian', 'caitlyn'], pairs: ['karma', 'thresh', 'milio'] },
  { id: 'tristana', name: 'Tristana', roles: ['ADC', 'MID'], cls: 'Marksman', dmg: 'AD', early: 8, late: 8, eng: 6, cc: 3, mob: 7, rng: 525, diff: 6, beats: ['jinx', 'senna', 'aphelios'], loses: ['kalista', 'lucian', 'ashe'], pairs: ['thresh', 'milio', 'braum'] },
  { id: 'twitch', name: 'Twitch', roles: ['ADC'], cls: 'Marksman', dmg: 'AD', early: 5, late: 10, eng: 4, cc: 3, mob: 5, rng: 550, diff: 7, beats: ['jinx', 'senna', 'varus'], loses: ['kalista', 'lucian', 'caitlyn'], pairs: ['lulu', 'milio', 'thresh'] },

  // ---- SUPPORT (wave 2) ----
  { id: 'blitzcrank', name: 'Blitzcrank', roles: ['SUP'], cls: 'Tank', dmg: 'AP', early: 8, late: 6, eng: 9, cc: 8, mob: 5, rng: 125, diff: 6, beats: ['lulu', 'nami', 'karma'], loses: ['thresh', 'braum', 'morgana'], pairs: ['draven', 'lucian', 'miss-fortune'] },
  { id: 'janna', name: 'Janna', roles: ['SUP'], cls: 'Enchanter', dmg: 'AP', early: 6, late: 8, eng: 5, cc: 7, mob: 6, rng: 550, diff: 6, beats: ['braum', 'rakan', 'rell'], loses: ['alistar', 'leona', 'nautilus'], pairs: ['jinx', 'zeri', 'aphelios'] },
  { id: 'morgana', name: 'Morgana', roles: ['SUP'], cls: 'Mage', dmg: 'AP', early: 7, late: 7, eng: 6, cc: 8, mob: 4, rng: 550, diff: 6, beats: ['thresh', 'nautilus', 'blitzcrank'], loses: ['karma', 'lulu', 'bard'], pairs: ['jhin', 'caitlyn', 'miss-fortune'] },
  { id: 'soraka', name: 'Soraka', roles: ['SUP'], cls: 'Enchanter', dmg: 'AP', early: 6, late: 8, eng: 3, cc: 6, mob: 4, rng: 550, diff: 5, beats: ['braum', 'rakan', 'rell'], loses: ['alistar', 'leona', 'nautilus'], pairs: ['jinx', 'zeri', 'aphelios'] }
];

const ROLES = ['TOP', 'JGL', 'MID', 'ADC', 'SUP'];
const ROLE_LABELS = { TOP: 'Top', JGL: 'Jungle', MID: 'Mid', ADC: 'Bot', SUP: 'Support' };

// ---------------------------------------------------------------------------
// Sample scouting data — SYNTHETIC, clearly labelled in the UI.
// These three fictional opponent profiles demonstrate the analysis engine.
// Coaches replace them by importing real GRID exports (Reports -> Import).
// ---------------------------------------------------------------------------
const SAMPLE_TEAMS = [
  {
    id: 'nxf', tag: 'NXF', name: 'Northwind Foxes', region: 'Sample — LTA North', sample: true,
    tendencies: { firstBlood: 62, firstDragon: 58, firstHerald: 55, avgGameTimeMin: 29.4, wardsPerMin: 2.1, earlyRating: 8.2, teamfightRating: 6.8, objectiveRating: 7.4 },
    banTendencies: [{ champ: 'aurora', rate: 78 }, { champ: 'corki', rate: 65 }, { champ: 'yone', rate: 58 }],
    game1PickRates: [{ champ: 'sejuani', rate: 70 }, { champ: 'kalista', rate: 55 }, { champ: 'azir', rate: 50 }],
    players: [
      { name: 'Frost', role: 'TOP', pool: [{ champ: 'ksante', games: 14, wins: 9 }, { champ: 'aatrox', games: 9, wins: 5 }, { champ: 'renekton', games: 7, wins: 5 }] },
      { name: 'Burrow', role: 'JGL', pool: [{ champ: 'sejuani', games: 18, wins: 13 }, { champ: 'vi', games: 8, wins: 4 }, { champ: 'maokai', games: 6, wins: 4 }] },
      { name: 'Hex', role: 'MID', pool: [{ champ: 'azir', games: 12, wins: 7 }, { champ: 'taliyah', games: 10, wins: 7 }, { champ: 'orianna', games: 8, wins: 4 }] },
      { name: 'Vex', role: 'ADC', pool: [{ champ: 'kalista', games: 11, wins: 7 }, { champ: 'varus', games: 9, wins: 5 }, { champ: 'ashe', games: 7, wins: 4 }] },
      { name: 'Pillow', role: 'SUP', pool: [{ champ: 'rakan', games: 10, wins: 6 }, { champ: 'renata', games: 8, wins: 5 }, { champ: 'thresh', games: 6, wins: 3 }] }
    ]
  },
  {
    id: 'psn', tag: 'PSN', name: 'Pacific Sentinels', region: 'Sample — LCP', sample: true,
    tendencies: { firstBlood: 44, firstDragon: 52, firstHerald: 47, avgGameTimeMin: 33.8, wardsPerMin: 2.4, earlyRating: 6.1, teamfightRating: 8.6, objectiveRating: 6.9 },
    banTendencies: [{ champ: 'kalista', rate: 72 }, { champ: 'renekton', rate: 61 }, { champ: 'naafiri', rate: 55 }],
    game1PickRates: [{ champ: 'aphelios', rate: 65 }, { champ: 'viktor', rate: 58 }, { champ: 'skarner', rate: 50 }],
    players: [
      { name: 'Tide', role: 'TOP', pool: [{ champ: 'jax', games: 13, wins: 8 }, { champ: 'camille', games: 10, wins: 6 }, { champ: 'sion', games: 8, wins: 5 }] },
      { name: 'Anchor', role: 'JGL', pool: [{ champ: 'skarner', games: 12, wins: 7 }, { champ: 'vigo', games: 9, wins: 6 }, { champ: 'sejuani', games: 7, wins: 4 }] },
      { name: 'Mirage', role: 'MID', pool: [{ champ: 'viktor', games: 14, wins: 9 }, { champ: 'azir', games: 9, wins: 5 }, { champ: 'orianna', games: 8, wins: 5 }] },
      { name: 'Nova', role: 'ADC', pool: [{ champ: 'aphelios', games: 16, wins: 11 }, { champ: 'jinx', games: 10, wins: 6 }, { champ: 'senna', games: 6, wins: 3 }] },
      { name: 'Lantern', role: 'SUP', pool: [{ champ: 'lulu', games: 12, wins: 8 }, { champ: 'milio', games: 9, wins: 5 }, { champ: 'thresh', games: 7, wins: 4 }] }
    ]
  },
  {
    id: 'ipk', tag: 'IPK', name: 'Iron Peak Esports', region: 'Sample — LEC', sample: true,
    tendencies: { firstBlood: 58, firstDragon: 61, firstHerald: 63, avgGameTimeMin: 30.2, wardsPerMin: 1.9, earlyRating: 7.8, teamfightRating: 7.9, objectiveRating: 8.1 },
    banTendencies: [{ champ: 'azir', rate: 70 }, { champ: 'sejuani', rate: 66 }, { champ: 'jinx', rate: 52 }],
    game1PickRates: [{ champ: 'vi', rate: 62 }, { champ: 'ahri', rate: 55 }, { champ: 'zeri', rate: 50 }],
    players: [
      { name: 'Summit', role: 'TOP', pool: [{ champ: 'ambessa', games: 11, wins: 7 }, { champ: 'rumble', games: 9, wins: 5 }, { champ: 'aatrox', games: 8, wins: 5 }] },
      { name: 'Quake', role: 'JGL', pool: [{ champ: 'vi', games: 14, wins: 9 }, { champ: 'xin-zhao', games: 9, wins: 5 }, { champ: 'pantheon', games: 7, wins: 4 }] },
      { name: 'Ember', role: 'MID', pool: [{ champ: 'ahri', games: 12, wins: 7 }, { champ: 'akali', games: 9, wins: 6 }, { champ: 'sylas', games: 8, wins: 4 }] },
      { name: 'Blitz', role: 'ADC', pool: [{ champ: 'zeri', games: 12, wins: 7 }, { champ: 'kaisa', games: 10, wins: 6 }, { champ: 'lucian', games: 8, wins: 5 }] },
      { name: 'Forge', role: 'SUP', pool: [{ champ: 'nautilus', games: 13, wins: 8 }, { champ: 'leona', games: 9, wins: 5 }, { champ: 'rakan', games: 7, wins: 4 }] }
    ]
  }
];

// UMD-style export: works in the browser (classic <script>) and in Node tests.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CHAMPIONS, ROLES, ROLE_LABELS, SAMPLE_TEAMS };
}
