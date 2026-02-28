class CoinBag {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 26;
    this.height = 28;
    this.collected = false;
    this.scoreValue = 50;
    this.bobTimer = 0;
    this.baseY = y;
    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(5);

    const g = this.scene.add.graphics();

    // Bag shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(1, 20, 30, 8);

    // Bag body - rounded cloth sack
    g.fillStyle(0x9b6420, 1);
    g.fillEllipse(0, 6, 32, 28);
    // Bag highlight
    g.fillStyle(0xcc8833, 0.6);
    g.fillEllipse(-6, 0, 12, 14);
    // Bag shade bottom
    g.fillStyle(0x6b3e10, 0.5);
    g.fillEllipse(0, 12, 28, 14);

    // Cloth wrinkle lines
    g.lineStyle(1, 0x7a4a18, 0.6);
    g.lineBetween(-10, 8, -14, 16);
    g.lineBetween(10, 6, 13, 15);

    // Neck / tie
    g.fillStyle(0x7a4a18, 1);
    g.fillRect(-6, -8, 12, 8);
    // Knot
    g.fillStyle(0xbb7722, 1);
    g.fillCircle(0, -10, 6);
    g.fillStyle(0xddaa44, 0.7);
    g.fillCircle(-2, -11, 3);

    // Coins spilling out the top
    const coinPositions = [[-8,-14],[0,-17],[8,-14],[4,-12],[-4,-11]];
    coinPositions.forEach(([cx, cy]) => {
      g.fillStyle(0xdd9900, 1);
      g.fillCircle(cx, cy, 5);
      g.fillStyle(0xffcc22, 1);
      g.fillCircle(cx, cy, 4);
      g.fillStyle(0xffee77, 0.7);
      g.fillCircle(cx - 1, cy - 1, 2);
    });

    this.container.add(g);
  }

  update(dt, speed) {
    if (this.collected) return;
    this.x -= speed * dt;
    this.bobTimer += dt;
    this.container.x = this.x;
    this.container.y = this.baseY + Math.sin(this.bobTimer * 4.5) * 4;
  }

  collect() {
    if (this.collected) return;
    this.collected = true;
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 2, scaleY: 2, alpha: 0,
      y: this.container.y - 30,
      duration: 280, ease: 'Power2',
      onComplete: () => this.container.destroy()
    });
  }

  destroy() { this.container.destroy(); }
}
