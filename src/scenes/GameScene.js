class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.groundY = this.H - 60 + 28;

    this.gameOver = false;
    this.score = 0;
    this.scoreTimer = 0;

    this.difficulty = new Difficulty(this);
    this._buildBackground();
    this._buildGround();

    this.player = new Player(this, Math.floor(this.W * 0.22), this.groundY - 26);

    this.enemies = [];
    this.crates = [];
    this.powerups = [];
    this.scoreMultiplier = 1;
    this.scoreMultiplierTimer = 0;
    this.fireballActive = false;
    this.fireballTimer = 0;
    this.fireballOverlay = null;

    this.spawner = new Spawner(this);

    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.input.on('pointerdown', (ptr) => {
      if (ptr.leftButtonDown() && !this.gameOver) {
        this.player.tryAttack();
      }
    });

    this.events.on('swordWhiff', () => {
      if (!this.gameOver) {
        this.score = Math.max(0, this.score - 10);
      }
    });

    this.x2Text = this.add.text(this.W / 2, 80, 'x2 SCORE!', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffdd00',
      stroke: '#005500',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.fireballText = this.add.text(this.W / 2, 110, '🔥 FIREBALL DASH!', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ff4400',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.scene.launch('UIScene');
    this.uiScene = this.scene.get('UIScene');
  }

  _buildBackground() {
    const W = this.W, H = this.H;

    this.bgLayers = [];

    const skyColors = [
      { y: 0, h: H * 0.55, color: 0x0d0d2b },
      { y: H * 0.55, h: H * 0.45, color: 0x1a1a3e }
    ];
    skyColors.forEach(s => {
      const rect = this.add.rectangle(W / 2, s.y + s.h / 2, W, s.h, s.color);
      rect.setDepth(-10);
    });

    this.moonGfx = this.add.circle(W * 0.8, H * 0.18, 28, 0xeeeebb);
    this.moonGfx.setDepth(-9);

    this.starsGfx = this.add.graphics().setDepth(-9);
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Phaser.Math.RND.between(0, W),
        y: Phaser.Math.RND.between(10, H * 0.45),
        r: Phaser.Math.RND.realInRange(0.5, 2),
        speed: Phaser.Math.RND.realInRange(0.02, 0.06)
      });
    }

    this.bgMountains = this._createScrollLayer(3, (g, idx) => {
      g.fillStyle(0x1e1e4f, 1);
      const peaks = [
        [0, 160, 120, 60, 240, 145, 300, 70, 420, 160, 500, 130, 600, 165, 700, 75, 820, 155, 900, 165, 900, 200, 0, 200],
        [0, 165, 90, 90, 180, 155, 280, 85, 380, 165, 460, 100, 560, 160, 660, 110, 760, 165, 880, 130, 950, 165, 950, 200, 0, 200],
        [0, 170, 110, 100, 200, 165, 320, 95, 440, 170, 520, 115, 640, 168, 750, 108, 860, 172, 950, 160, 950, 200, 0, 200]
      ];
      g.fillPoints(peaks[idx % peaks.length].reduce((a, v, i) => {
        if (i % 2 === 0) a.push({ x: v, y: peaks[idx % peaks.length][i + 1] });
        return a;
      }, []), true);
    }, [0.08, 0.12, 0.18], -8);

    this.bgCity = this._createScrollLayer(2, (g, idx) => {
      g.fillStyle(idx === 0 ? 0x13132a : 0x0e0e22, 1);
      const buildings = idx === 0
        ? [[30, 100, 60, 80], [110, 110, 50, 70], [200, 90, 80, 100], [320, 105, 45, 65], [400, 85, 70, 95], [510, 100, 55, 80], [600, 80, 90, 100], [720, 110, 60, 70], [820, 92, 70, 90]]
        : [[50, 115, 40, 65], [140, 105, 60, 75], [240, 95, 55, 85], [340, 110, 50, 60], [440, 100, 65, 80], [540, 115, 45, 65], [640, 90, 75, 90], [750, 108, 55, 72], [860, 95, 65, 85]];
      buildings.forEach(([x, y, w, h]) => {
        g.fillRect(x, y, w, h);
        g.fillStyle(0xffee99, 0.6);
        for (let wx = x + 6; wx < x + w - 4; wx += 12) {
          for (let wy = y + 6; wy < y + h - 6; wy += 14) {
            if (Math.random() > 0.4) g.fillRect(wx, wy, 5, 6);
          }
        }
        g.fillStyle(idx === 0 ? 0x13132a : 0x0e0e22, 1);
      });
    }, [0.25, 0.4], -7);

  }

  _createScrollLayer(count, drawFn, speeds, depth) {
    const layers = [];
    for (let i = 0; i < count; i++) {
      const rt = this.add.renderTexture(0, 0, 900, this.H).setDepth(depth);
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      drawFn(g, i);
      rt.draw(g, 0, 0);
      g.destroy();
      layers.push({ rt, speed: speeds[i] || speeds[speeds.length - 1], x: 0 });
    }
    return layers;
  }

  _buildGround() {
    const W = this.W;
    const groundH = 40;
    this.groundGroup = this.physics.add.staticGroup();

    const groundBody = this.groundGroup.create(W / 2, this.groundY + groundH / 2);
    groundBody.setVisible(false);
    groundBody.refreshBody();
    groundBody.body.setSize(W * 3, groundH);

    const groundGfx = this.add.graphics().setDepth(0);
    groundGfx.fillStyle(0x1a3a1a, 1);
    groundGfx.fillRect(0, this.groundY, W, 8);
    groundGfx.fillStyle(0x0d1f0d, 1);
    groundGfx.fillRect(0, this.groundY + 8, W, 32);

    this.groundStripes = [];
    for (let x = 0; x < W + 40; x += 40) {
      const stripe = this.add.rectangle(x, this.groundY + 2, 3, 6, 0x2a5a2a).setDepth(1);
      this.groundStripes.push({ obj: stripe, baseX: x });
    }
  }

  update(time, delta) {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.rKey)) this.restartGame();
      return;
    }

    const dt = delta / 1000;
    const speed = this.difficulty.getSpeed();

    this.scoreTimer += dt;
    if (this.scoreTimer >= 0.1) {
      this.score += this.scoreMultiplier;
      this.scoreTimer = 0;
      this.difficulty.update(this.score);
    }

    if (this.scoreMultiplierTimer > 0) {
      this.scoreMultiplierTimer -= dt;
      if (this.scoreMultiplierTimer <= 0) {
        this.scoreMultiplier = 1;
        this.scoreMultiplierTimer = 0;
        this.tweens.add({ targets: this.x2Text, alpha: 0, duration: 300 });
      }
    }

    if (this.fireballTimer > 0) {
      this.fireballTimer -= dt;
      if (this.fireballTimer <= 0) {
        this.fireballActive = false;
        this.fireballTimer = 0;
        this.player.invulnerable = false;
        this.player.invulnerableTimer = 0;
        if (this.fireballOverlay) {
          this.tweens.add({ targets: this.fireballOverlay, alpha: 0, duration: 300,
            onComplete: () => { this.fireballOverlay.destroy(); this.fireballOverlay = null; } });
        }
        this.tweens.add({ targets: this.fireballText, alpha: 0, duration: 300 });
      }
    }

    const effectiveSpeed = this.fireballActive ? speed * 4 : speed;

    this._scrollBackground(effectiveSpeed, dt);

    this.player.update(time, delta);

    this.spawner.update(time, dt, this.score, speed);

    this._updateEntities(dt, effectiveSpeed);
    this._checkCollisions();

    if (this.uiScene) {
      this.uiScene.updateScore(this.score);
      this.uiScene.updateHearts(this.player.health);
    }
  }

  _scrollBackground(speed, dt) {
    const drift = speed * dt;

    [this.bgMountains, this.bgCity, this.bgGround].forEach(layers => {
      if (!layers) return;
      layers.forEach(layer => {
        layer.x -= drift * layer.speed;
        const w = 900;
        if (layer.x <= -w) layer.x += w;
        layer.rt.setX(layer.x);
        if (layer.x > -w + this.W) {
          layer.rt.setX(layer.x - w);
        }
      });
    });

    [this.bgMountains, this.bgCity, this.bgGround].forEach(layers => {
      if (!layers) return;
      layers.forEach(layer => {
        layer.rt.setX(layer.x);
      });
    });

    this.starsGfx.clear();
    this.starsGfx.fillStyle(0xffffff, 1);
    this.stars.forEach(s => {
      s.x -= drift * s.speed;
      if (s.x < -5) s.x += this.W + 10;
      this.starsGfx.fillCircle(s.x, s.y, s.r);
    });

    this.groundStripes.forEach(s => {
      s.obj.x -= drift;
      if (s.obj.x < -20) s.obj.x += this.W + 40;
    });
  }

  _updateEntities(dt, speed) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, speed);
      if (e.x < -100) {
        e.destroy();
        this.enemies.splice(i, 1);
      }
    }
    for (let i = this.crates.length - 1; i >= 0; i--) {
      const c = this.crates[i];
      c.update(dt, speed);
      if (c.x < -100) {
        c.destroy();
        this.crates.splice(i, 1);
      }
    }
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.update(dt, speed);
      if (p.x < -100) {
        p.destroy();
        this.powerups.splice(i, 1);
      }
    }
  }

  _checkCollisions() {
    const player = this.player;
    if (player.invulnerable || player.health <= 0) return;

    const px = player.x, py = player.y;
    const pHalfW = 18, pHalfH = 30;

    const overlaps = (ax, ay, aw, ah, bx, by, bw, bh) => {
      return Math.abs(ax - bx) < (aw / 2 + bw / 2) &&
             Math.abs(ay - by) < (ah / 2 + bh / 2);
    };

    for (const e of this.enemies) {
      if (e.dead) continue;
      const xOverlap = Math.abs(px - e.x) < (pHalfW + e.width * 0.4);
      if (xOverlap) {
        player.takeDamage();
        break;
      }
    }

    for (const c of this.crates) {
      if (overlaps(px, py, pHalfW * 2, pHalfH * 2, c.x, c.y, c.width * 0.8, c.height * 0.8)) {
        player.takeDamage();
        break;
      }
    }

    if (player.sword && player.sword.isActive()) {
      const sx = player.sword.getHitboxX();
      const sy = player.y;
      const sw = 60, sh = 60;

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (e.dead || e.hitThisSwing) continue;
        if (overlaps(sx, sy, sw, sh, e.x, e.y, e.width * 0.8, e.height * 0.9)) {
          e.hitThisSwing = true;
          if (player.sword) player.sword.hitSomethingThisSwing = true;
          e.takeHit(this.player);
          if (e.dead) {
            this.score += 10;
            setTimeout(() => {
              const idx = this.enemies.indexOf(e);
              if (idx !== -1) this.enemies.splice(idx, 1);
              e.destroy();
            }, 300);
          }
        }
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (p.collected) continue;
      if (overlaps(px, py, pHalfW * 2, pHalfH * 2, p.x, p.y, p.width, p.height)) {
        p.collect();
        this.powerups.splice(i, 1);
        if (p instanceof PowerupFireball) {
          this.fireballActive = true;
          this.fireballTimer = 2.5;
          this.score += 100;
          this.player.invulnerable = true;
          this.player.invulnerableTimer = 9999;
          if (this.fireballOverlay) this.fireballOverlay.destroy();
          this.fireballOverlay = this.add.rectangle(
            this.W / 2, this.H / 2, this.W, this.H, 0xff3300, 0.18
          ).setDepth(15);
          this.tweens.killTweensOf(this.fireballText);
          this.fireballText.setAlpha(1);
        } else {
          this.scoreMultiplier = 2;
          this.scoreMultiplierTimer = 3;
          this.tweens.killTweensOf(this.x2Text);
          this.x2Text.setAlpha(1);
        }
      }
    }
  }

  triggerGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    if (this.uiScene) this.uiScene.showGameOver(this.score);
  }

  restartGame() {
    this.enemies.forEach(e => e.destroy());
    this.crates.forEach(c => c.destroy());
    this.enemies = [];
    this.crates = [];
    this.scene.stop('UIScene');
    this.scene.restart();
  }
}
