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
    this.bag = this.scene.add.ellipse(0, 4, 24, 22, 0xcc8800);
    this.neck = this.scene.add.rectangle(0, -7, 10, 6, 0xaa6600);
    this.knot = this.scene.add.circle(0, -11, 5, 0xffaa00).setStrokeStyle(1, 0xcc7700);
    this.dollarSign = this.scene.add.text(0, 5, '$', {
      fontSize: '12px', fontFamily: 'Arial Black', color: '#ffee00'
    }).setOrigin(0.5, 0.5);
    this.container.add([this.bag, this.neck, this.knot, this.dollarSign]);
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
