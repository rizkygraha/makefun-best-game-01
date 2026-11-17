# NOVA DRIFT

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/bright-sparrow-85/nova-drift/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/bright-sparrow-85/nova-drift/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**NOVA DRIFT** is an original arcade space-salvage game: pilot a salvage skiff through an asteroid field, smash rocks with your harpoon, collect star shards to charge the jump drive, and jump through all five sectors to win — or keep flying in endless mode.

## How to play

- **WASD / arrow keys** — fly the skiff
- **Mouse** — aim the harpoon
- **Click / Space** — fire
- **P** — pause · **R** — restart · **M** — mute

Collect the shard quota in each sector to charge the jump drive, then fly into the jump gate. Chained pickups build a combo multiplier (up to x8). Asteroids drop power-ups: shield, magnet, rapid fire and slow time. Three hull hits and your skiff is scrap — but a new run is one key away.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

The game is plain static files under `game/` — no build step, no network requests, all art drawn on canvas and all sound synthesised with WebAudio. Screenshots in `screenshots/` are real renders of the game itself.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
