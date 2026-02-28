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

    const g = this.scene.add.graphics();

    // Outer gold rim
    g.fillStyle(0xdd9900, 1);
    g.fillCircle(0, 0, 11);
    // Main gold face
    g.fillStyle(0xffcc22, 1);
    g.fillCircle(0, 0, 9);
    // Highlight
    g.fillStyle(0xffee88, 0.7);
    g.fillCircle(-2, -2, 4);
    // Tiny knight helmet silhouette in center
    g.fillStyle(0xcc8800, 1);
    g.fillRect(-3, -1, 6, 5);      // visor body
    g.fillRect(-4, -4, 8, 4);      // helmet dome
    g.fillRect(-5, -1, 10, 2);     // brim
    g.fillStyle(0xffaa00, 0.5);
    g.fillRect(-2, -3, 3, 3);      // highlight on dome
    // Edge shadow
    g.lineStyle(1, 0xaa6600, 1);
    g.strokeCircle(0, 0, 9);

    this.container.add(g);
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
