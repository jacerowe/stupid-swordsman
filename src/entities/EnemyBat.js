class EnemyBat {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 28;
    this.hp = 1;
    this.dead = false;
    this.hitThisSwing = false;

    this.flapTimer = 0;
    this.flapFrame = 0;
    this.hoverTimer = 0;
    this.baseY = y;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(4);

    // Wings (drawn as graphics, redrawn each frame)
    this.wingL = this.scene.add.graphics();
    this.wingR = this.scene.add.graphics();
    this._drawWings(1);
    this.container.add([this.wingL, this.wingR]);

    // Chunky round body
    this.body = this.scene.add.ellipse(0, 4, 32, 28, 0x1a1a55);
    this.bodyHighlight = this.scene.add.ellipse(-6, -1, 10, 8, 0x3333aa, 0.6);
    this.container.add([this.body, this.bodyHighlight]);

    // Feet/claws
    this.clawGfx = this.scene.add.graphics();
    this.clawGfx.fillStyle(0x111133, 1);
    this.clawGfx.fillTriangle(-8, 18, -4, 18, -7, 26);
    this.clawGfx.fillTriangle(-4, 18, 0, 18, -3, 26);
    this.clawGfx.fillTriangle(4, 18, 8, 18, 7, 26);
    this.clawGfx.fillTriangle(0, 18, 4, 18, 3, 26);
    this.container.add(this.clawGfx);

    // Head
    this.head = this.scene.add.circle(0, -8, 14, 0x22226a);
    this.container.add(this.head);

    // Pointy ears with spikes
    this.earGfx = this.scene.add.graphics();
    this.earGfx.fillStyle(0x2222aa, 1);
    this.earGfx.fillTriangle(-14, -18, -6, -18, -10, -34);
    this.earGfx.fillTriangle(6, -18, 14, -18, 10, -34);
    // Ear spikes (bone-colored tips)
    this.earGfx.fillStyle(0xccddee, 1);
    this.earGfx.fillTriangle(-11, -26, -9, -26, -10, -34);
    this.earGfx.fillTriangle(9, -26, 11, -26, 10, -34);
    this.container.add(this.earGfx);

    // Glowing blue eyes (big!)
    this.eyeGlowL = this.scene.add.circle(-5, -10, 8, 0x0044ff, 0.35);
    this.eyeGlowR = this.scene.add.circle(5, -10, 8, 0x0044ff, 0.35);
    this.eyeBgL = this.scene.add.circle(-5, -10, 6, 0x2255ff);
    this.eyeBgR = this.scene.add.circle(5, -10, 6, 0x2255ff);
    this.pupilL = this.scene.add.circle(-5, -10, 3, 0x001133);
    this.pupilR = this.scene.add.circle(5, -10, 3, 0x001133);
    this.eyeShineL = this.scene.add.circle(-3, -12, 2, 0xaaccff);
    this.eyeShineR = this.scene.add.circle(7, -12, 2, 0xaaccff);
    this.container.add([this.eyeGlowL, this.eyeGlowR, this.eyeBgL, this.eyeBgR,
                        this.pupilL, this.pupilR, this.eyeShineL, this.eyeShineR]);

    // Big open mouth with fangs
    this.mouthGfx = this.scene.add.graphics();
    this._drawMouth();
    this.container.add(this.mouthGfx);

    // Blue dripping goo
    this.droolGfx = this.scene.add.graphics();
    this._drawDrool(0);
    this.container.add(this.droolGfx);
  }

  _drawMouth() {
    this.mouthGfx.clear();
    // Open mouth
    this.mouthGfx.fillStyle(0xcc1111, 1);
    this.mouthGfx.fillEllipse(0, 4, 18, 12);
    this.mouthGfx.fillStyle(0x550000, 1);
    this.mouthGfx.fillEllipse(0, 6, 12, 7);
    // Fangs top
    this.mouthGfx.fillStyle(0xeeeedd, 1);
    this.mouthGfx.fillTriangle(-5, -1, -2, -1, -4, 6);
    this.mouthGfx.fillTriangle(2, -1, 5, -1, 4, 6);
    // Bottom fangs
    this.mouthGfx.fillTriangle(-4, 9, -1, 9, -3, 3);
    this.mouthGfx.fillTriangle(1, 9, 4, 9, 3, 3);
  }

  _drawDrool(t) {
    this.droolGfx.clear();
    this.droolGfx.fillStyle(0x4488ff, 0.85);
    const drip = Math.abs(Math.sin(t * 1.8)) * 7;
    this.droolGfx.fillEllipse(-2, 10 + drip, 3, 6 + drip * 0.4);
    this.droolGfx.fillEllipse(5, 8 + drip * 0.6, 2, 4 + drip * 0.3);
  }

  update(dt, speed) {
    if (this.dead) return;

    this.x -= speed * dt;
    this.container.x = this.x;

    this.hoverTimer += dt;
    this.container.y = this.baseY + Math.sin(this.hoverTimer * 3.5) * 7;
    this.y = this.container.y;

    this.flapTimer += dt;
    if (this.flapTimer > 0.1) {
      this.flapTimer = 0;
      this.flapFrame = (this.flapFrame + 1) % 2;
    }
    this._drawWings(this.flapFrame === 0 ? 1 : 0.4);
    this._drawDrool(this.scene.time.now / 1000);

    // Pulsing eye glow
    const glowAlpha = 0.25 + Math.sin(this.scene.time.now / 180) * 0.15;
    this.eyeGlowL.setAlpha(glowAlpha);
    this.eyeGlowR.setAlpha(glowAlpha);
  }

  _drawWings(flapY) {
    this.wingL.clear();
    // Main wing membrane - dark purple/blue
    this.wingL.fillStyle(0x221155, 0.95);
    this.wingL.fillTriangle(0, 2, -44, -8 * flapY, -8, 16 * flapY);
    // Wing vein highlight
    this.wingL.lineStyle(1, 0x4444aa, 0.7);
    this.wingL.lineBetween(0, 2, -44, -8 * flapY);
    this.wingL.lineBetween(0, 2, -24, 10 * flapY);
    // Drip from wing tip
    this.wingL.fillStyle(0x2244cc, 0.6);
    this.wingL.fillCircle(-42, -6 * flapY, 2);

    this.wingR.clear();
    this.wingR.fillStyle(0x221155, 0.95);
    this.wingR.fillTriangle(0, 2, 44, -8 * flapY, 8, 16 * flapY);
    this.wingR.lineStyle(1, 0x4444aa, 0.7);
    this.wingR.lineBetween(0, 2, 44, -8 * flapY);
    this.wingR.lineBetween(0, 2, 24, 10 * flapY);
    this.wingR.fillStyle(0x2244cc, 0.6);
    this.wingR.fillCircle(42, -6 * flapY, 2);
  }

  takeHit() {
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
      y: this.container.y - 40,
      duration: 300,
      ease: 'Power2'
    });
    const burst = this.scene.add.circle(this.x, this.y, 16, 0xaa44ff, 0.8).setDepth(10);
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
