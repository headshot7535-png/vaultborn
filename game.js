// Main game logic for Vaultborn

// -- Class definitions --
const CLASSES = [
  { id: 'Gunner', name: 'Gunner', desc: 'Damage/Ammo', color: '#f59e42' },
  { id: 'Guardian', name: 'Guardian', desc: 'Tank/Shield', color: '#60a5fa' },
  { id: 'Rogue', name: 'Rogue', desc: 'Crit/Mobility', color: '#a3e635' },
  { id: 'Arcanist', name: 'Arcanist', desc: 'Explosives', color: '#e879f9' },
];

// Storage keys
const PROFILE_KEY = 'vaultborn_profile_v2';

// -- Fullscreen character/class select setup
function showCharSelectOverlay(onReady) {
  const overlay = document.getElementById('charSelectOverlay');
  const classList = document.getElementById('classList');
  const nameInput = document.getElementById('charNameInput');
  const startBtn = document.getElementById('startBtn');
  let selectedClass = CLASSES[0].id;

  // Render class buttons
  classList.innerHTML = '';
  CLASSES.forEach(cls => {
    const btn = document.createElement('button');
    btn.textContent = cls.name;
    btn.title = cls.desc;
    if (cls.id === selectedClass) btn.classList.add('selected');
    btn.onclick = () => {
      selectedClass = cls.id;
      Array.from(classList.children).forEach(c => c.classList.remove('selected'));
      btn.classList.add('selected');
    };
    classList.appendChild(btn);
  });

  // Start button logic
  startBtn.onclick = () => {
    const name = (nameInput.value || '').trim();
    if (!name) {
      nameInput.style.border = '2px solid #ef4444';
      nameInput.focus();
      return;
    }
    // Save profile to localStorage
    const profile = { name, class: selectedClass, talents: {}, talentPts: 0, specialLoot: [] };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    overlay.style.display = 'none';
    onReady && onReady(profile);
  };
}

// Load or prompt for character/class
function ensureProfile(startGame) {
  let profRaw = localStorage.getItem(PROFILE_KEY);
  if (profRaw) {
    try {
      let prof = JSON.parse(profRaw);
      if (prof.name && prof.class) return startGame(prof);
    } catch { }
  }
  // Show overlay
  showCharSelectOverlay(startGame);
}

// -- Entry point: only allow online co-op, don't show any local co-op option
function startGame(profile) {
  document.getElementById('hud').style.display = '';
  // ...rest of game logic goes here, now using profile.name and profile.class...
  // For talents, load from localStorage with new schema (see talent-web.js)
  // For online co-op, only show online invite/join UI, no local co-op support
  // Load/instantiate talent web UI
  window.initTalentWeb(profile);
  // ...continue with spawn, wave, game loop, etc...
  // For brevity, only the scaffolding is here.
  // You would continue to implement your game logic, enemy spawns, elite/raid logic, etc.
}

// -- On load: show char/class select, then start game.
ensureProfile(startGame);

/* --- ELITE AND RAID BOSS EXAMPLES ---
 * (Add these to your enemy spawn logic!)
 */
// Example: spawnElite(x, y)
function spawnElite(x, y, baseStats) {
  // Elite enemy with random modifier
  const mods = [
    { name: "Regenerating", effect: (e) => e.regen = 12, color: "#34d399" },
    { name: "Lightning Aura", effect: (e) => e.aura = "lightning", color: "#7dd3fc" },
    { name: "Splitting", effect: (e) => e.splits = true, color: "#f59e42" }
  ];
  const mod = mods[Math.floor(Math.random()*mods.length)];
  const enemy = Object.assign({}, baseStats, {
    elite: true,
    name: mod.name + " " + baseStats.name,
    color: mod.color,
    ...mod.effect
  });
  mod.effect(enemy);
  // Drop special loot on death
}
// Example: spawnRaidBoss(x, y)
function spawnRaidBoss(x, y, baseStats) {
  // Raid boss mechanics: multi-phase, minions, invuln, etc.
  return Object.assign({}, baseStats, {
    boss: true,
    phases: 3,
    phase: 1,
    spawnsMinions: true,
    invulnTimer: 0,
    uniqueLoot: "Stormforged Rifle",
    color: "#fbbf24"
  });
}
