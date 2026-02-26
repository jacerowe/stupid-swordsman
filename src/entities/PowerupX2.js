class PowerupX2 {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.collected = false;

    this.bobTimer = 0;
    this.baseY = y;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(5);

    this.bg = this.scene.add.rectangle(0, 0, 32, 32, 0xffdd00).setStrokeStyle(3, 0x22cc44);
    this.label = this.scene.add.text(0, 0, 'x2', {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#003300',
      stroke: '#ffff00',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    this.container.add([this.bg, this.label]);
  }

  update(dt, speed) {
    if (this.collected) return;

    this.x -= speed * dt;
    this.bobTimer += dt;
    this.container.x = this.x;
    this.container.y = this.baseY + Math.sin(this.bobTimer * 4) * 4;
  }

  collect() {
    if (this.collected) return;
    this.collected = true;

    this.scene.tweens.add({
      targets: this.container,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      y: this.container.y - 40,
      duration: 300,
      ease: 'Power2',
      onComplete: () => this.container.destroy()
    });
  }

  destroy() {
    this.container.destroy();
  }
}
