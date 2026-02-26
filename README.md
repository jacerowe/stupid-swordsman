# Stupid Swordsman

A fast-paced 2D endless runner / combat game built with Phaser 3. No installs required — runs entirely in the browser via CDN.

## Play

**GitHub Pages URL:** https://[your-username].github.io/stupid-swordsman/

---

## Controls

| Action | Input |
|--------|-------|
| Jump | `Space` |
| Attack (swing sword) | Left Mouse Button |
| Restart (on game over) | `R` key or Restart button |

---

## Gameplay Rules

### Sword Mechanics
- The sword has two rest states: **UP** and **DOWN**
- Clicking LMB triggers a swing:
  - Sword UP → swings DOWN, then stays DOWN
  - Sword DOWN → swings UP, then stays UP
- **0.4s cooldown** between swings — no spamming
- Damage is only dealt during the **active frames** of the swing

### Enemies & Obstacles
- **Basic Enemy (1 HP):** Red creature — kill with one sword hit
- **Armored Enemy (2 HP):** Blue armored creature — spawns at 1000+ score
  - First hit: knocks it back (gives you cooldown time)
  - Second hit: kills it
- **Crate:** Brown wooden box — **cannot be damaged by sword**, must be jumped over
- You **cannot jump over enemies** to avoid damage — their hitbox is tall

### Difficulty Progression
| Score | Event |
|-------|-------|
| 0 | Normal speed |
| 500 | Speed increases |
| 1000 | Speed increases again + Armored enemies begin spawning |
| 1000+ | Speed and armored enemy rate gradually increase |

### Health & Damage
- Player has **3 hearts**
- Taking damage → lose 1 heart + 0.8s invulnerability + flash effect
- 0 hearts → Game Over

---

## Spawning System

The spawner is **fully random with fairness constraints**:
- Random interval between spawns (0.9–1.6s, faster after 500 score)
- ~40% chance each spawn is a crate
- Prevents back-to-back crates too often
- Armored enemies won't spawn consecutively more than twice
- Minimum reaction time: enemies/crates always spawn off the right edge and travel in naturally

---

## Project Structure

```
stupid-swordsman/
  index.html              # Entry point — loads Phaser 3 via CDN
  src/
    main.js               # Phaser game config
    scenes/
      GameScene.js        # Main game loop, world, collisions
      UIScene.js          # HUD, hearts, score, game over overlay
    entities/
      Player.js           # Player character, jump, damage, animation
      Sword.js            # Sword swing, cooldown, hitbox, UP/DOWN toggle
      EnemyBasic.js       # 1 HP enemy
      EnemyArmored.js     # 2 HP enemy with knockback
      Crate.js            # Obstacle (sword-immune)
    systems/
      Spawner.js          # RNG spawning with fairness constraints
      Difficulty.js       # Speed milestones and difficulty ramp
  README.md
```

---

## How to Run Locally

Since it's pure static files, just serve the folder:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.

**Or simply open `index.html` directly** — it uses CDN-loaded Phaser so it works without a server in most browsers (Chrome may block local file CORS; use a simple server if so).

---

## Extending the Game

- **Tuning constants:** Edit `Difficulty.js` (speed values, milestones) and `Spawner.js` (spawn intervals, crate chance, armored chance)
- **New enemy type:** Create a new class in `src/entities/`, add it to `Spawner.js` spawn logic, push to `scene.enemies`
- **New obstacle:** Same pattern — create entity, push to `scene.crates`
- **Sound effects:** Use `this.sound.add()` in GameScene after loading audio assets in a preload method
- **Sprite art:** Replace the `add.graphics()` calls in each entity with `this.scene.add.image()` / `this.scene.add.sprite()` calls after loading your sprite sheets

---

## Tech Stack

- [Phaser 3](https://phaser.io/) via jsDelivr CDN (no build step, no npm)
- Pure vanilla JavaScript ES6 classes
- Hosted on GitHub Pages (static, no server needed)
