class PowerupShield {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 34;
    this.collected = false;

    this.bobTimer = 0;
    this.baseY = y;
    this.glowTimer = 0;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(5);

    this.glow = this.scene.add.circle(0, 0, 20, 0x4488ff, 0.35);
    this.shieldBody = this.scene.add.triangle(
      0, 0,
      -14, -16,
      14, -16,
      14, 6,
      0x2255dd
    );
    this.shieldBottom = this.scene.add.triangle(
      0, 0,
      -14, 6,
      14, 6,
      0, 18,
      0x2255dd
    );
    this.shieldHighlight = this.scene.add.triangle(
      0, 0,
      -7, -12,
      0, -12,
      -7, 4,
      0x88aaff
    );
    this.cross = this.scene.add.rectangle(0, -5, 5, 16, 0xaaccff);
    this.crossH = this.scene.add.rectangle(0, -5, 14, 5, 0xaaccff);

    this.container.add([this.glow, this.shieldBody, this.shieldBottom, this.shieldHighlight, this.cross, this.crossH]);
  }

  update(dt, speed) {
    if (this.collected) return;

    this.x -= speed * dt;
    this.bobTimer += dt;
    this.glowTimer += dt;

    this.container.x = this.x;
    this.container.y = this.baseY + Math.sin(this.bobTimer * 4) * 4;

    const pulse = 0.25 + Math.sin(this.glowTimer * 6) * 0.15;
    this.glow.setAlpha(pulse);
  }

  collect() {
    if (this.collected) return;
    this.collected = true;

    this.scene.tweens.add({
      targets: this.container,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      y: this.container.y - 35,
      duration: 280,
      ease: 'Power2',
      onComplete: () => this.container.destroy()
    });
  }

  destroy() {
    this.container.destroy();
  }
}
