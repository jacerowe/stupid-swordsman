class CoinSafe {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.collected = false;
    this.scoreValue = 100;
    this.bobTimer = 0;
    this.baseY = y;
    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(5);

    const g = this.scene.add.graphics();

    // Shadow
    g.fillStyle(0x000000, 0.22);
    g.fillEllipse(1, 22, 38, 8);

    // Safe body - steel grey box
    g.fillStyle(0x5a6875, 1);
    g.fillRect(-17, -14, 34, 28);
    // Body highlight
    g.fillStyle(0x7a8e9a, 0.6);
    g.fillRect(-16, -13, 14, 10);
    // Bottom shade
    g.fillStyle(0x3a4855, 0.5);
    g.fillRect(-17, 6, 34, 8);

    // Thick metal border
    g.lineStyle(3, 0x445566, 1);
    g.strokeRect(-17, -14, 34, 28);
    // Corner bolts
    g.fillStyle(0x889aaa, 1);
    [[-13,-10],[13,-10],[-13,10],[13,10]].forEach(([bx,by]) => g.fillCircle(bx, by, 2.5));

    // Safe door panel
    g.fillStyle(0x4a5a68, 1);
    g.fillRect(-8, -10, 20, 20);
    g.lineStyle(1, 0x667788, 1);
    g.strokeRect(-8, -10, 20, 20);

    // Combination dial
    g.fillStyle(0x334455, 1);
    g.fillCircle(2, 0, 7);
    g.fillStyle(0x8899aa, 1);
    g.fillCircle(2, 0, 5);
    g.fillStyle(0xaabbcc, 1);
    g.fillCircle(2, 0, 2);
    // Dial notch
    g.fillStyle(0x222233, 1);
    g.fillRect(2, -7, 2, 3);

    // Lock bar
    g.fillStyle(0xffbb00, 1);
    g.fillCircle(-12, 0, 4);
    g.lineStyle(2, 0xdd9900, 1);
    g.strokeCircle(-12, 0, 4);

    // Coins piled on top
    const coinPile = [[-12,-17],[-7,-20],[0,-22],[7,-20],[12,-17],[3,-16],[-4,-15]];
    coinPile.forEach(([cx, cy]) => {
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
    this.container.y = this.baseY + Math.sin(this.bobTimer * 3.5) * 3;
  }

  collect() {
    if (this.collected) return;
    this.collected = true;
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 2.2, scaleY: 2.2, alpha: 0,
      y: this.container.y - 35,
      duration: 300, ease: 'Power2',
      onComplete: () => this.container.destroy()
    });
  }

  destroy() { this.container.destroy(); }
}
