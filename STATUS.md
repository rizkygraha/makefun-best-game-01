# STATUS — best-game-01 / NOVA DRIFT

- Akun: bright-sparrow-85 (wallet publik GVyLEgZ5UX1vEdfvDfdswtwWX4tNNmuVEQvtkXsGDbjF)
- Deadline entri: Kamis 19 Nov 2026 01:00 WIB (18 Nov 2026 18:00 UTC)
- Dibuat: Selasa 17 Nov 2026 ~19:55 WIB

## Requirements (GET /api/competitions/best-game-01/requirements)

- Node.js 22.18+: OK — v24.22.1 terpasang.
- Desktop browser (Chrome): TERATASI untuk pengujian — tidak ada binary
  sistem, tapi Playwright Chromium berhasil diunduh
  (`~/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`, 419 MB)
  dan dipakai untuk mengambil screenshot + uji main. Prasyarat terpenuhi
  secara fungsional (browser desktop headless), bukan Chrome terinstal.
- Deliverables wajib: repo_url, commit_sha, bundle (transkrip), entry_message,
  entry_signature, LICENSE, main.ts. `handed_over_places: none` — sesi
  handed-over TIDAK mendapat tempat berbayar.

## Kit

- Terunduh: `best-game-01-kit/` (RULES.txt, cli/makefun.mjs, starter/, kit.json).
- Repo git lokal: `git init -b main` sudah dilakukan di direktori bounty ini.

## Game: NOVA DRIFT (orisinal)

- `game/index.html` + `game/src/`: config, random, audio (WebAudio synth,
  tanpa file audio), input (keyboard+mouse), world (simulasi), render
  (canvas + HUD + semua layar), shots (staging `?shot=`), main (state machine).
- `main.ts` (entrypoint, ditulis sendiri), `vendor/makefun-game.ts` (kit,
  hash sama persis dengan kit), `serve.ts`, `shots.json`, `LICENSE` (MIT),
  `README.md` (badge make.fun), `.makefun/owner.json` (wallet publik).
- Gameplay: terbangkan skiff (WASD/panah), bidik dengan mouse, tembak dengan
  klik/Space; kumpulkan shard untuk mengisi jump drive, terbang ke jump gate;
  5 sektor = menang (layar WIN) + mode endless; 3 hull, combo x8, power-up
  (shield/magnet/rapid/slow), pause (P), restart (R), mute (M), skor terbaik
  di localStorage. Semua offline, tanpa network request.

## Pengujian

- `node --check` semua file JS/TS: OK.
- Simulasi Node atas `world.js`: spawn, tembak & bunuh asteroid, shard,
  quota -> jump gate -> jump, combo (50/100/150), shield, kematian: SEMUA OK.
- `node serve.ts` (port 8091): index 200 + main.js 200. OK.
- Screenshot asli via Playwright Chromium headless (1280x720, JPEG q82):
  1-start.jpg 54.900 B, 2-play.jpg 32.296 B, 3-end.jpg 35.242 B,
  4-live.jpg 18.160 B — semuanya < 256 KiB. Nol request eksternal,
  nol page error (setelah favicon data: URI). Semua 4 diperiksa visual:
  title, play + HUD, game over + statistik, live play (klik start, gerak,
  tembak — jalan).
- `MAKEFUN_OUTPUT_DIR=out node main.ts`: OK — dossier.json 236.085 byte
  (< 1,5 MiB), 4 screenshot, 9 file sumber (45.798 byte).
- `node cli/makefun.mjs check` (kit, tanpa transkrip): 4 PASSED
  (competition_open, snapshot 22 file/253.615 byte, license_osi MIT,
  entrypoint main.ts node22), 1 FAILED (transcripts_present — belum ada
  bundle, sudah diduga), 14 skipped, 5 checked at submission
  (repo_public, repo_owner, repo_created_after_open, commit_in_repo,
  duplicate_snapshot — semuanya menunggu push GitHub).
- Commit git: 5845b165d80cb2f0a865d806f7184f23db388092 (40 karakter, branch main).

## Transkrip — bundle --dry-run (dijalankan lebih awal)

- DITEMUKAN 3 sesi Muse app (bukan nol):
  - `sessions/muse-app/21be26c6-...jsonl` (sesi subagent ini, 12 turns)
  - `sessions/muse-app/89983377-...jsonl` (sesi parent, 16 turns)
  - `sessions/muse-app/cc93f902-...jsonl` (12 turns)
  - + 1 instruction file (AGENTS.md).
- Yang MASIH KURANG untuk bundle asli (dicatat dry-run):
  - `--mcp none` (tidak ada MCP server dipakai) atau daftar server.
  - Fakta agen: `--harness-version`, `--provider`, `--effort`
    (harness muse-app tercatat, model Muse Spark 1.3, provider meta).
  - `--muse-usage <file>`: 0 usage rows terpasang — baris usage ditulis saat
    pesan terkirim; subagent ini harus SELESAI dulu, baru agen utama
    menjalankan SELECT muse.db (lihat `bundle --help`) dan membundel.
  - Run record prompt: dry-run mengambil prompt dari sesi parent lama
    ("Jadi kalau aku ingin login akunnya gimana?...") — BUKAN prompt pembuka
    untuk build bounty ini; saat submit perlu `--prompt-file` dengan kata-kata
    user yang memulai run ini + `--prompt-origin`/`--prompt-via` yang benar.

## Blocker submit

1. GitHub BELUM login (gh auth status: tidak login). Repo lokal siap push,
   commit 5845b165d80cb2f0a865d806f7184f23db388092.
   CATATAN PENTING: requirements juga mengizinkan entri SOURCE BUNDLE tanpa
   GitHub (`repo_url bundle:<root sha>` + `submit --source ...`), tapi
   perintah `init` kit harus dijalankan SEBELUM file entri ditulis —
   init TIDAK dijalankan di sesi ini (tugas: siapkan repo GitHub), jadi
   jalur source bundle untuk repo ini kemungkinan SUDAH TERTUTUP (init
   menolak repo yang sudah berisi commit). Keputusan jalur submit
   (GitHub vs source bundle baru) ada di agen utama.
2. Bundle transkrip final harus dibuat agen utama SETELAH subagent ini selesai
   (usage rows + prompt-file + flag agen). Perintah yang disarankan dry-run:
   `bundle --repo <repo> --out transcripts.tar.gz --muse-usage <file>
   --mcp none --harness muse-app --harness-version <versi> --provider meta
   --model muse-spark-1.3 --effort default --system-prompt <file withheld>`
   + `--prompt-file` berisi kata-kata user yang memulai run ini
   (dry-run salah mengambil prompt sesi parent lama) + `--prompt-origin
   handed-off` + `--prompt-via`. Usage rows: SELECT muse.db sesuai
   `bundle --help` dengan agent_id 21be26c6-04a3-4d39-8146-52d55ff77f56
   (subagent ini), 89983377-8361-48f6-bd09-1394810fecea (parent),
   cc93f902-3d6f-4515-87cb-05bf448fdcb1.

## Belum selesai

- [x] Ambil 3 screenshot asli (start/play/end) via Playwright Chromium (+1 live).
- [x] Jalankan `main.ts` -> `out/` dan verifikasi dossier.json.
- [x] Commit git.
- [ ] Push ke GitHub publik + submit (menunggu akses GitHub + bundle final).
  Setelah push: isi About repo (website make.fun + topik makefun) dan
  perbarui badge rank/reward di README dengan owner/repo sebenarnya.
