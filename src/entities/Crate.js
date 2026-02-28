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

    this.shadow = this.scene.add.ellipse(2, 23, 40, 9, 0x000000, 0.28);
    this.container.add(this.shadow);

    const g = this.scene.add.graphics();

    // Main wood body
    g.fillStyle(0xc07830, 1);
    g.fillRect(-19, -19, 38, 38);

    // Wood grain planks (horizontal bands)
    g.fillStyle(0xa86228, 1);
    g.fillRect(-19, -19, 38, 5);
    g.fillRect(-19, -1, 38, 5);
    g.fillRect(-19, 14, 38, 5);

    // Highlight (top-left bevel)
    g.fillStyle(0xd8944a, 0.5);
    g.fillRect(-18, -18, 36, 3);
    g.fillRect(-18, -18, 3, 36);

    // Grain lines
    g.lineStyle(1, 0x8a4a18, 0.6);
    g.lineBetween(-8, -19, -8, 19);
    g.lineBetween(8, -19, 8, 19);

    // Cross braces
    g.lineStyle(2, 0x7a4a20, 1);
    g.lineBetween(-19, -8, 19, -8);
    g.lineBetween(-19, 8, 19, 8);

    // Border
    g.lineStyle(2, 0x5a3010, 1);
    g.strokeRect(-19, -19, 38, 38);

    // Metal corner brackets
    g.fillStyle(0x8899aa, 1);
    const corners = [[-19,-19],[19,-19],[-19,19],[19,19]];
    corners.forEach(([cx, cy]) => {
      const sx = cx < 0 ? 1 : -1;
      const sy = cy < 0 ? 1 : -1;
      g.fillRect(cx, cy, sx * 9, sy * 3);
      g.fillRect(cx, cy, sx * 3, sy * 9);
    });
    // Bracket rivets
    g.fillStyle(0xaabbcc, 1);
    [[-16,-16],[16,-16],[-16,16],[16,16]].forEach(([rx,ry]) => g.fillCircle(rx, ry, 2));

    this.container.add(g);
  }

  update(dt, speed) {
    this.x -= speed * dt;
    this.container.x = this.x;
  }

  destroy() {
    this.container.destroy();
  }
}
