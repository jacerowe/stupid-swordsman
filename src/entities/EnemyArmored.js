class EnemyArmored {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 54;
    this.hp = 2;
    this.dead = false;
    this.hitThisSwing = false;

    this.knockbackVelX = 0;
    this.knockbackTimer = 0;
    this.stunTimer = 0;

    this.walkTimer = 0;
    this.walkFrame = 0;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(4);

    this.shadow = this.scene.add.ellipse(0, 30, 36, 9, 0x000000, 0.3);
    this.legL = this.scene.add.rectangle(-8, 22, 10, 18, 0x555577);
    this.legR = this.scene.add.rectangle(8, 22, 10, 18, 0x555577);
    this.body = this.scene.add.rectangle(0, 4, 34, 28, 0x4455aa);
    this.armor = this.scene.add.rectangle(0, 2, 38, 32, 0x7788bb);
    this.armorLines = this.scene.add.graphics();
    this.armorLines.lineStyle(2, 0x3344aa, 1);
    this.armorLines.lineBetween(-16, -4, 16, -4);
    this.armorLines.lineBetween(-16, 4, 16, 4);
    this.armorLines.lineBetween(0, -14, 0, 14);

    this.head = this.scene.add.circle(0, -16, 14, 0xffaa88);
    this.helmet = this.scene.add.rectangle(0, -20, 32, 14, 0x7788bb);
    this.helmetVisor = this.scene.add.rectangle(0, -18, 20, 7, 0x223366);
    this.eyeL = this.scene.add.rectangle(-5, -18, 5, 4, 0x00ffff);
    this.eyeR = this.scene.add.rectangle(5, -18, 5, 4, 0x00ffff);

    this.armL = this.scene.add.rectangle(-21, 4, 9, 22, 0x4455aa);
    this.armR = this.scene.add.rectangle(21, 4, 9, 22, 0x4455aa);
    this.shieldL = this.scene.add.rectangle(-28, 2, 10, 26, 0x7788bb);

    this.hpBar = this.scene.add.rectangle(0, -34, 32, 5, 0x00cc44);
    this.hpBarBg = this.scene.add.rectangle(0, -34, 34, 7, 0x333333);

    this.container.add([
      this.shadow, this.legL, this.legR, this.armor, this.body,
      this.armorLines, this.head, this.helmet, this.helmetVisor,
      this.eyeL, this.eyeR, this.armL, this.armR, this.shieldL,
      this.hpBarBg, this.hpBar
    ]);
  }

  _updateHpBar() {
    const ratio = Math.max(0, this.hp / 2);
    this.hpBar.width = 32 * ratio;
    const color = ratio > 0.5 ? 0x00cc44 : 0xffaa00;
    this.hpBar.setFillStyle(color);
  }

  update(dt, speed) {
    if (this.dead) return;

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
    }

    if (this.knockbackTimer > 0) {
      this.knockbackTimer -= dt;
      this.x += this.knockbackVelX * dt;
    } else {
      if (this.stunTimer <= 0) {
        this.x -= speed * dt;
      } else {
        this.x -= speed * 0.3 * dt;
      }
    }

    this.container.x = this.x;

    if (this.stunTimer <= 0) {
      this.walkTimer += dt;
      if (this.walkTimer > 0.18) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 4;
      }
      const phases = [[16, 24, 24, 16], [20, 20, 20, 20], [24, 16, 16, 24], [20, 20, 20, 20]];
      const [lly, lry, aly, ary] = phases[this.walkFrame];
      this.legL.y = lly;
      this.legR.y = lry;
      this.armL.y = aly - 9;
      this.armR.y = ary - 9;
    }
  }

  takeHit(player) {
    if (this.dead) return;
    this.hp--;
    this._updateHpBar();
    this._flashHit();

    if (this.hp <= 0) {
      this.dead = true;
      this._dieEffect();
      return;
    }

    this.knockbackVelX = 300;
    this.knockbackTimer = 0.12;
    this.stunTimer = 0.22;

    this.scene.tweens.add({
      targets: this.container,
      x: this.container.x + 55,
      duration: 100,
      ease: 'Power2',
      onUpdate: () => { this.x = this.container.x; }
    });
  }

  _flashHit() {
    const allParts = [this.body, this.armor, this.helmet, this.head, this.armL, this.armR, this.shieldL];
    allParts.forEach(p => p.setFillStyle(0xffffff));
    this.scene.time.delayedCall(80, () => {
      if (this.dead || !this.body) return;
      this.body.setFillStyle(0x4455aa);
      this.armor.setFillStyle(0x7788bb);
      this.helmet.setFillStyle(0x7788bb);
      this.shieldL.setFillStyle(0x7788bb);
      this.head.setFillStyle(0xffaa88);
      this.armL.setFillStyle(0x4455aa);
      this.armR.setFillStyle(0x4455aa);
    });
  }

  _dieEffect() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      y: this.container.y - 40,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 350,
      ease: 'Power2'
    });
    const burst = this.scene.add.circle(this.x, this.y, 24, 0x4488ff, 0.9).setDepth(10);
    this.scene.tweens.add({
      targets: burst,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 280,
      onComplete: () => burst.destroy()
    });
  }

  destroy() {
    this.container.destroy();
  }
}
