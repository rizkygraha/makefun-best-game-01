// main.js — the game loop and the state machine: title, playing, paused,
// sector-clear, game-over and win. It wires input, the world, the renderer
// and the sound bank together, and keeps the best score in local storage.
import { CONFIG } from './config.js';
import { World } from './world.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import * as render from './render.js';
import { stageShot } from './shots.js';
import { hashSeed } from './random.js';

const BEST_KEY = 'nova-drift-best';

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Storage may be unavailable; the score still shows for this run.
  }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = params.get('seed')
  ? hashSeed(params.get('seed'))
  : (Date.now() % 2147483647);

const world = new World(seed);
const input = new Input(canvas);
const sounds = new SoundBank();
let best = loadBest();
let state = 'title'; // title | playing | paused | clear | over | win
let lastTime = performance.now();
let runTime = 0;
let endless = false;

function playSound(name) {
  if (name === 'shoot') sounds.shoot();
  else if (name === 'pickup') sounds.pickup(world.combo);
  else if (name === 'explosion') sounds.explosion();
  else if (name === 'hit') sounds.hit();
  else if (name === 'shield') sounds.powerup();
  else if (name === 'powerup') sounds.powerup();
  else if (name === 'jump') sounds.jump();
  else if (name === 'dead') sounds.lose();
}

function startRun() {
  sounds.ensure();
  sounds.startMusic();
  world.reset();
  world.startSector(1);
  endless = false;
  runTime = 0;
  state = 'playing';
}

function startSector(n) {
  world.startSector(n);
  state = 'playing';
}

function toTitle() {
  world.reset();
  state = 'title';
}

function finishRun() {
  if (world.score > best) {
    best = world.score;
    saveBest(best);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (state === 'playing') {
    runTime += dt;
    const events = world.update(dt, input);
    for (const e of events) playSound(e);
    if (events.includes('jump')) {
      sounds.levelClear();
      if (world.sector >= CONFIG.sectors && !endless) {
        state = 'win';
        sounds.win();
        finishRun();
      } else {
        state = 'clear';
      }
    }
    if (!world.player.alive) {
      state = 'over';
      sounds.stopMusic();
      finishRun();
    }
    if (input.takePressed('p') || input.takePressed('escape')) {
      state = 'paused';
    }
  } else if (state === 'title') {
    // The backdrop drifts gently behind the title.
    world.time += dt;
    for (const a of world.asteroids) {
      a.y += a.vy * dt * 0.4;
      a.rot += a.spin * dt * 0.4;
      if (a.y > CONFIG.height + 80) a.y = -60;
    }
    if (input.takePressed('enter') || input.takeClick()) startRun();
  } else if (state === 'paused') {
    if (input.takePressed('p') || input.takePressed('escape') || input.takeClick()) {
      state = 'playing';
    }
    if (input.takePressed('r')) startRun();
  } else if (state === 'clear') {
    if (input.takePressed('enter') || input.takeClick()) {
      startSector(world.sector + 1);
    }
  } else if (state === 'over') {
    if (input.takePressed('r') || input.takePressed('enter') || input.takeClick()) {
      startRun();
    }
  } else if (state === 'win') {
    if (input.takePressed('c')) {
      endless = true;
      startSector(world.sector + 1);
    } else if (input.takePressed('r') || input.takePressed('enter') || input.takeClick()) {
      startRun();
    }
  }

  if (input.takePressed('m')) {
    sounds.ensure();
    const muted = sounds.toggleMute();
    document.title = muted ? 'NOVA DRIFT (muted)' : 'NOVA DRIFT';
  }
  if (input.takePressed('r') && (state === 'playing' || state === 'paused')) {
    startRun();
  }

  // Draw.
  if (state === 'title') {
    render.drawTitle(ctx, world, best);
  } else if (state === 'paused') {
    render.drawWorld(ctx, world, best, now / 1000);
    render.drawPaused(ctx);
  } else if (state === 'clear') {
    render.drawWorld(ctx, world, best, now / 1000);
    render.drawSectorClear(ctx, world);
  } else if (state === 'over') {
    render.drawWorld(ctx, world, best, now / 1000);
    render.drawGameOver(ctx, world, best);
  } else if (state === 'win') {
    render.drawWorld(ctx, world, best, now / 1000);
    render.drawWin(ctx, world, best);
  } else {
    render.drawWorld(ctx, world, best, now / 1000);
  }

  input.endFrame();
  requestAnimationFrame(frame);
}

// Screenshot staging: ?shot=start|play|end draws one still frame and stops
// the loop, so a screenshot is a stable, deterministic render.
if (shot === 'start' || shot === 'play' || shot === 'end') {
  stageShot(world, shot, seed);
  if (shot === 'start') {
    render.drawTitle(ctx, world, 2840);
  } else if (shot === 'play') {
    render.drawWorld(ctx, world, 2840, 1.25);
  } else {
    render.drawWorld(ctx, world, 3120, 1.25);
    render.drawGameOver(ctx, world, 3120);
  }
  document.title = 'NOVA DRIFT — shot ' + shot;
} else {
  world.reset();
  for (let i = 0; i < 6; i++) world.spawnAsteroid();
  requestAnimationFrame(frame);
}
