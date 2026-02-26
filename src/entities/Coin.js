class Coin {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 18;
    this.height = 18;
    this.collected = false;
    this.scoreValue = 10;
    this.bobTimer = 0;
    this.baseY = y;
    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(5);
    this.ring = this.scene.add.circle(0, 0, 9, 0xffcc00).setStrokeStyle(2, 0xff9900);
    this.inner = this.scene.add.circle(0, 0, 5, 0xffee55);
    this.container.add([this.ring, this.inner]);
  }

  update(dt, speed) {
    if (this.collected) return;
    this.x -= speed * dt;
    this.bobTimer += dt;
    this.container.x = this.x;
    this.container.y = this.baseY + Math.sin(this.bobTimer * 5) * 3;
  }

  collect() {
    if (this.collected) return;
    this.collected = true;
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.8, scaleY: 1.8, alpha: 0,
      y: this.container.y - 25,
      duration: 250, ease: 'Power2',
      onComplete: () => this.container.destroy()
    });
  }

  destroy() { this.container.destroy(); }
}
