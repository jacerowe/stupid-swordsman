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

    this.shadow = this.scene.add.ellipse(0, 22, 36, 8, 0x000000, 0.25);
    this.box = this.scene.add.rectangle(0, 0, 40, 40, 0x886622);

    const lineGfx = this.scene.add.graphics();
    lineGfx.lineStyle(2, 0x5a3a12, 1);
    lineGfx.lineBetween(-20, 0, 20, 0);
    lineGfx.lineBetween(0, -20, 0, 20);
    lineGfx.strokeRect(-19, -19, 38, 38);

    const crackGfx = this.scene.add.graphics();
    crackGfx.lineStyle(2, 0x331100, 0.9);
    crackGfx.lineBetween(-4, -19, 2, -5);
    crackGfx.lineBetween(2, -5, -3, 4);
    crackGfx.lineBetween(-3, 4, 4, 14);
    crackGfx.lineStyle(1, 0x331100, 0.7);
    crackGfx.lineBetween(8, -15, 5, -3);
    crackGfx.lineBetween(-10, 5, -6, 12);

    this.exclaim = this.scene.add.text(0, -2, '!', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#ffcc00',
      stroke: '#331100', strokeThickness: 3
    }).setOrigin(0.5, 0.5).setAlpha(0.85);

    this.container.add([this.shadow, this.box, lineGfx, crackGfx, this.exclaim]);
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
