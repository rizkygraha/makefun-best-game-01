// config.js — every tuning number for NOVA DRIFT lives here, so the game can be
// balanced without touching the simulation or the renderer.
export const CONFIG = {
  width: 960,
  height: 600,
  // Sectors: the campaign. Finishing sector 5 wins the game.
  sectors: 5,
  // Shards needed to charge the jump drive in each sector.
  quotaFor: (sector) => 10 + sector * 4,
  // Player
  playerRadius: 16,
  playerAccel: 2600,
  playerMaxSpeed: 420,
  playerFriction: 3.2,
  maxHull: 3,
  invulnSeconds: 1.6,
  // Harpoon bolts
  bulletSpeed: 640,
  bulletRadius: 4,
  bulletLife: 0.9,
  fireCooldown: 0.22,
  rapidFireCooldown: 0.09,
  // Asteroids
  asteroidBaseSpeed: 55,
  asteroidSpeedPerSector: 14,
  spawnIntervalStart: 1.15,
  spawnIntervalMin: 0.42,
  maxAsteroids: 26,
  // Shards
  shardValue: 50,
  comboWindow: 2.5,
  comboMax: 8,
  magnetRadius: 110,
  magnetRadiusPowered: 240,
  // Power-ups
  powerupChance: 0.16, // chance an asteroid drops one
  powerupSeconds: 8,
  // Difficulty ramps inside a sector
  spawnRampPerSecond: 0.004,
  // Look
  palette: {
    bg0: '#050914',
    bg1: '#0b1530',
    nebulaA: '#1c2f6e',
    nebulaB: '#5b2a86',
    nebulaC: '#0e4a5e',
    ship: '#7ee7ff',
    shipCore: '#eafcff',
    bullet: '#ffe066',
    shard: '#ffd166',
    shardGlow: '#ff9f1c',
    rock: '#8d99ae',
    rockDark: '#5b6577',
    danger: '#ff5d5d',
    ok: '#7CFC9A',
    text: '#eaf6ff',
    dim: '#9db4d0',
  },
};
