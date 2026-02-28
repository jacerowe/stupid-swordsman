class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.health = 3;
    this.maxHealth = 3;
    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 0.8;
    this.flashTimer = 0;

    this.isOnGround = false;
    this.jumpVelocity = -620;
    this.velocityY = 0;
    this.gravity = 1200;
    this.groundY = y;

    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 52;

    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this._spaceWasDown = false;

    this._buildGraphics();

    this.sword = new Sword(scene, this);

    this.running = true;
    this.runFrame = 0;
    this.runTimer = 0;
    this.legPhase = 0;

    this.dead = false;
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(5);

    const equippedHat = localStorage.getItem('ss_equip_hat') || 'default';
    const equippedSword = localStorage.getItem('ss_equip_sword') || 'default';

    // Shadow
    this.bodyShadow = this.scene.add.ellipse(0, 30, 34, 9, 0x000000, 0.28);
    this.container.add(this.bodyShadow);

    // Boots (chunky)
    this.bootL = this.scene.add.rectangle(-7, 26, 11, 10, 0x3a2a1a);
    this.bootR = this.scene.add.rectangle(7, 26, 11, 10, 0x3a2a1a);
    this.container.add([this.bootL, this.bootR]);

    // Leg armour
    this.legL = this.scene.add.rectangle(-7, 18, 10, 14, 0x7788aa);
    this.legR = this.scene.add.rectangle(7, 18, 10, 14, 0x7788aa);
    this.container.add([this.legL, this.legR]);

    // Belt
    this.belt = this.scene.add.rectangle(0, 10, 30, 6, 0x7a5530);
    this.beltBuckle = this.scene.add.rectangle(0, 10, 7, 6, 0xddaa44);
    this.container.add([this.belt, this.beltBuckle]);

    // Chest armour (chunky rounded rect via graphics)
    this.body = this.scene.add.rectangle(0, 2, 30, 22, 0x8899bb);
    this.bodyHighlight = this.scene.add.rectangle(-4, -2, 10, 12, 0xaabbdd);
    this.bodyRivets = this.scene.add.graphics();
    this.bodyRivets.fillStyle(0x556688, 1);
    this.bodyRivets.fillCircle(-9, 0, 2);
    this.bodyRivets.fillCircle(9, 0, 2);
    this.bodyRivets.fillCircle(0, 8, 2);
    this.container.add([this.body, this.bodyHighlight, this.bodyRivets]);

    // Red scarf/cape
    this.scarfBack = this.scene.add.graphics();
    this.scarfBack.fillStyle(0xcc2222, 1);
    this.scarfBack.fillTriangle(6, -4, 16, -4, 20, 20);
    this.container.add(this.scarfBack);

    this.scarf = this.scene.add.rectangle(0, -5, 28, 8, 0xdd2233);
    this.container.add(this.scarf);

    // Arm armour
    this.armL = this.scene.add.rectangle(-18, 2, 9, 20, 0x7788aa);
    this.armR = this.scene.add.rectangle(18, 2, 9, 20, 0x7788aa);
    this.gauntletL = this.scene.add.rectangle(-18, 13, 10, 8, 0x556688);
    this.gauntletR = this.scene.add.rectangle(18, 13, 10, 8, 0x556688);
    this.container.add([this.armL, this.armR, this.gauntletL, this.gauntletR]);

    // Face (round and chubby)
    this.head = this.scene.add.circle(0, -17, 13, 0xffcc99);
    this.cheekL = this.scene.add.circle(-7, -14, 4, 0xffaa88, 0.6);
    this.cheekR = this.scene.add.circle(7, -14, 4, 0xffaa88, 0.6);
    this.eyeL = this.scene.add.circle(-4, -18, 5, 0xffffff);
    this.eyeR = this.scene.add.circle(4, -18, 5, 0xffffff);
    this.pupilL = this.scene.add.circle(-4, -17, 3, 0x111111);
    this.pupilR = this.scene.add.circle(4, -17, 3, 0x111111);
    this.smile = this.scene.add.graphics();
    this.smile.lineStyle(2, 0x994422, 1);
    this.smile.strokeEllipse(0, -11, 10, 5, 16);
    this.container.add([this.head, this.cheekL, this.cheekR,
                        this.eyeL, this.eyeR, this.pupilL, this.pupilR, this.smile]);

    // Helmet
    const helmetColor = equippedHat === 'hat_red' ? 0xaa2222 : (equippedHat === 'hat_blue' ? 0x2233aa : 0x889aaa);
    const helmetHighlight = equippedHat === 'hat_red' ? 0xcc4444 : (equippedHat === 'hat_blue' ? 0x4455cc : 0xaabbcc);
    this.helmet = this.scene.add.rectangle(0, -24, 28, 16, helmetColor);
    this.helmetTop = this.scene.add.rectangle(0, -32, 22, 8, helmetColor);
    this.helmetRim = this.scene.add.rectangle(0, -17, 32, 5, 0x667788);
    this.helmetHighlight = this.scene.add.rectangle(-4, -28, 8, 10, helmetHighlight);
    // Plume
    this.plume = this.scene.add.graphics();
    this.plume.fillStyle(0xdd2222, 1);
    this.plume.fillEllipse(8, -38, 10, 18);
    this.plume.fillStyle(0xff4444, 1);
    this.plume.fillEllipse(5, -35, 6, 12);
    // Visor slit
    this.visor = this.scene.add.rectangle(0, -22, 18, 4, 0x223344);
    this.visorGlow = this.scene.add.rectangle(0, -22, 16, 2, 0x88aacc, 0.7);
    this.container.add([this.helmet, this.helmetTop, this.helmetRim,
                        this.helmetHighlight, this.plume, this.visor, this.visorGlow]);

    this.allParts = [this.body, this.bodyHighlight, this.bodyRivets, this.scarfBack, this.scarf,
                     this.head, this.cheekL, this.cheekR, this.eyeL, this.eyeR,
                     this.pupilL, this.pupilR, this.smile, this.helmet, this.helmetTop,
                     this.helmetRim, this.helmetHighlight, this.plume, this.visor, this.visorGlow,
                     this.armL, this.armR, this.gauntletL, this.gauntletR,
                     this.legL, this.legR, this.bootL, this.bootR, this.belt, this.beltBuckle];
  }

  tryAttack() {
    if (this.sword) this.sword.trySwing();
  }

  update(time, delta) {
    if (this.dead) return;
    const dt = delta / 1000;

    const spaceDown = this.spaceKey.isDown;
    if (spaceDown && !this._spaceWasDown && this.isOnGround) {
      this.velocityY = this.jumpVelocity;
      this.isOnGround = false;
    }
    this._spaceWasDown = spaceDown;

    if (!this.isOnGround) {
      this.velocityY += this.gravity * dt;
      this.y += this.velocityY * dt;
    }

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocityY = 0;
      this.isOnGround = true;
    }

    this.container.y = this.y;

    if (this.invulnerable) {
      this.invulnerableTimer -= dt;
      this.flashTimer += dt;
      const visible = Math.floor(this.flashTimer / 0.07) % 2 === 0;
      this.allParts.forEach(p => p.setAlpha(visible ? 1 : 0.15));
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
        this.allParts.forEach(p => p.setAlpha(1));
      }
    }

    this._animateRun(dt);
    this.sword.update(time, delta);
  }

  _animateRun(dt) {
    if (this.isOnGround) {
      this.runTimer += dt;
      if (this.runTimer > 0.12) {
        this.runTimer = 0;
        this.legPhase = (this.legPhase + 1) % 4;
      }
      const phases = [
        [12, 22, 22, 12],
        [17, 19, 19, 17],
        [22, 12, 12, 22],
        [17, 19, 19, 17]
      ];
      const [lly, lry, aly, ary] = phases[this.legPhase];
      this.legL.y = lly;
      this.legR.y = lry;
      this.armL.y = aly - 9;
      this.armR.y = ary - 9;
      this.body.y = 4 + Math.sin(this.legPhase * Math.PI / 2) * 1.5;
    } else {
      this.legL.y = 14;
      this.legR.y = 28;
      this.armL.y = -2;
      this.armR.y = 2;
      this.body.y = 4;
    }
  }

  takeDamage() {
    if (this.invulnerable || this.dead) return;
    this.health--;
    this.invulnerable = true;
    this.invulnerableTimer = this.invulnerableDuration;
    this.flashTimer = 0;

    this.scene.cameras.main.shake(150, 0.008);

    if (this.health <= 0) {
      this.dead = true;
      this.allParts.forEach(p => p.setAlpha(0.4));
      this.scene.triggerGameOver();
    }
  }

  destroy() {
    this.container.destroy();
    if (this.sword) this.sword.destroy();
  }
}
