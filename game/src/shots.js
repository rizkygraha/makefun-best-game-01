// shots.js — deterministic staging for screenshots. The page reads
// ?shot=start|play|end and an optional &seed=, and this module arranges the
// world so each screenshot shows the game at its best: the title screen, a
// busy moment of play with the HUD, or the game-over screen. It only stages
// stills; the real game never uses it.
import { CONFIG } from './config.js';

export function stageShot(world, shot, seed) {
  world.reset();
  const rng = world.rng;
  if (shot === 'start') {
    // A lively title backdrop: rocks drifting, shards glinting.
    for (let i = 0; i < 7; i++) world.spawnAsteroid();
    for (const a of world.asteroids) {
      a.y = rng() * CONFIG.height * 0.8;
      a.x = rng() * CONFIG.width;
    }
    world.spawnShard(220, 180, 3);
    world.spawnShard(700, 260, 3);
    world.spawnShard(480, 420, 2);
    return;
  }
  if (shot === 'play') {
    world.score = 2840;
    world.shards = 9;
    world.combo = 5;
    world.comboTimer = 2.0;
    world.hull = 2;
    world.kills = 14;
    world.shotsFired = 60;
    world.shotsHit = 41;
    world.player.x = 480;
    world.player.y = 380;
    world.player.angle = -0.7;
    world.shield = true;
    world.rapidTimer = 4;
    for (let i = 0; i < 9; i++) world.spawnAsteroid();
    for (const a of world.asteroids) {
      a.y = 40 + rng() * 320;
      a.x = 60 + rng() * (CONFIG.width - 120);
    }
    world.spawnShard(560, 300, 3);
    world.spawnShard(350, 220, 2);
    world.spawnShard(700, 430, 2);
    world.spawnPowerup(760, 180);
    world.bullets.push({ x: 520, y: 350, vx: 480, vy: -420, life: 0.8 });
    world.bullets.push({ x: 540, y: 340, vx: 500, vy: -380, life: 0.8 });
    world.burst(300, 160, '#ff9f1c', 10, 160);
    world.burst(640, 120, '#8d99ae', 10, 160);
    return;
  }
  if (shot === 'end') {
    world.score = 3120;
    world.shards = 11;
    world.kills = 19;
    world.shotsFired = 88;
    world.shotsHit = 52;
    world.bestCombo = 6;
    world.sector = 3;
    world.hull = 0;
    world.player.alive = false;
    for (let i = 0; i < 6; i++) world.spawnAsteroid();
    for (const a of world.asteroids) {
      a.y = 60 + rng() * 300;
      a.x = 80 + rng() * (CONFIG.width - 160);
    }
    world.burst(480, 380, '#7ee7ff', 26, 260);
    world.burst(480, 380, '#ff9f1c', 16, 200);
    return;
  }
}
