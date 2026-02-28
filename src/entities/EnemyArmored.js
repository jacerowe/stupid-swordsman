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

    // Shadow
    this.shadow = this.scene.add.ellipse(0, 32, 42, 10, 0x000000, 0.32);
    this.container.add(this.shadow);

    // Chunky armored boots
    this.bootL = this.scene.add.rectangle(-9, 28, 14, 10, 0x333344);
    this.bootR = this.scene.add.rectangle(9, 28, 14, 10, 0x333344);
    this.container.add([this.bootL, this.bootR]);

    // Heavy leg plates
    this.legL = this.scene.add.rectangle(-9, 20, 13, 14, 0x556677);
    this.legR = this.scene.add.rectangle(9, 20, 13, 14, 0x556677);
    this.container.add([this.legL, this.legR]);

    // Tentacle/gooey arm left (green)
    this.tentacleGfx = this.scene.add.graphics();
    this._drawTentacles(0);
    this.container.add(this.tentacleGfx);

    // Main body armor (massive, riveted)
    this.armor = this.scene.add.rectangle(0, 4, 40, 32, 0x667788);
    this.armorHighlight = this.scene.add.rectangle(-6, -1, 14, 18, 0x8899aa);
    this.container.add([this.armor, this.armorHighlight]);

    // Armor detail graphics (plates, rivets, damage marks)
    this.armorDetail = this.scene.add.graphics();
    this.armorDetail.lineStyle(2, 0x445566, 1);
    this.armorDetail.lineBetween(-18, -2, 18, -2);
    this.armorDetail.lineBetween(-18, 8, 18, 8);
    this.armorDetail.lineBetween(0, -15, 0, 18);
    // Rivets
    this.armorDetail.fillStyle(0x99aabb, 1);
    this.armorDetail.fillCircle(-14, -8, 3);
    this.armorDetail.fillCircle(14, -8, 3);
    this.armorDetail.fillCircle(-14, 14, 3);
    this.armorDetail.fillCircle(14, 14, 3);
    // Damage scratch
    this.armorDetail.lineStyle(1, 0x334455, 1);
    this.armorDetail.lineBetween(4, -6, 10, 4);
    this.armorDetail.lineBetween(6, -6, 12, 4);
    this.container.add(this.armorDetail);

    // Heavy shoulder pauldrons
    this.pauldronL = this.scene.add.rectangle(-24, -4, 14, 20, 0x778899);
    this.pauldronR = this.scene.add.rectangle(24, -4, 14, 20, 0x778899);
    // Pauldron spikes
    this.pauldronSpikes = this.scene.add.graphics();
    this.pauldronSpikes.fillStyle(0x99aabb, 1);
    this.pauldronSpikes.fillTriangle(-28, -10, -22, -10, -25, -20);
    this.pauldronSpikes.fillTriangle(-23, -10, -17, -10, -20, -20);
    this.pauldronSpikes.fillTriangle(22, -10, 28, -10, 25, -20);
    this.pauldronSpikes.fillTriangle(17, -10, 23, -10, 20, -20);
    this.container.add([this.pauldronL, this.pauldronR, this.pauldronSpikes]);

    // Helmet (full-face spiked bucket)
    this.helmet = this.scene.add.rectangle(0, -22, 34, 20, 0x667788);
    this.helmetHighlight = this.scene.add.rectangle(-5, -26, 10, 12, 0x8899aa);
    this.helmetRim = this.scene.add.rectangle(0, -13, 38, 5, 0x445566);
    // Helmet spikes
    this.helmetSpikes = this.scene.add.graphics();
    this.helmetSpikes.fillStyle(0x99aabb, 1);
    this.helmetSpikes.fillTriangle(-4, -31, 4, -31, 0, -44);
    this.helmetSpikes.fillTriangle(-14, -28, -8, -28, -11, -38);
    this.helmetSpikes.fillTriangle(8, -28, 14, -28, 11, -38);
    this.container.add([this.helmet, this.helmetHighlight, this.helmetRim, this.helmetSpikes]);

    // Visor slit with glowing YELLOW eyes (no face visible, pure menace)
    this.visor = this.scene.add.rectangle(0, -22, 26, 6, 0x111122);
    // Glowing yellow eye glow
    this.eyeGlowL = this.scene.add.rectangle(-7, -22, 9, 4, 0xffcc00);
    this.eyeGlowR = this.scene.add.rectangle(7, -22, 9, 4, 0xffcc00);
    this.eyeFlareL = this.scene.add.circle(-7, -22, 6, 0xffaa00, 0.3);
    this.eyeFlareR = this.scene.add.circle(7, -22, 6, 0xffaa00, 0.3);
    this.container.add([this.visor, this.eyeGlowL, this.eyeGlowR, this.eyeFlareL, this.eyeFlareR]);

    // HP bar
    this.hpBarBg = this.scene.add.rectangle(0, -50, 36, 7, 0x222222);
    this.hpBar   = this.scene.add.rectangle(0, -50, 34, 5, 0x00cc44);
    this.container.add([this.hpBarBg, this.hpBar]);
  }

  _drawTentacles(frame) {
    this.tentacleGfx.clear();
    const offset = frame === 0 ? 0 : 5;
    // Left tentacle (green, gooey)
    this.tentacleGfx.fillStyle(0x33aa22, 0.95);
    this.tentacleGfx.fillEllipse(-28, 6 + offset, 14, 22);
    this.tentacleGfx.fillEllipse(-30, 16 + offset, 10, 10);
    // Sucker bumps
    this.tentacleGfx.fillStyle(0x44cc33, 0.7);
    this.tentacleGfx.fillCircle(-30, 4 + offset, 3);
    this.tentacleGfx.fillCircle(-27, 10 + offset, 3);
    this.tentacleGfx.fillCircle(-30, 16 + offset, 3);
    // Right tentacle (purple)
    this.tentacleGfx.fillStyle(0x9922bb, 0.95);
    this.tentacleGfx.fillEllipse(28, 6 - offset, 14, 22);
    this.tentacleGfx.fillEllipse(30, 16 - offset, 10, 10);
    this.tentacleGfx.fillStyle(0xbb44dd, 0.7);
    this.tentacleGfx.fillCircle(30, 4 - offset, 3);
    this.tentacleGfx.fillCircle(27, 10 - offset, 3);
    this.tentacleGfx.fillCircle(30, 16 - offset, 3);
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
      if (this.walkTimer > 0.22) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 4;
        const step = this.walkFrame % 2;
        const phases = [[20, 26], [23, 23], [26, 20], [23, 23]];
        this.legL.y = phases[this.walkFrame][0];
        this.legR.y = phases[this.walkFrame][1];
        this._drawTentacles(step);
      }
    }

    // Pulsing yellow eye glow
    const pulse = 0.25 + Math.sin(this.scene.time.now / 150) * 0.15;
    this.eyeFlareL.setAlpha(pulse);
    this.eyeFlareR.setAlpha(pulse);
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
    const flashParts = [this.armor, this.helmet, this.pauldronL, this.pauldronR, this.legL, this.legR];
    flashParts.forEach(p => p.setFillStyle(0xffffff));
    this.scene.time.delayedCall(80, () => {
      if (this.dead || !this.armor) return;
      this.armor.setFillStyle(0x667788);
      this.helmet.setFillStyle(0x667788);
      this.pauldronL.setFillStyle(0x778899);
      this.pauldronR.setFillStyle(0x778899);
      this.legL.setFillStyle(0x556677);
      this.legR.setFillStyle(0x556677);
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
