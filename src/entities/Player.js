class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.health = 3;
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

    this.bodyShadow = this.scene.add.ellipse(1, 28, 30, 8, 0x000000, 0.3);
    this.container.add(this.bodyShadow);

    this.legL = this.scene.add.rectangle(-6, 22, 8, 18, 0x2244aa);
    this.legR = this.scene.add.rectangle(6, 22, 8, 18, 0x2244aa);
    this.container.add([this.legL, this.legR]);

    this.body = this.scene.add.rectangle(0, 4, 28, 32, 0x3355cc);
    this.container.add(this.body);

    this.head = this.scene.add.circle(0, -18, 13, 0xffcc99);
    this.container.add(this.head);

    this.hair = this.scene.add.triangle(0, -31, -11, 0, 11, 0, 0, -14, 0x553311);
    this.container.add(this.hair);

    this.eyeL = this.scene.add.rectangle(-4, -18, 3, 4, 0x111111);
    this.eyeR = this.scene.add.rectangle(4, -18, 3, 4, 0x111111);
    this.container.add([this.eyeL, this.eyeR]);

    this.scarf = this.scene.add.rectangle(0, -7, 28, 7, 0xcc3333);
    this.container.add(this.scarf);

    this.armL = this.scene.add.rectangle(-17, 4, 8, 22, 0x2244aa);
    this.armR = this.scene.add.rectangle(17, 4, 8, 22, 0x2244aa);
    this.container.add([this.armL, this.armR]);

    this.allParts = [this.body, this.head, this.hair, this.eyeL, this.eyeR,
                     this.scarf, this.armL, this.armR, this.legL, this.legR];
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
