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

    this.glow = this.scene.add.circle(0, 0, 20, 0xff6600, 0.4);
    this.ball = this.scene.add.circle(0, 0, 14, 0xff3300);
    this.inner = this.scene.add.circle(0, -3, 7, 0xffaa00);
    this.spark1 = this.scene.add.triangle(-8, -10, -12, -8, -4, -8, -8, -18, 0xff6600);
    this.spark2 = this.scene.add.triangle(6, -12, 2, -10, 10, -10, 6, -20, 0xffdd00);
    this.spark3 = this.scene.add.triangle(0, -14, -4, -11, 4, -11, 0, -22, 0xff4400);

    this.container.add([this.glow, this.ball, this.inner, this.spark1, this.spark2, this.spark3]);
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
