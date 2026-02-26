class Crate {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.dead = false;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(4);

    this.shadow = this.scene.add.ellipse(0, 22, 36, 8, 0x000000, 0.25);

    this.box = this.scene.add.rectangle(0, 0, 40, 40, 0xaa7733);
    this.boxDark = this.scene.add.rectangle(0, 0, 40, 40, 0x000000, 0);

    const lineGfx = this.scene.add.graphics();
    lineGfx.lineStyle(2, 0x7a5522, 1);
    lineGfx.lineBetween(-20, 0, 20, 0);
    lineGfx.lineBetween(0, -20, 0, 20);
    lineGfx.strokeRect(-19, -19, 38, 38);

    const nailGfx = this.scene.add.graphics();
    nailGfx.fillStyle(0x554422, 1);
    [[-15, -15], [15, -15], [-15, 15], [15, 15]].forEach(([nx, ny]) => {
      nailGfx.fillCircle(nx, ny, 2.5);
    });

    this.container.add([this.shadow, this.box, lineGfx, nailGfx]);
  }

  update(dt, speed) {
    this.x -= speed * dt;
    this.container.x = this.x;
  }

  destroy() {
    this.container.destroy();
  }
}
