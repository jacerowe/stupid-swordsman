class PowerupBandage {
  constructor(scene, x, y) {
    this.scene = scene;
    this.collected = false;
    this.bobTimer = Math.random() * Math.PI * 2;
    this.baseY = y;

    this.container = scene.add.container(x, y).setDepth(5);

    const g = scene.add.graphics();

    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(1, 18, 34, 7);

    // Box base (white/grey)
    g.fillStyle(0xeeeedd, 1);
    g.fillRoundedRect(-16, -4, 32, 20, 3);
    // Box base shade
    g.fillStyle(0xccccbb, 0.5);
    g.fillRoundedRect(-16, 8, 32, 8, 3);

    // Green interior (open lid reveals inside)
    g.fillStyle(0x44aa44, 1);
    g.fillRoundedRect(-14, -3, 28, 16, 2);
    g.fillStyle(0x55bb55, 0.5);
    g.fillRect(-14, -3, 14, 6);

    // Bandage strips inside
    g.fillStyle(0xffee99, 1);
    g.fillRect(-11, 2, 20, 5);
    g.fillStyle(0xffdd77, 0.6);
    g.fillRect(-11, 2, 20, 2);
    // Bandage pad dots (little red hearts)
    g.fillStyle(0xff4455, 1);
    g.fillRect(-5, 3, 3, 3);
    g.fillRect(2, 3, 3, 3);

    // Lid (open, hinged up)
    g.fillStyle(0xeeeedd, 1);
    g.fillRoundedRect(-16, -18, 32, 16, 3);
    g.fillStyle(0xccccbb, 0.3);
    g.fillRect(-16, -18, 32, 4);
    // Lid hinge
    g.fillStyle(0x889988, 1);
    g.fillRect(-4, -4, 8, 3);

    // Red cross on lid
    g.fillStyle(0xdd1122, 1);
    g.fillRect(-10, -14, 20, 7);
    g.fillRect(-5, -18, 10, 14);
    // Cross highlight
    g.fillStyle(0xff4455, 0.5);
    g.fillRect(-9, -13, 6, 5);

    // Box border
    g.lineStyle(2, 0xaa9988, 1);
    g.strokeRoundedRect(-16, -4, 32, 20, 3);
    g.lineStyle(2, 0xaa9988, 1);
    g.strokeRoundedRect(-16, -18, 32, 16, 3);

    // Red side crosses on box
    g.fillStyle(0xdd1122, 1);
    g.fillRect(-16, 2, 4, 6);
    g.fillRect(-18, 4, 8, 2);

    this.container.add(g);

    const glowCircle = scene.add.circle(0, 0, 22, 0xff4466, 0.2);
    this.container.addAt(glowCircle, 0);
    this.glowCircle = glowCircle;
    this.glowDir = 1;
  }

  get x() { return this.container.x; }
  get y() { return this.container.y; }
  get width() { return 26; }
  get height() { return 22; }

  update(dt, speed) {
    this.container.x -= speed * dt;
    this.bobTimer += dt * 2.5;
    this.container.y = this.baseY + Math.sin(this.bobTimer) * 5;

    this.glowCircle.alpha += this.glowDir * dt * 0.6;
    if (this.glowCircle.alpha > 0.4) this.glowDir = -1;
    if (this.glowCircle.alpha < 0.1) this.glowDir = 1;

    if (this.container.x < -80) this.collect(true);
  }

  collect(silent) {
    if (this.collected) return;
    this.collected = true;
    if (!silent) {
      this.scene.tweens.add({
        targets: this.container, scaleX: 1.6, scaleY: 1.6, alpha: 0, duration: 280,
        onComplete: () => this.container.destroy()
      });
    } else {
      this.container.destroy();
    }
  }

  destroy() {
    this.collected = true;
    if (this.container && this.container.scene) this.container.destroy();
  }
}
