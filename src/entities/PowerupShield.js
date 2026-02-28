class PowerupShield {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 34;
    this.collected = false;

    this.bobTimer = 0;
    this.baseY = y;
    this.glowTimer = 0;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(5);

    // Glow pulse
    this.glow = this.scene.add.circle(0, 2, 22, 0x4488ff, 0.3);
    this.container.add(this.glow);

    const g = this.scene.add.graphics();

    // Shield silhouette: classic heater shape
    // Metal rim (slightly larger, drawn first)
    g.fillStyle(0x8899aa, 1);
    g.fillPoints([
      {x:-16,y:-18},{x:16,y:-18},{x:18,y:0},{x:10,y:14},{x:0,y:20},{x:-10,y:14},{x:-18,y:0}
    ], true);
    // Rivet details on rim
    g.fillStyle(0xaabbcc, 1);
    [[-14,-14],[14,-14],[16,-2],[0,18],[-16,-2]].forEach(([rx,ry]) => g.fillCircle(rx,ry,2));

    // Wooden face (warm orange-brown)
    g.fillStyle(0xc87830, 1);
    g.fillPoints([
      {x:-13,y:-15},{x:13,y:-15},{x:15,y:-1},{x:8,y:11},{x:0,y:17},{x:-8,y:11},{x:-15,y:-1}
    ], true);
    // Wood plank lines
    g.lineStyle(1, 0xa05820, 0.7);
    g.lineBetween(-12, -6, 12, -6);
    g.lineBetween(-14, 4, 14, 4);
    // Wood highlight
    g.fillStyle(0xe09848, 0.4);
    g.fillRect(-8, -14, 8, 12);

    // Dragon head engraving (simplified silhouette)
    g.fillStyle(0x7a4818, 0.85);
    // Head shape
    g.fillEllipse(1, -2, 14, 10);
    // Snout
    g.fillTriangle(6, -1, 14, 1, 14, 4);
    // Eye
    g.fillStyle(0xffaa00, 1);
    g.fillCircle(-2, -3, 2);
    g.fillStyle(0x330000, 1);
    g.fillCircle(-2, -3, 1);
    // Crest spikes
    g.fillStyle(0x7a4818, 0.85);
    g.fillTriangle(-4, -6, -1, -6, -3, -13);
    g.fillTriangle(-1, -5, 2, -5, 0, -12);
    g.fillTriangle(1, -5, 4, -5, 3, -11);

    this.container.add(g);
  }

  update(dt, speed) {
    if (this.collected) return;

    this.x -= speed * dt;
    this.bobTimer += dt;
    this.glowTimer += dt;

    this.container.x = this.x;
    this.container.y = this.baseY + Math.sin(this.bobTimer * 4) * 4;

    const pulse = 0.25 + Math.sin(this.glowTimer * 6) * 0.15;
    this.glow.setAlpha(pulse);
  }

  collect() {
    if (this.collected) return;
    this.collected = true;

    this.scene.tweens.add({
      targets: this.container,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      y: this.container.y - 35,
      duration: 280,
      ease: 'Power2',
      onComplete: () => this.container.destroy()
    });
  }

  destroy() {
    this.container.destroy();
  }
}
