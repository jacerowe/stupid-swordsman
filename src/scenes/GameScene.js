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
    this.moneyEarned = 0;
    this.skyPhase = 0;

    const lvl = id => parseInt(localStorage.getItem('ss_lvl_' + id) || '0');
    const own = id => localStorage.getItem('ss_own_' + id) === '1';
    this.heartsLevel  = lvl('hearts');   // 0=3HP, 1=4HP, 2=5HP, 3=6HP, 4=7HP
    this.x2Level      = lvl('x2');       // 0=3s, 1=4s, 2=5s, 3=6s, 4=8s
    this.shieldLevel  = lvl('shield');   // 0=10s, 1=15s, 2=20s, 3=30s
    this.bountyLevel  = lvl('bounty');   // 0=+0, 1=+1, 2=+3, 3=+5, 4=+7
    this.bandageLevel = lvl('bandage');  // 0=heal1, 1=heal2
    this.upgradeCoinMagnet   = lvl('magnet') > 0 || own('magnet_1');
    this.upgradeExtraHeart   = this.heartsLevel > 0; // legacy compat
    this.upgradeEnemyBounty  = this.bountyLevel > 0; // legacy compat
    this.upgradeX2Longer     = this.x2Level > 0;     // legacy compat
    this.upgradeShieldLonger = this.shieldLevel > 0; // legacy compat

    this.difficulty = new Difficulty(this);
    this._buildBackground();
    this._buildGround();

    this.player = new Player(this, Math.floor(this.W * 0.22), this.groundY - 26);
    if (this.heartsLevel > 0) {
      const hp = 3 + this.heartsLevel;
      this.player.health = hp;
      this.player.maxHealth = hp;
    }

    this.enemies = [];
    this.crates = [];
    this.powerups = [];
    this.coins = [];
    this.scoreMultiplier = 1;
    this.scoreMultiplierTimer = 0;
    this.fireballActive = false;
    this.fireballTimer = 0;
    this.fireballOverlay = null;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldGfx = null;

    this.enemySpawner = new EnemySpawner(this);
    this.crateSpawner = new CrateSpawner(this);
    this.collectibleSpawner = new CollectibleSpawner(this);

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

    this.shieldText = this.add.text(this.W / 2, 140, '🛡️ SHIELD ACTIVE!', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#88ccff',
      stroke: '#000033',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.scene.launch('UIScene');
    this.uiScene = this.scene.get('UIScene');
    this._updateSky(0);
  }

  _buildBackground() {
    const W = this.W, H = this.H;

    this.bgLayers = [];

    // Night sky base colors (will lerp to day on phase change)
    const skyColors = [
      { y: 0,        h: H * 0.55, color: 0x0d1a3a },
      { y: H * 0.55, h: H * 0.45, color: 0x1a2a50 }
    ];
    this.skyRects = skyColors.map(s => {
      const rect = this.add.rectangle(W / 2, s.y + s.h / 2, W, s.h, s.color);
      rect.setDepth(-10);
      return rect;
    });

    // Moon (crescent-style: big circle with overlap)
    this.moonGfx = this.add.graphics().setDepth(-9);
    this.moonGfx.fillStyle(0xeeeebb, 1);
    this.moonGfx.fillCircle(W * 0.8, H * 0.16, 22);
    this.moonGfx.fillStyle(0x0d1a3a, 1);
    this.moonGfx.fillCircle(W * 0.8 + 10, H * 0.16 - 5, 16);

    this.starsGfx = this.add.graphics().setDepth(-9);
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Phaser.Math.RND.between(0, W),
        y: Phaser.Math.RND.between(10, H * 0.50),
        r: Phaser.Math.RND.realInRange(0.8, 2.2),
        speed: Phaser.Math.RND.realInRange(0.02, 0.06),
        twinkle: Math.random() * Math.PI * 2
      });
    }

    // Pre-create sun and clouds at game start (always ready at depth 2)
    this._buildSunAndClouds();

    this.bgMountains = this._createScrollLayer(3, (g, idx) => {
      g.fillStyle(0x1a2a55, 1);
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
      g.fillStyle(idx === 0 ? 0x131a2a : 0x0e1222, 1);
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

  _lerpColor(a, b, t) {
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl2 = Math.round(ab + (bb - ab) * t);
    return (r << 16) | (g << 8) | bl2;
  }

  _buildSunAndClouds() {
    const D = 2; // depth above backgrounds
    const cx = this.W * 0.18, cy = this.H * 0.16;

    // Sun circle
    this.sunGfx = this.add.circle(cx, cy, 24, 0xffee22).setDepth(D).setAlpha(0);

    // Sun rays (pixel-art style - straight lines)
    this.sunRays = this.add.graphics().setDepth(D).setAlpha(0);
    this.sunRays.lineStyle(3, 0xffee44, 1);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.sunRays.strokeLineShape(new Phaser.Geom.Line(
        cx + Math.cos(angle) * 30, cy + Math.sin(angle) * 30,
        cx + Math.cos(angle) * 46, cy + Math.sin(angle) * 46
      ));
    }

    // Pixel-art fluffy clouds
    this.cloudGroup = [];
    const cloudDefs = [
      { x: this.W * 0.55, y: this.H * 0.10, s: 1.0 },
      { x: this.W * 0.78, y: this.H * 0.07, s: 0.75 },
      { x: this.W * 0.35, y: this.H * 0.18, s: 0.85 },
      { x: this.W * 0.90, y: this.H * 0.14, s: 0.65 },
    ];
    cloudDefs.forEach(d => {
      const g = this.add.graphics().setDepth(D).setAlpha(0);
      const s = d.s;
      // Layered ellipses for pixel-art puffy cloud
      g.fillStyle(0xffffff, 1);
      g.fillEllipse(0, 0, 68 * s, 26 * s);
      g.fillEllipse(-20 * s, -10 * s, 38 * s, 26 * s);
      g.fillEllipse(16 * s, -12 * s, 42 * s, 28 * s);
      g.fillEllipse(-4 * s, -16 * s, 28 * s, 20 * s);
      // Bottom flat edge
      g.fillStyle(0xddeeff, 0.5);
      g.fillRect(-32 * s, 4 * s, 64 * s, 8 * s);
      g.x = d.x; g.y = d.y;
      this.cloudGroup.push({ gfx: g, speed: 14 + Math.random() * 10 });
    });
  }

  _updateSky(phase) {
    const isDay = phase % 2 === 1;
    // Day: bright pixel-art blue sky; Night: dark navy
    const nightTop = 0x0d1a3a, nightBot = 0x1a2a50;
    const dayTop   = 0x4ab0e8, dayBot   = 0x7dd4f8;
    const fromTop = isDay ? nightTop : dayTop;
    const toTop   = isDay ? dayTop   : nightTop;
    const fromBot = isDay ? nightBot : dayBot;
    const toBot   = isDay ? dayBot   : nightBot;
    const moonAlpha = isDay ? 0 : 1;

    if (this.skyRects && this.skyRects.length) {
      const r0 = this.skyRects[0], r1 = this.skyRects[1];
      let elapsed = 0;
      const duration = 1.5;
      const ticker = this.time.addEvent({
        delay: 16, loop: true, callback: () => {
          elapsed += 0.016;
          const t = Math.min(elapsed / duration, 1);
          r0.setFillStyle(this._lerpColor(fromTop, toTop, t));
          r1.setFillStyle(this._lerpColor(fromBot, toBot, t));
          if (t >= 1) ticker.remove();
        }
      });
    }

    if (this.moonGfx) this.tweens.add({ targets: this.moonGfx, alpha: moonAlpha, duration: 1500 });
    if (this.starsGfx) this.tweens.add({ targets: this.starsGfx, alpha: moonAlpha, duration: 1500 });

    const sunAlpha = isDay ? 1 : 0;
    if (this.sunGfx) this.tweens.add({ targets: [this.sunGfx, this.sunRays], alpha: sunAlpha, duration: 1500 });
    if (this.cloudGroup) {
      this.cloudGroup.forEach(c => this.tweens.add({ targets: c.gfx, alpha: isDay ? 1 : 0, duration: 1500 }));
    }

    if (phase > 0) {
      const label = isDay ? 'DAYTIME' : 'NIGHTFALL';
      const color = isDay ? '#ffee44' : '#aaccff';
      const msg = this.add.text(this.W / 2, 75, label, {
        fontSize: '20px', fontFamily: 'Arial Black, sans-serif',
        color: color, stroke: '#000000', strokeThickness: 4
      }).setOrigin(0.5).setDepth(22).setAlpha(0);
      this.tweens.add({ targets: msg, alpha: 1, duration: 400, yoyo: true, hold: 1200,
        onComplete: () => msg.destroy() });
    }
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
    if (this.scoreTimer >= 0.05) {
      this.score += this.scoreMultiplier;
      this.scoreTimer = 0;
      this.difficulty.update(this.score);
    }

    if (this.scoreMultiplierTimer > 0) {
      this.scoreMultiplierTimer -= dt;
      const secs = Math.ceil(this.scoreMultiplierTimer);
      this.x2Text.setText('x2 SCORE! ' + secs + 's');
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
        this.player.flashTimer = 0;
        this.player.allParts.forEach(p => p.setAlpha(1));
        if (this.fireballOverlay) {
          this.tweens.add({ targets: this.fireballOverlay, alpha: 0, duration: 300,
            onComplete: () => { this.fireballOverlay.destroy(); this.fireballOverlay = null; } });
        }
        this.tweens.add({ targets: this.fireballText, alpha: 0, duration: 300 });
      }
    }

    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
      if (this.shieldGfx) {
        this.shieldGfx.setPosition(this.player.x, this.player.y - 5);
        this.shieldGfx.setAlpha(0.35 + Math.sin(Date.now() / 150) * 0.1);
      }
      if (this.shieldTimer <= 0) {
        this._breakShield();
      }
    }

    const effectiveSpeed = this.fireballActive ? speed * 4 : speed;

    this._scrollBackground(effectiveSpeed, dt);

    this.player.update(time, delta);

    this.enemySpawner.update(dt, this.score);
    this.crateSpawner.update(dt, this.score);
    this.collectibleSpawner.update(dt, this.score);

    this._updateEntities(dt, effectiveSpeed);
    this._checkCollisions();

    if (this.uiScene) {
      this.uiScene.updateScore(this.score);
      this.uiScene.updateHearts(this.player.health);
      this.uiScene.updateMoney(this.moneyEarned);
    }

    const newPhase = Math.floor(this.score / 500);
    if (newPhase !== this.skyPhase) {
      this.skyPhase = newPhase;
      this._updateSky(newPhase);
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
    const tNow = this.time.now / 1000;
    this.stars.forEach(s => {
      s.x -= drift * s.speed;
      if (s.x < -5) s.x += this.W + 10;
      s.twinkle += 0.04;
      const brightness = 0.5 + Math.sin(s.twinkle) * 0.5;
      this.starsGfx.fillStyle(0xffffff, brightness);
      this.starsGfx.fillCircle(s.x, s.y, s.r);
    });

    this.groundStripes.forEach(s => {
      s.obj.x -= drift;
      if (s.obj.x < -20) s.obj.x += this.W + 40;
    });

    if (this.cloudGroup) {
      this.cloudGroup.forEach(c => {
        c.gfx.x -= c.speed * dt;
        if (c.gfx.x < -120) c.gfx.x = this.W + 80;
      });
    }
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
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.update(dt, speed);
      if (c.x < -100) {
        c.destroy();
        this.coins.splice(i, 1);
      }
    }
  }

  _checkCollisions() {
    const player = this.player;
    const px = player.x, py = player.y;
    const pHalfW = 18, pHalfH = 30;
    const canTakeDamage = !player.invulnerable && player.health > 0;

    const overlaps = (ax, ay, aw, ah, bx, by, bw, bh) => {
      return Math.abs(ax - bx) < (aw / 2 + bw / 2) &&
             Math.abs(ay - by) < (ah / 2 + bh / 2);
    };

    if (canTakeDamage) {
      for (const e of this.enemies) {
        if (e.dead) continue;
        const xOverlap = Math.abs(px - e.x) < (pHalfW + e.width * 0.4);
        if (xOverlap) {
          if (this.shieldActive) { this._breakShield(); }
          else { player.takeDamage(); }
          break;
        }
      }

      for (let ci = this.crates.length - 1; ci >= 0; ci--) {
        const c = this.crates[ci];
        if (c.dead) continue;
        if (overlaps(px, py, pHalfW * 2, pHalfH * 2, c.x, c.y, c.width * 0.8, c.height * 0.8)) {
          if (this.shieldActive) { this._breakShield(); }
          else { player.takeDamage(); }
          break;
        }
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
            const bountyValues = [0, 1, 3, 5, 7];
            const bonus = bountyValues[this.bountyLevel] || 0;
            this.score += (10 + bonus) * this.scoreMultiplier;
            e.destroy();
            this.enemies.splice(i, 1);
          }
        }
      }
    }

    if (player.sword && player.sword.isActive()) {
      const sxb = player.sword.getHitboxX();
      const syb = player.y;
      for (let ci = this.crates.length - 1; ci >= 0; ci--) {
        const c = this.crates[ci];
        if (!c.breakable || c.dead) continue;
        if (overlaps(sxb, syb, 60, 60, c.x, c.y, c.width, c.height)) {
          if (player.sword) player.sword.hitSomethingThisSwing = true;
          c.smash();
          this.crates.splice(ci, 1);
          this.score += 5;
          break;
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
        } else if (p instanceof PowerupShield) {
          this.shieldActive = true;
          const shieldDurations = [10, 15, 20, 30];
          this.shieldTimer = shieldDurations[this.shieldLevel] || 10;
          if (this.shieldGfx) this.shieldGfx.destroy();
          this.shieldGfx = this.add.circle(
            this.player.x, this.player.y - 5, 34, 0x4488ff, 0.4
          ).setStrokeStyle(3, 0xaaddff).setDepth(6);
          this.tweens.killTweensOf(this.shieldText);
          this.shieldText.setAlpha(1);
        } else if (p instanceof PowerupBandage) {
          const healAmt = this.bandageLevel > 0 ? 2 : 1;
          const maxHp = this.player.maxHealth;
          if (this.player.health < maxHp) {
            this.player.health = Math.min(this.player.health + healAmt, maxHp);
            const popup = this.add.text(px, py - 40, '+' + healAmt + ' HP', {
              fontSize: '18px', fontFamily: 'Arial Black, sans-serif',
              color: '#ff88aa', stroke: '#000000', strokeThickness: 3
            }).setOrigin(0.5).setDepth(22);
            this.tweens.add({ targets: popup, y: py - 80, alpha: 0, duration: 900,
              onComplete: () => popup.destroy() });
          }
        } else {
          const x2Durations = [3, 4, 5, 6, 8];
          const x2Dur = x2Durations[this.x2Level] || 3;
          this.scoreMultiplier = 2;
          this.scoreMultiplierTimer = x2Dur;
          this.tweens.killTweensOf(this.x2Text);
          this.x2Text.setAlpha(1).setText('x2 SCORE! ' + x2Dur + 's');
        }
      }
    }

    const coinPickupW = this.upgradeCoinMagnet ? pHalfW * 5 : pHalfW * 2;
    const coinPickupH = this.upgradeCoinMagnet ? pHalfH * 4 : pHalfH * 2;
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (c.collected) continue;
      if (overlaps(px, py, coinPickupW, coinPickupH, c.x, c.y, c.width, c.height)) {
        c.collect();
        this.coins.splice(i, 1);
        const earned = c.scoreValue * this.scoreMultiplier;
        this.moneyEarned += earned;
        const popup = this.add.text(c.x, c.y - 10, '+' + earned + '💰', {
          fontSize: '14px', fontFamily: 'Arial Black', color: '#ffee00',
          stroke: '#000000', strokeThickness: 3
        }).setDepth(25);
        this.tweens.add({ targets: popup, y: popup.y - 35, alpha: 0, duration: 700,
          onComplete: () => popup.destroy() });
      }
    }
  }

  _breakShield() {
    this.shieldActive = false;
    this.shieldTimer = 0;
    if (this.shieldGfx) {
      this.tweens.add({
        targets: this.shieldGfx,
        alpha: 0, scaleX: 2, scaleY: 2,
        duration: 250,
        onComplete: () => { if (this.shieldGfx) { this.shieldGfx.destroy(); this.shieldGfx = null; } }
      });
    }
    this.tweens.add({ targets: this.shieldText, alpha: 0, duration: 300 });
    this.player.invulnerable = true;
    this.player.invulnerableTimer = 0.5;
    this.player.flashTimer = 0;
    this.cameras.main.shake(120, 0.006);
  }

  triggerGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    const prev = parseInt(localStorage.getItem('ss_coins') || '0');
    localStorage.setItem('ss_coins', String(prev + this.moneyEarned));
    if (this.uiScene) this.uiScene.showGameOver(this.score, this.moneyEarned);
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
