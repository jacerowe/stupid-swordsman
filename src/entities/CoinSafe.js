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
    this.box = this.scene.add.rectangle(0, 0, 30, 28, 0x556677).setStrokeStyle(2, 0x889aaa);
    this.door = this.scene.add.rectangle(4, 0, 18, 20, 0x445566).setStrokeStyle(1, 0x99bbcc);
    this.handle = this.scene.add.circle(4, 0, 5, 0xaabbcc).setStrokeStyle(2, 0x334455);
    this.handleDot = this.scene.add.circle(4, 0, 2, 0x889aaa);
    this.label = this.scene.add.text(-8, 0, '100', {
      fontSize: '8px', fontFamily: 'Arial Black', color: '#ffee00'
    }).setOrigin(0.5, 0.5);
    this.container.add([this.box, this.door, this.handle, this.handleDot, this.label]);
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
