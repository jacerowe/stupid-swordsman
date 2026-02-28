class EnemyBasic {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 48;
    this.hp = 1;
    this.dead = false;
    this.hitThisSwing = false;

    this.walkTimer = 0;
    this.walkFrame = 0;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(4);

    // Alternate green/purple based on spawn position parity
    const isGreen = Math.floor(this.x / 200) % 2 === 0;
    this.bodyColor     = isGreen ? 0x44bb22 : 0x9933cc;
    this.bodyDarkColor = isGreen ? 0x2d8811 : 0x6622aa;
    this.droolColor    = isGreen ? 0x88ee44 : 0xcc88ff;

    // Shadow
    this.shadow = this.scene.add.ellipse(0, 28, 36, 9, 0x000000, 0.3);
    this.container.add(this.shadow);

    // Gooey body (blob - main ellipse)
    this.body = this.scene.add.ellipse(0, 6, 38, 34, this.bodyColor);
    this.bodyHighlight = this.scene.add.ellipse(-6, 0, 12, 10, isGreen ? 0x88ee55 : 0xcc66ff, 0.5);
    this.container.add([this.body, this.bodyHighlight]);

    // Gooey tentacle legs
    this.legGfx = this.scene.add.graphics();
    this._drawLegs();
    this.container.add(this.legGfx);

    // Gooey arms/tendrils
    this.armGfx = this.scene.add.graphics();
    this._drawArms(0);
    this.container.add(this.armGfx);

    // Big googly eyes (white)
    this.eyeBgL = this.scene.add.circle(-8, -4, 9, 0xffffff);
    this.eyeBgR = this.scene.add.circle(8, -4, 9, 0xffffff);
    // Pupils
    this.pupilL = this.scene.add.circle(-7, -3, 5, 0x111111);
    this.pupilR = this.scene.add.circle(9, -3, 5, 0x111111);
    // Eye shines
    this.shineL = this.scene.add.circle(-5, -5, 2, 0xffffff);
    this.shineR = this.scene.add.circle(11, -5, 2, 0xffffff);
    this.container.add([this.eyeBgL, this.eyeBgR, this.pupilL, this.pupilR, this.shineL, this.shineR]);

    // Big open mouth with teeth
    this.mouthGfx = this.scene.add.graphics();
    this._drawMouth();
    this.container.add(this.mouthGfx);

    // Drool drops
    this.droolGfx = this.scene.add.graphics();
    this._drawDrool(0);
    this.container.add(this.droolGfx);

    // Spiked metal helmet
    this.helmetGfx = this.scene.add.graphics();
    this._drawHelmet();
    this.container.add(this.helmetGfx);
  }

  _drawLegs() {
    this.legGfx.clear();
    this.legGfx.fillStyle(this.bodyDarkColor, 1);
    this.legGfx.fillEllipse(-10, 24, 12, 10);
    this.legGfx.fillEllipse(10, 24, 12, 10);
  }

  _drawArms(frame) {
    this.armGfx.clear();
    this.armGfx.fillStyle(this.bodyColor, 1);
    const offset = frame === 0 ? 0 : 4;
    this.armGfx.fillEllipse(-22, 4 + offset, 10, 16);
    this.armGfx.fillEllipse(22, 4 - offset, 10, 16);
    // Fingery tips
    this.armGfx.fillStyle(this.bodyDarkColor, 1);
    this.armGfx.fillCircle(-22, 13 + offset, 4);
    this.armGfx.fillCircle(22, 13 - offset, 4);
  }

  _drawMouth() {
    this.mouthGfx.clear();
    // Wide open mouth - red interior
    this.mouthGfx.fillStyle(0xcc0011, 1);
    this.mouthGfx.fillEllipse(1, 10, 22, 14);
    // Dark throat
    this.mouthGfx.fillStyle(0x550000, 1);
    this.mouthGfx.fillEllipse(1, 12, 16, 8);
    // Jagged teeth top
    this.mouthGfx.fillStyle(0xeeeedd, 1);
    for (let i = -8; i <= 8; i += 5) {
      this.mouthGfx.fillTriangle(i, 4, i + 4, 4, i + 2, 11);
    }
    // Bottom teeth
    for (let i = -6; i <= 6; i += 5) {
      this.mouthGfx.fillTriangle(i, 17, i + 4, 17, i + 2, 10);
    }
  }

  _drawDrool(animT) {
    this.droolGfx.clear();
    this.droolGfx.fillStyle(this.droolColor, 0.85);
    const drip = Math.abs(Math.sin(animT * 2)) * 6;
    this.droolGfx.fillEllipse(-3, 16 + drip, 4, 6 + drip * 0.5);
    this.droolGfx.fillEllipse(6, 14 + drip * 0.6, 3, 5 + drip * 0.3);
  }

  _drawHelmet() {
    this.helmetGfx.clear();
    // Helmet dome
    this.helmetGfx.fillStyle(0x778899, 1);
    this.helmetGfx.fillEllipse(1, -14, 30, 18);
    this.helmetGfx.fillStyle(0x889aaa, 1);
    this.helmetGfx.fillEllipse(-3, -17, 10, 8);
    // Helmet band
    this.helmetGfx.fillStyle(0x556677, 1);
    this.helmetGfx.fillRect(-15, -8, 30, 4);
    // Rivets
    this.helmetGfx.fillStyle(0x99aabb, 1);
    this.helmetGfx.fillCircle(-10, -6, 2);
    this.helmetGfx.fillCircle(0, -6, 2);
    this.helmetGfx.fillCircle(10, -6, 2);
    // Center spike
    this.helmetGfx.fillStyle(0xaabbcc, 1);
    this.helmetGfx.fillTriangle(-3, -22, 3, -22, 0, -34);
    // Side spikes
    this.helmetGfx.fillTriangle(-13, -16, -9, -16, -11, -26);
    this.helmetGfx.fillTriangle(9, -16, 13, -16, 11, -26);
  }

  update(dt, speed) {
    if (this.dead) return;

    this.x -= speed * dt;
    this.container.x = this.x;

    this.walkTimer += dt;
    if (this.walkTimer > 0.18) {
      this.walkTimer = 0;
      this.walkFrame = (this.walkFrame + 1) % 2;
      this._drawArms(this.walkFrame);
    }

    // Animate drool
    this._drawDrool(this.scene.time.now / 1000);

    // Slight bob
    this.container.y = this.y + Math.sin(this.scene.time.now / 200) * 2;
  }

  takeHit(player) {
    if (this.dead) return;
    this.hp--;
    if (this.hp <= 0) {
      this.dead = true;
      this._dieEffect();
    }
  }

  _dieEffect() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      y: this.container.y - 30,
      duration: 280,
      ease: 'Power2'
    });
    const burst = this.scene.add.circle(this.x, this.y, 20, 0xff4444, 0.8).setDepth(10);
    this.scene.tweens.add({
      targets: burst,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 220,
      onComplete: () => burst.destroy()
    });
  }

  destroy() {
    this.container.destroy();
  }
}
