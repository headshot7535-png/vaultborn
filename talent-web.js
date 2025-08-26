// POE-style Talent Web (basic interactive, persistent state)

window.initTalentWeb = function(profile) {
  const twCanvas = document.getElementById('talentWeb');
  const ctx = twCanvas.getContext('2d');
  let dragging = false, dragStart = null, offset = { x: 0, y: 0 }, scale = 1;
  const center = { x: 0, y: 0 };

  // -- Example Talent Web Data --
  // Expand this for a real web!
  const nodes = [
    { id: 'start', x: 0, y: 0, type: 'start', name: 'Origin', desc: 'Begin your journey.' },
    { id: 'atk1', x: 230, y: 0, type: 'minor', name: '+5% Damage', desc: 'Increase damage by 5%' },
    { id: 'atk2', x: 390, y: 0, type: 'major', name: 'Berserker', desc: 'Massive attack speed.' },
    { id: 'hp1', x: 0, y: 230, type: 'minor', name: '+10% HP', desc: 'Increase HP by 10%' },
    { id: 'hp2', x: 0, y: 390, type: 'major', name: 'Juggernaut', desc: 'Giant health boost.' },
    { id: 'spd1', x: -230, y: 0, type: 'minor', name: '+7% Speed', desc: 'Move faster.' },
    { id: 'spd2', x: -390, y: 0, type: 'major', name: 'Ghost Step', desc: 'Dash has no cooldown.' }
  ];
  const links = [
    ['start', 'atk1'], ['atk1', 'atk2'],
    ['start', 'hp1'], ['hp1', 'hp2'],
    ['start', 'spd1'], ['spd1', 'spd2'],
  ];

  // Persistent state
  const saveKey = `vaultborn_talents_${profile.name}`;
  let unlocked = JSON.parse(localStorage.getItem(saveKey) || '{}');

  // Draw
  function drawWeb() {
    twCanvas.width = window.innerWidth;
    twCanvas.height = window.innerHeight;
    ctx.clearRect(0,0,twCanvas.width,twCanvas.height);
    ctx.save();
    ctx.translate(twCanvas.width/2 + offset.x, twCanvas.height/2 + offset.y);
    ctx.scale(scale, scale);
    // Links
    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 4/scale;
    links.forEach(([a,b])=>{
      const na = nodes.find(n=>n.id===a), nb = nodes.find(n=>n.id===b);
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    });
    // Nodes
    nodes.forEach(n=>{
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.type==='major'?36:22, 0, Math.PI*2);
      ctx.fillStyle = unlocked[n.id] ? "#22c55e" : n.type === "major" ? "#fbbf24" : (n.type === "start" ? "#7dd3fc" : "#23272f");
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2/scale;
      ctx.stroke();
      ctx.fillStyle = "#e5e7eb";
      ctx.font = `${n.type==='major'?'bold 1.1em':'1em'} system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(n.name, n.x, n.y + (n.type==='major'?54:34));
    });
    ctx.restore();
  }
  drawWeb();

  // Mouse interaction
  twCanvas.onmousedown = (e) => {
    dragging = true;
    dragStart = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  twCanvas.onmouseup = () => { dragging = false; };
  twCanvas.onmouseleave = () => { dragging = false; };
  twCanvas.onmousemove = (e) => {
    if (dragging) {
      offset.x = dragStart.ox + (e.clientX - dragStart.x);
      offset.y = dragStart.oy + (e.clientY - dragStart.y);
      drawWeb();
    }
  };
  twCanvas.onwheel = (e) => {
    e.preventDefault();
    scale *= (e.deltaY > 0 ? 0.92 : 1.08);
    scale = Math.max(0.3, Math.min(2.5, scale));
    drawWeb();
  };

  // Node click to unlock
  twCanvas.onclick = (e) => {
    const mx = (e.clientX - twCanvas.width/2 - offset.x) / scale;
    const my = (e.clientY - twCanvas.height/2 - offset.y) / scale;
    for (const n of nodes) {
      if (Math.hypot(mx-n.x, my-n.y) < (n.type==='major'?36:22)) {
        if (!unlocked[n.id]) {
          unlocked[n.id] = true;
          localStorage.setItem(saveKey, JSON.stringify(unlocked));
          drawWeb();
        }
      }
    }
  };

  // Hotkey: T to toggle
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 't') {
      twCanvas.style.display = (twCanvas.style.display === 'none' || !twCanvas.style.display) ? 'block' : 'none';
      drawWeb();
    }
  });
  window.addEventListener('resize', drawWeb);
};
