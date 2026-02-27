class PowerupBandage {
  constructor(scene, x, y) {
    this.scene = scene;
    this.collected = false;
    this.bobTimer = Math.random() * Math.PI * 2;
    this.baseY = y;

    this.container = scene.add.container(x, y).setDepth(5);

    const bg = scene.add.rectangle(0, 0, 26, 22, 0xffffff);
    const stripe = scene.add.rectangle(0, 0, 8, 22, 0xff6688);
    const stripeH = scene.add.rectangle(0, 0, 26, 8, 0xff6688);
    const dot = scene.add.circle(0, 0, 3, 0xff2255);

    this.container.add([bg, stripe, stripeH, dot]);

    const glowCircle = scene.add.circle(0, 0, 18, 0xff88aa, 0.25);
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
