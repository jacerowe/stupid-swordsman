class BreakableCrate {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.dead = false;
    this.breakable = true;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(4);

    this.shadow = this.scene.add.ellipse(2, 23, 40, 9, 0x000000, 0.28);
    this.container.add(this.shadow);

    const g = this.scene.add.graphics();

    // Darker wood (slightly damaged/aged)
    g.fillStyle(0xaa6620, 1);
    g.fillRect(-19, -19, 38, 38);

    // Wood plank bands
    g.fillStyle(0x8a4e14, 1);
    g.fillRect(-19, -19, 38, 5);
    g.fillRect(-19, -1, 38, 5);
    g.fillRect(-19, 14, 38, 5);

    // Top-left bevel highlight
    g.fillStyle(0xcc7a30, 0.5);
    g.fillRect(-18, -18, 36, 3);
    g.fillRect(-18, -18, 3, 36);

    // Grain lines
    g.lineStyle(1, 0x6a3a10, 0.6);
    g.lineBetween(-8, -19, -8, 19);
    g.lineBetween(8, -19, 8, 19);

    // Cross braces
    g.lineStyle(2, 0x6a3a10, 1);
    g.lineBetween(-19, -8, 19, -8);
    g.lineBetween(-19, 8, 19, 8);

    // Border
    g.lineStyle(2, 0x441800, 1);
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
    g.fillStyle(0xaabbcc, 1);
    [[-16,-16],[16,-16],[-16,16],[16,16]].forEach(([rx,ry]) => g.fillCircle(rx, ry, 2));

    // Big diagonal crack
    g.lineStyle(3, 0x220800, 0.95);
    g.lineBetween(-2, -19, 6, -4);
    g.lineBetween(6, -4, -2, 8);
    g.lineBetween(-2, 8, 5, 19);
    g.lineStyle(1, 0x330a00, 0.7);
    g.lineBetween(10, -14, 7, -1);
    g.lineBetween(-12, 4, -8, 14);

    this.container.add(g);

    // Yellow ! sign
    this.exclaim = this.scene.add.text(0, -1, '!', {
      fontSize: '20px', fontFamily: 'Arial Black',
      color: '#ffdd00', stroke: '#553300', strokeThickness: 4
    }).setOrigin(0.5, 0.5);
    this.container.add(this.exclaim);
  }

  update(dt, speed) {
    if (this.dead) return;
    this.x -= speed * dt;
    this.container.x = this.x;
  }

  smash() {
    if (this.dead) return;
    this.dead = true;
    this.scene.tweens.add({
      targets: this.container,
      angle: 25,
      scaleX: 1.3, scaleY: 0.2,
      alpha: 0,
      y: this.container.y + 20,
      duration: 220,
      ease: 'Power2',
      onComplete: () => this.container.destroy()
    });
    for (let i = 0; i < 5; i++) {
      const chip = this.scene.add.rectangle(
        this.x + Phaser.Math.Between(-12, 12),
        this.y + Phaser.Math.Between(-12, 12),
        Phaser.Math.Between(4, 10), Phaser.Math.Between(4, 10),
        0xaa7733
      ).setDepth(10);
      this.scene.tweens.add({
        targets: chip,
        x: chip.x + Phaser.Math.Between(-30, 30),
        y: chip.y - Phaser.Math.Between(10, 30),
        alpha: 0, angle: Phaser.Math.Between(-90, 90),
        duration: 300,
        onComplete: () => chip.destroy()
      });
    }
  }

  destroy() {
    this.container.destroy();
  }
}
