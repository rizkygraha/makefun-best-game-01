// world.js — the simulation: the ship, asteroids, shards, harpoons, power-ups
// and particles. No drawing here; render.js reads this state.
import { CONFIG } from './config.js';
import { makeRng, range, pick } from './random.js';

export const POWERUP_KINDS = ['shield', 'magnet', 'rapid', 'slow'];

export class World {
  constructor(seed) {
    this.rng = makeRng(seed);
    this.reset();
  }

  reset() {
    this.time = 0;
    this.sector = 1;
    this.score = 0;
    this.shards = 0; // shards banked this sector
    this.combo = 0;
    this.comboTimer = 0;
    this.hull = CONFIG.maxHull;
    this.kills = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.bestCombo = 0;
    this.jumpReady = false;
    this.jumpGate = null;
    this.spawnTimer = 0;
    this.spawnInterval = CONFIG.spawnIntervalStart;
    this.slowTimer = 0;
    this.rapidTimer = 0;
    this.magnetTimer = 0;
    this.shield = false;
    this.player = {
      x: CONFIG.width / 2,
      y: CONFIG.height - 110,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      invuln: 0,
      cooldown: 0,
      alive: true,
    };
    this.asteroids = [];
    this.bullets = [];
    this.shardList = [];
    this.powerups = [];
    this.particles = [];
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: this.rng() * CONFIG.width,
        y: this.rng() * CONFIG.height,
        z: range(this.rng, 0.25, 1),
        tw: range(this.rng, 0, Math.PI * 2),
      });
    }
    this.nebulae = [];
    for (let i = 0; i < 5; i++) {
      this.nebulae.push({
        x: this.rng() * CONFIG.width,
        y: this.rng() * CONFIG.height,
        r: range(this.rng, 120, 260),
        color: pick(this.rng, ['nebulaA', 'nebulaB', 'nebulaC']),
      });
    }
  }

  quota() {
    return CONFIG.quotaFor(this.sector);
  }

  startSector(sector) {
    this.sector = sector;
    this.shards = 0;
    this.jumpReady = false;
    this.jumpGate = null;
    this.asteroids.length = 0;
    this.bullets.length = 0;
    this.shardList.length = 0;
    this.powerups.length = 0;
    this.spawnInterval = Math.max(
      CONFIG.spawnIntervalMin,
      CONFIG.spawnIntervalStart - (sector - 1) * 0.12,
    );
    this.spawnTimer = 0.4;
    this.player.x = CONFIG.width / 2;
    this.player.y = CONFIG.height - 110;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.invuln = 1.2;
  }

  spawnAsteroid() {
    const r = this.rng;
    const big = r() < 0.22;
    const radius = big ? range(r, 34, 46) : range(r, 14, 30);
    const edge = Math.floor(r() * 4);
    let x;
    let y;
    let vx;
    let vy;
    const speed = CONFIG.asteroidBaseSpeed + (this.sector - 1) * CONFIG.asteroidSpeedPerSector;
    if (edge === 0) { // top
      x = range(r, 0, CONFIG.width);
      y = -radius;
      vx = range(r, -30, 30);
      vy = range(r, speed * 0.7, speed * 1.3);
    } else if (edge === 1) { // left
      x = -radius;
      y = range(r, 0, CONFIG.height * 0.6);
      vx = range(r, speed * 0.5, speed);
      vy = range(r, 10, speed * 0.7);
    } else if (edge === 2) { // right
      x = CONFIG.width + radius;
      y = range(r, 0, CONFIG.height * 0.6);
      vx = -range(r, speed * 0.5, speed);
      vy = range(r, 10, speed * 0.7);
    } else { // top, aimed near the player
      x = range(r, 0, CONFIG.width);
      y = -radius;
      const dx = this.player.x - x;
      const dy = this.player.y - y;
      const d = Math.hypot(dx, dy) || 1;
      vx = (dx / d) * speed * range(r, 0.5, 0.9);
      vy = (dy / d) * speed * range(r, 0.6, 1.0);
    }
    this.asteroids.push({
      x, y, vx, vy,
      radius,
      rot: range(r, 0, Math.PI * 2),
      spin: range(r, -1.2, 1.2),
      hp: big ? 3 : 1,
      maxHp: big ? 3 : 1,
      verts: this.makeRockShape(r, radius),
      flash: 0,
    });
  }

  makeRockShape(rng, radius) {
    const n = 9;
    const verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      verts.push({ a, d: radius * range(rng, 0.72, 1.08) });
    }
    return verts;
  }

  spawnShard(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.shardList.push({
        x: x + range(this.rng, -14, 14),
        y: y + range(this.rng, -14, 14),
        vx: range(this.rng, -40, 40),
        vy: range(this.rng, -70, -10),
        r: 8,
        spin: range(this.rng, 0, Math.PI * 2),
        life: 9,
      });
    }
  }

  spawnPowerup(x, y) {
    this.powerups.push({
      x, y,
      vx: range(this.rng, -15, 15),
      vy: 42,
      r: 13,
      kind: pick(this.rng, POWERUP_KINDS),
      life: 10,
      bob: range(this.rng, 0, Math.PI * 2),
    });
  }

  burst(x, y, color, n, speed) {
    for (let i = 0; i < n; i++) {
      const a = this.rng() * Math.PI * 2;
      const s = range(this.rng, speed * 0.3, speed);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: range(this.rng, 0.3, 0.8),
        maxLife: 0.8,
        size: range(this.rng, 2, 5),
        color,
      });
    }
  }

  fire(angle) {
    const p = this.player;
    if (p.cooldown > 0) return false;
    p.cooldown = this.rapidTimer > 0 ? CONFIG.rapidFireCooldown : CONFIG.fireCooldown;
    const bx = p.x + Math.cos(angle) * 22;
    const by = p.y + Math.sin(angle) * 22;
    this.bullets.push({
      x: bx, y: by,
      vx: Math.cos(angle) * CONFIG.bulletSpeed,
      vy: Math.sin(angle) * CONFIG.bulletSpeed,
      life: CONFIG.bulletLife,
    });
    this.shotsFired++;
    this.burst(bx, by, '#ffe066', 3, 60);
    return true;
  }

  damagePlayer() {
    const p = this.player;
    if (p.invuln > 0 || !p.alive) return 'none';
    if (this.shield) {
      this.shield = false;
      p.invuln = CONFIG.invulnSeconds;
      this.burst(p.x, p.y, '#7ee7ff', 18, 220);
      return 'shield';
    }
    this.hull -= 1;
    this.combo = 0;
    this.comboTimer = 0;
    p.invuln = CONFIG.invulnSeconds;
    this.burst(p.x, p.y, '#ff5d5d', 22, 260);
    if (this.hull <= 0) {
      p.alive = false;
      this.burst(p.x, p.y, '#7ee7ff', 40, 320);
      this.burst(p.x, p.y, '#ff9f1c', 24, 240);
      return 'dead';
    }
    return 'hit';
  }

  applyPowerup(kind) {
    if (kind === 'shield') this.shield = true;
    if (kind === 'magnet') this.magnetTimer = CONFIG.powerupSeconds;
    if (kind === 'rapid') this.rapidTimer = CONFIG.powerupSeconds;
    if (kind === 'slow') this.slowTimer = CONFIG.powerupSeconds;
  }

  collectShard(s) {
    this.shards++;
    this.combo = Math.min(this.combo + 1, CONFIG.comboMax);
    this.comboTimer = CONFIG.comboWindow;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const gained = CONFIG.shardValue * this.combo;
    this.score += gained;
    if (this.shards >= this.quota() && !this.jumpReady) {
      this.jumpReady = true;
      this.jumpGate = {
        x: CONFIG.width / 2,
        y: 84,
        r: 46,
        pulse: 0,
      };
    }
    return gained;
  }

  // One simulation step. Returns event names the loop turns into sounds.
  update(dt, input) {
    const events = [];
    const timeScale = this.slowTimer > 0 ? 0.55 : 1;
    const sdt = dt * timeScale;
    this.time += dt;
    if (this.slowTimer > 0) this.slowTimer -= dt;
    if (this.rapidTimer > 0) this.rapidTimer -= dt;
    if (this.magnetTimer > 0) this.magnetTimer -= dt;

    const p = this.player;
    if (p.alive) {
      // Steering: keyboard thrust; the ship points at the mouse when it is inside.
      const ax = input.axis();
      p.vx += ax.x * CONFIG.playerAccel * dt;
      p.vy += ax.y * CONFIG.playerAccel * dt;
      p.vx -= p.vx * CONFIG.playerFriction * dt;
      p.vy -= p.vy * CONFIG.playerFriction * dt;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > CONFIG.playerMaxSpeed) {
        p.vx = (p.vx / sp) * CONFIG.playerMaxSpeed;
        p.vy = (p.vy / sp) * CONFIG.playerMaxSpeed;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.x = Math.max(20, Math.min(CONFIG.width - 20, p.x));
      p.y = Math.max(20, Math.min(CONFIG.height - 20, p.y));
      if (input.mouseInside) {
        p.angle = Math.atan2(input.mouseY - p.y, input.mouseX - p.x);
      } else if (sp > 40) {
        p.angle = Math.atan2(p.vy, p.vx);
      }
      if (p.invuln > 0) p.invuln -= dt;
      if (p.cooldown > 0) p.cooldown -= dt;
      if (input.firing() && this.fire(p.angle)) events.push('shoot');
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // Spawning ramps up over the sector.
    this.spawnTimer -= sdt;
    this.spawnInterval = Math.max(
      CONFIG.spawnIntervalMin,
      this.spawnInterval - CONFIG.spawnRampPerSecond * sdt,
    );
    if (this.spawnTimer <= 0 && this.asteroids.length < CONFIG.maxAsteroids) {
      this.spawnAsteroid();
      this.spawnTimer = this.spawnInterval * range(this.rng, 0.7, 1.3);
    }

    // Asteroids drift, spin and leave the field.
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const a = this.asteroids[i];
      a.x += a.vx * sdt;
      a.y += a.vy * sdt;
      a.rot += a.spin * sdt;
      if (a.flash > 0) a.flash -= dt;
      if (a.y > CONFIG.height + 80 || a.x < -90 || a.x > CONFIG.width + 90) {
        this.asteroids.splice(i, 1);
      }
    }

    // Bullets fly and shatter rocks.
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * sdt;
      b.y += b.vy * sdt;
      b.life -= dt;
      let dead = b.life <= 0 || b.x < -20 || b.x > CONFIG.width + 20 || b.y < -20 || b.y > CONFIG.height + 20;
      if (!dead) {
        for (let j = this.asteroids.length - 1; j >= 0; j--) {
          const a = this.asteroids[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          if (dx * dx + dy * dy < (a.radius + CONFIG.bulletRadius) ** 2) {
            this.shotsHit++;
            dead = true;
            a.hp -= 1;
            a.flash = 0.12;
            this.burst(b.x, b.y, '#ffe066', 6, 140);
            if (a.hp <= 0) {
              this.kills++;
              this.score += a.maxHp > 1 ? 150 : 100;
              this.burst(a.x, a.y, '#8d99ae', 16, 200);
              this.burst(a.x, a.y, '#ff9f1c', 8, 160);
              this.spawnShard(a.x, a.y, a.maxHp > 1 ? 3 : 2);
              if (this.rng() < CONFIG.powerupChance) this.spawnPowerup(a.x, a.y);
              this.asteroids.splice(j, 1);
              events.push('explosion');
            }
            break;
          }
        }
      }
      if (dead) this.bullets.splice(i, 1);
    }

    // Shards drift, get magnetised, and get collected.
    const magnetR = this.magnetTimer > 0 ? CONFIG.magnetRadiusPowered : CONFIG.magnetRadius;
    for (let i = this.shardList.length - 1; i >= 0; i--) {
      const s = this.shardList[i];
      s.life -= dt;
      s.spin += dt * 3;
      const dx = p.x - s.x;
      const dy = p.y - s.y;
      const d = Math.hypot(dx, dy);
      if (p.alive && d < magnetR) {
        const pull = 900 * (1 - d / (magnetR + 40));
        s.vx += (dx / (d || 1)) * pull * dt;
        s.vy += (dy / (d || 1)) * pull * dt;
      } else {
        s.vx *= (1 - 0.6 * dt);
        s.vy += 26 * dt;
      }
      s.x += s.vx * sdt;
      s.y += s.vy * sdt;
      if (s.life <= 0 || s.y > CONFIG.height + 30) {
        this.shardList.splice(i, 1);
        continue;
      }
      if (p.alive && d < CONFIG.playerRadius + s.r + 4) {
        this.shardList.splice(i, 1);
        this.collectShard(s);
        this.burst(s.x, s.y, '#ffd166', 8, 120);
        events.push('pickup');
      }
    }

    // Power-ups bob down and apply on touch.
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const u = this.powerups[i];
      u.life -= dt;
      u.bob += dt * 4;
      u.y += u.vy * sdt;
      u.x += u.vx * sdt + Math.sin(u.bob) * 12 * dt;
      if (u.life <= 0 || u.y > CONFIG.height + 30) {
        this.powerups.splice(i, 1);
        continue;
      }
      if (p.alive) {
        const dx = p.x - u.x;
        const dy = p.y - u.y;
        if (dx * dx + dy * dy < (CONFIG.playerRadius + u.r + 4) ** 2) {
          this.applyPowerup(u.kind);
          this.powerups.splice(i, 1);
          this.score += 25;
          events.push('powerup');
        }
      }
    }

    // Rocks hitting the ship.
    if (p.alive) {
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        const a = this.asteroids[j];
        const dx = p.x - a.x;
        const dy = p.y - a.y;
        const rr = CONFIG.playerRadius + a.radius - 6;
        if (dx * dx + dy * dy < rr * rr) {
          const outcome = this.damagePlayer();
          this.asteroids.splice(j, 1);
          this.burst(a.x, a.y, '#8d99ae', 14, 200);
          if (outcome === 'dead') events.push('dead');
          else if (outcome === 'shield') events.push('shield');
          else if (outcome === 'hit') events.push('hit');
          break;
        }
      }
    }

    // Jump gate: fly into it once the drive is charged.
    if (this.jumpReady && this.jumpGate && p.alive) {
      this.jumpGate.pulse += dt;
      const dx = p.x - this.jumpGate.x;
      const dy = p.y - this.jumpGate.y;
      if (dx * dx + dy * dy < (this.jumpGate.r + CONFIG.playerRadius) ** 2) {
        events.push('jump');
        this.jumpGate = null;
      }
    }

    // Particles fade.
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= (1 - 1.6 * dt);
      pt.vy *= (1 - 1.6 * dt);
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // Stars twinkle and scroll slowly.
    for (const s of this.stars) {
      s.tw += dt * 2;
      s.y += 6 * s.z * dt;
      if (s.y > CONFIG.height + 2) {
        s.y = -2;
        s.x = this.rng() * CONFIG.width;
      }
    }

    return events;
  }

  accuracy() {
    if (this.shotsFired === 0) return 100;
    return Math.round((this.shotsHit / this.shotsFired) * 100);
  }
}
