// render.js — every pixel the player sees. The world is drawn on one canvas:
// parallax stars and nebulae, the ship, rocks, shards, power-ups, particles,
// the HUD, and the title / pause / clear / game-over / win screens.
import { CONFIG } from './config.js';

const P = CONFIG.palette;

export function drawBackground(ctx, world) {
  const g = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
  g.addColorStop(0, P.bg0);
  g.addColorStop(1, P.bg1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  for (const n of world.nebulae) {
    const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
    const col = P[n.color];
    ng.addColorStop(0, col + '55');
    ng.addColorStop(1, col + '00');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const s of world.stars) {
    const a = 0.35 + 0.35 * Math.sin(s.tw);
    ctx.globalAlpha = Math.max(0.05, a) * s.z;
    ctx.fillStyle = '#cfe8ff';
    ctx.fillRect(s.x, s.y, s.z > 0.7 ? 2 : 1, s.z > 0.7 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
}

export function drawJumpGate(ctx, world) {
  const gate = world.jumpGate;
  if (!gate) return;
  const pulse = 1 + 0.12 * Math.sin(gate.pulse * 5);
  const r = gate.r * pulse;
  const g = ctx.createRadialGradient(gate.x, gate.y, r * 0.2, gate.x, gate.y, r);
  g.addColorStop(0, '#7ee7ffcc');
  g.addColorStop(0.7, '#3d7bff55');
  g.addColorStop(1, '#3d7bff00');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(gate.x, gate.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#bff4ff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(gate.x, gate.y, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#eafcff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JUMP GATE', gate.x, gate.y + 4);
}

export function drawShards(ctx, world) {
  for (const s of world.shardList) {
    const blink = s.life < 2 ? (Math.sin(s.life * 12) > 0 ? 1 : 0.35) : 1;
    ctx.save();
    ctx.globalAlpha = blink;
    ctx.translate(s.x, s.y);
    ctx.rotate(s.spin);
    ctx.shadowColor = P.shardGlow;
    ctx.shadowBlur = 10;
    ctx.fillStyle = P.shard;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 9);
    ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff7d6';
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(2.5, 0);
    ctx.lineTo(0, 4);
    ctx.lineTo(-2.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

export function drawPowerups(ctx, world) {
  const labels = { shield: 'S', magnet: 'M', rapid: 'R', slow: 'T' };
  const colors = { shield: '#7ee7ff', magnet: '#ff9ff3', rapid: '#ffe066', slow: '#9dffb0' };
  for (const u of world.powerups) {
    const blink = u.life < 2 ? (Math.sin(u.life * 12) > 0 ? 1 : 0.4) : 1;
    ctx.save();
    ctx.globalAlpha = blink;
    ctx.shadowColor = colors[u.kind];
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#0b1530';
    ctx.strokeStyle = colors[u.kind];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(u.x, u.y, u.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = colors[u.kind];
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[u.kind], u.x, u.y + 1);
    ctx.restore();
  }
}

export function drawAsteroids(ctx, world) {
  for (const a of world.asteroids) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rot);
    ctx.beginPath();
    a.verts.forEach((v, i) => {
      const x = Math.cos(v.a) * v.d;
      const y = Math.sin(v.a) * v.d;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = a.flash > 0 ? '#cdd7ea' : P.rockDark;
    ctx.fill();
    ctx.strokeStyle = P.rock;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#aeb9cc33';
    ctx.beginPath();
    ctx.arc(-a.radius * 0.25, -a.radius * 0.2, a.radius * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (a.maxHp > 1) {
      ctx.fillStyle = '#00000088';
      ctx.fillRect(a.x - 18, a.y - a.radius - 12, 36, 5);
      ctx.fillStyle = P.danger;
      ctx.fillRect(a.x - 18, a.y - a.radius - 12, 36 * (a.hp / a.maxHp), 5);
    }
  }
}

export function drawBullets(ctx, world) {
  ctx.save();
  ctx.shadowColor = P.bullet;
  ctx.shadowBlur = 8;
  ctx.fillStyle = P.bullet;
  for (const b of world.bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, CONFIG.bulletRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPlayer(ctx, world, time) {
  const p = world.player;
  if (!p.alive) return;
  if (p.invuln > 0 && Math.floor(time * 14) % 2 === 0) return; // blink while invulnerable
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  // Engine flame, flickering.
  const flame = 14 + Math.sin(time * 31) * 4 + Math.hypot(p.vx, p.vy) * 0.02;
  const fg = ctx.createLinearGradient(-14, 0, -14 - flame, 0);
  fg.addColorStop(0, '#ffca3a');
  fg.addColorStop(1, '#ff5d5d00');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(-13, -6);
  ctx.lineTo(-13 - flame, 0);
  ctx.lineTo(-13, 6);
  ctx.closePath();
  ctx.fill();
  // Hull: a salvage skiff.
  ctx.shadowColor = P.ship;
  ctx.shadowBlur = 12;
  ctx.fillStyle = P.ship;
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(-12, -13);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-12, 13);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = P.shipCore;
  ctx.beginPath();
  ctx.arc(4, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0b1530';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(-12, -13);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-12, 13);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  // Shield ring.
  if (world.shield) {
    ctx.save();
    ctx.strokeStyle = '#7ee7ffaa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, CONFIG.playerRadius + 10 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawParticles(ctx, world) {
  for (const pt of world.particles) {
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;
}

export function drawHud(ctx, world, best) {
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  // Score, top left.
  ctx.fillStyle = P.text;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(String(world.score).padStart(6, '0'), 16, 36);
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = P.dim;
  ctx.fillText('SCORE', 16, 54);
  if (world.combo > 1) {
    ctx.fillStyle = P.shard;
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('COMBO x' + world.combo, 16, 82);
    ctx.fillStyle = P.dim;
    ctx.fillRect(16, 90, 90 * (world.comboTimer / CONFIG.comboWindow), 4);
  }
  // Hull hearts, top centre.
  for (let i = 0; i < CONFIG.maxHull; i++) {
    const x = CONFIG.width / 2 - 34 + i * 36;
    const y = 28;
    ctx.fillStyle = i < world.hull ? '#ff5d7a' : '#ffffff22';
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.bezierCurveTo(x - 11, y - 2, x - 6, y - 11, x, y - 4);
    ctx.bezierCurveTo(x + 6, y - 11, x + 11, y - 2, x, y + 8);
    ctx.fill();
  }
  if (world.shield) {
    ctx.fillStyle = '#7ee7ff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHIELD', CONFIG.width / 2, 58);
  }
  // Sector + quota, top right.
  ctx.textAlign = 'right';
  ctx.fillStyle = P.text;
  ctx.font = 'bold 18px system-ui, sans-serif';
  const sectorLabel = world.sector > CONFIG.sectors
    ? 'SECTOR ' + world.sector + ' · ENDLESS'
    : 'SECTOR ' + world.sector + ' / ' + CONFIG.sectors;
  ctx.fillText(sectorLabel, CONFIG.width - 16, 30);
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = P.dim;
  const q = Math.min(world.shards, world.quota());
  ctx.fillText('SHARDS ' + q + ' / ' + world.quota(), CONFIG.width - 16, 50);
  const barW = 170;
  ctx.fillStyle = '#ffffff22';
  ctx.fillRect(CONFIG.width - 16 - barW, 58, barW, 8);
  ctx.fillStyle = world.jumpReady ? '#7CFC9A' : P.shard;
  ctx.fillRect(CONFIG.width - 16 - barW, 58, barW * (q / world.quota()), 8);
  if (world.jumpReady) {
    ctx.fillStyle = '#7CFC9A';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('JUMP DRIVE READY — FLY TO THE GATE', CONFIG.width - 16, 88);
  }
  // Active power-up timers, bottom left.
  let ty = CONFIG.height - 16;
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px system-ui, sans-serif';
  if (world.magnetTimer > 0) {
    ctx.fillStyle = '#ff9ff3';
    ctx.fillText('MAGNET ' + Math.ceil(world.magnetTimer) + 's', 16, ty);
    ty -= 20;
  }
  if (world.rapidTimer > 0) {
    ctx.fillStyle = '#ffe066';
    ctx.fillText('RAPID FIRE ' + Math.ceil(world.rapidTimer) + 's', 16, ty);
    ty -= 20;
  }
  if (world.slowTimer > 0) {
    ctx.fillStyle = '#9dffb0';
    ctx.fillText('SLOW TIME ' + Math.ceil(world.slowTimer) + 's', 16, ty);
    ty -= 20;
  }
  // Best score, bottom right.
  ctx.textAlign = 'right';
  ctx.fillStyle = P.dim;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('BEST ' + String(Math.max(best, world.score)).padStart(6, '0'), CONFIG.width - 16, CONFIG.height - 16);
  ctx.restore();
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = '#050914cc';
  ctx.strokeStyle = '#7ee7ff44';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();
}

function centred(ctx, text, y, font, color) {
  ctx.fillStyle = color || P.text;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.fillText(text, CONFIG.width / 2, y);
}

export function drawTitle(ctx, world, best) {
  drawBackground(ctx, world);
  drawShards(ctx, world);
  drawAsteroids(ctx, world);
  panel(ctx, CONFIG.width / 2 - 330, 108, 660, 384);
  centred(ctx, 'NOVA DRIFT', 182, 'bold 64px system-ui, sans-serif', '#7ee7ff');
  centred(ctx, 'Salvage the starfield. Charge the jump drive. Survive all five sectors.', 224, '16px system-ui, sans-serif', P.dim);
  centred(ctx, 'WASD / Arrows — fly      Mouse — aim      Click / Space — fire harpoon', 268, '15px system-ui, sans-serif');
  centred(ctx, 'Collect shards to charge the drive, then fly into the jump gate.', 292, '15px system-ui, sans-serif');
  centred(ctx, 'Smash rocks for shards and power-ups. Three hits and your skiff is scrap.', 316, '15px system-ui, sans-serif');
  centred(ctx, 'P — pause      M — mute      R — restart', 340, '14px system-ui, sans-serif', P.dim);
  const blink = Math.sin(performance.now() / 350) > -0.2;
  if (blink) centred(ctx, 'CLICK OR PRESS ENTER TO LAUNCH', 400, 'bold 20px system-ui, sans-serif', '#ffe066');
  if (best > 0) centred(ctx, 'BEST SCORE  ' + best, 440, 'bold 16px system-ui, sans-serif', P.shard);
  centred(ctx, 'An original game — art, sound and code made for this bounty.', 468, '12px system-ui, sans-serif', P.dim);
}

export function drawPaused(ctx) {
  ctx.fillStyle = '#050914b8';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  centred(ctx, 'PAUSED', 260, 'bold 52px system-ui, sans-serif', '#7ee7ff');
  centred(ctx, 'P or click to resume — R to restart from sector 1', 310, '16px system-ui, sans-serif', P.dim);
}

export function drawSectorClear(ctx, world) {
  ctx.fillStyle = '#050914a8';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  panel(ctx, CONFIG.width / 2 - 280, 150, 560, 260);
  centred(ctx, 'SECTOR ' + world.sector + ' CLEAR', 220, 'bold 44px system-ui, sans-serif', '#7CFC9A');
  centred(ctx, 'Jump complete. The next field is denser and faster.', 268, '16px system-ui, sans-serif');
  centred(ctx, 'SCORE  ' + world.score + '      SHARDS  ' + world.shards + '      KILLS  ' + world.kills, 306, 'bold 17px system-ui, sans-serif', P.shard);
  centred(ctx, 'CLICK OR PRESS ENTER FOR SECTOR ' + (world.sector + 1), 360, 'bold 18px system-ui, sans-serif', '#ffe066');
}

export function drawGameOver(ctx, world, best) {
  ctx.fillStyle = '#050914b8';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  panel(ctx, CONFIG.width / 2 - 300, 120, 600, 330);
  centred(ctx, 'SHIP LOST', 190, 'bold 54px system-ui, sans-serif', '#ff5d5d');
  centred(ctx, 'Your skiff broke apart in sector ' + world.sector + '.', 232, '16px system-ui, sans-serif', P.dim);
  centred(ctx, 'SCORE  ' + world.score, 282, 'bold 26px system-ui, sans-serif', P.text);
  centred(ctx, 'BEST  ' + best + '      SHARDS  ' + world.shards + '      KILLS  ' + world.kills + '      ACCURACY  ' + world.accuracy() + '%', 318, '15px system-ui, sans-serif', P.dim);
  centred(ctx, 'BEST COMBO  x' + world.bestCombo, 344, '15px system-ui, sans-serif', P.dim);
  centred(ctx, 'PRESS R OR CLICK TO FLY AGAIN', 396, 'bold 19px system-ui, sans-serif', '#ffe066');
}

export function drawWin(ctx, world, best) {
  ctx.fillStyle = '#050914a8';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  panel(ctx, CONFIG.width / 2 - 310, 110, 620, 350);
  centred(ctx, 'ALL SECTORS CLEAR!', 180, 'bold 46px system-ui, sans-serif', '#7CFC9A');
  centred(ctx, 'You charged the drive five times and jumped home through the drift.', 224, '16px system-ui, sans-serif', P.dim);
  centred(ctx, 'FINAL SCORE  ' + world.score, 274, 'bold 28px system-ui, sans-serif', '#ffe066');
  centred(ctx, 'BEST  ' + best + '      KILLS  ' + world.kills + '      ACCURACY  ' + world.accuracy() + '%      BEST COMBO  x' + world.bestCombo, 312, '15px system-ui, sans-serif', P.dim);
  centred(ctx, 'Press C to keep flying in endless mode, or R to start a new run.', 356, '16px system-ui, sans-serif');
  centred(ctx, 'CLICK OR PRESS ENTER TO PLAY AGAIN', 408, 'bold 18px system-ui, sans-serif', '#ffe066');
}

export function drawWorld(ctx, world, best, time) {
  drawBackground(ctx, world);
  drawJumpGate(ctx, world);
  drawShards(ctx, world);
  drawPowerups(ctx, world);
  drawAsteroids(ctx, world);
  drawBullets(ctx, world);
  drawPlayer(ctx, world, time);
  drawParticles(ctx, world);
  drawHud(ctx, world, best);
}
