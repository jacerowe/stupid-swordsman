class PowerupFireball {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 34;
    this.collected = false;

    this.bobTimer = 0;
    this.baseY = y;
    this.glowTimer = 0;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(5);

    // Outer glow aura
    this.glow = this.scene.add.circle(0, 0, 26, 0xff4400, 0.25);
    this.container.add(this.glow);

    const g = this.scene.add.graphics();

    // Outer fire - large dark orange flames
    g.fillStyle(0xcc3300, 1);
    g.fillTriangle(-16, 6, 0, 6, -10, -20);
    g.fillTriangle(16, 6, 0, 6, 10, -20);
    g.fillTriangle(-8, 6, 8, 6, 0, -24);
    // White flame tips
    g.fillStyle(0xffffff, 0.6);
    g.fillTriangle(-4, -16, 4, -16, 0, -26);

    // Mid orange flames
    g.fillStyle(0xff5500, 1);
    g.fillTriangle(-14, 6, 2, 6, -8, -16);
    g.fillTriangle(14, 6, -2, 6, 8, -16);
    g.fillTriangle(-6, 4, 6, 4, 0, -18);

    // Inner bright orange
    g.fillStyle(0xff8800, 1);
    g.fillCircle(0, 2, 14);
    // Bright yellow center
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(0, 2, 9);
    // White hot core
    g.fillStyle(0xffffff, 1);
    g.fillCircle(0, 2, 5);
    // Core inner glow
    g.fillStyle(0xffee88, 0.8);
    g.fillCircle(0, 2, 3);

    this.container.add(g);
  }

  update(dt, speed) {
    if (this.collected) return;

    this.x -= speed * dt;
    this.bobTimer += dt;
    this.glowTimer += dt;

    this.container.x = this.x;
    this.container.y = this.baseY + Math.sin(this.bobTimer * 5) * 5;

    const pulse = 0.3 + Math.sin(this.glowTimer * 8) * 0.2;
    this.glow.setAlpha(pulse);
    this.container.setRotation(Math.sin(this.glowTimer * 3) * 0.15);
  }

  collect() {
    if (this.collected) return;
    this.collected = true;

    this.scene.tweens.add({
      targets: this.container,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 250,
      ease: 'Power2',
      onComplete: () => this.container.destroy()
    });
  }

  destroy() {
    this.container.destroy();
  }
}
