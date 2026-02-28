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

    const g = this.scene.add.graphics();

    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(2, 20, 34, 8);

    // Green outer border (thick, rounded feel)
    g.fillStyle(0x33aa22, 1);
    g.fillRoundedRect(-18, -18, 36, 36, 6);
    // Green inner border shade
    g.fillStyle(0x228811, 1);
    g.fillRoundedRect(-16, -16, 32, 32, 5);

    // Gold face
    g.fillStyle(0xffcc22, 1);
    g.fillRoundedRect(-14, -14, 28, 28, 4);
    // Gold highlight
    g.fillStyle(0xffee88, 0.6);
    g.fillRoundedRect(-12, -12, 14, 10, 3);
    // Gold shade bottom
    g.fillStyle(0xcc9900, 0.4);
    g.fillRoundedRect(-14, 6, 28, 8, 3);

    // Crack details on tablet
    g.lineStyle(1, 0xaa7700, 0.6);
    g.lineBetween(-6, -14, -8, -4);
    g.lineBetween(-8, -4, -4, 4);
    g.lineBetween(8, -12, 10, 2);

    this.container.add(g);

    // x2 label - green text on gold
    this.label = this.scene.add.text(0, 1, 'x2', {
      fontSize: '17px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#1a7700',
      stroke: '#ffee00',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);
    this.container.add(this.label);
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
