class EnemyBat {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 28;
    this.hp = 1;
    this.dead = false;
    this.hitThisSwing = false;

    this.flapTimer = 0;
    this.flapFrame = 0;
    this.hoverTimer = 0;
    this.baseY = y;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(4);

    this.wingL = this.scene.add.triangle(-18, 0, -22, -6, 0, -2, -2, 12, 0x442266);
    this.wingR = this.scene.add.triangle(18, 0, 22, -6, 0, -2, 2, 12, 0x442266);
    this.body  = this.scene.add.ellipse(0, 2, 22, 18, 0x221133);
    this.head  = this.scene.add.circle(0, -8, 8, 0x331144);
    this.earL  = this.scene.add.triangle(-5, -14, -8, -14, -2, -14, -5, -22, 0x442266);
    this.earR  = this.scene.add.triangle(5, -14, 2, -14, 8, -14, 5, -22, 0x442266);
    this.eyeL  = this.scene.add.rectangle(-3, -9, 4, 4, 0xff3399);
    this.eyeR  = this.scene.add.rectangle(3, -9, 4, 4, 0xff3399);

    this.container.add([this.wingL, this.wingR, this.body, this.head,
                        this.earL, this.earR, this.eyeL, this.eyeR]);
  }

  update(dt, speed) {
    if (this.dead) return;

    this.x -= speed * dt;
    this.container.x = this.x;

    this.hoverTimer += dt;
    this.container.y = this.baseY + Math.sin(this.hoverTimer * 3.5) * 6;
    this.y = this.container.y;

    this.flapTimer += dt;
    if (this.flapTimer > 0.12) {
      this.flapTimer = 0;
      this.flapFrame = (this.flapFrame + 1) % 2;
    }
    if (this.flapFrame === 0) {
      this.wingL.setScale(1, 1);
      this.wingR.setScale(1, 1);
    } else {
      this.wingL.setScale(1, 0.4);
      this.wingR.setScale(1, 0.4);
    }
  }

  takeHit() {
    if (this.dead) return;
    this.hp--;
    if (this.hp <= 0) {
      this.dead = true;
      this._dieEffect();
    }
  }

  _dieEffect() {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      y: this.container.y - 40,
      duration: 300,
      ease: 'Power2'
    });
    const burst = this.scene.add.circle(this.x, this.y, 16, 0xaa44ff, 0.8).setDepth(10);
    this.scene.tweens.add({
      targets: burst,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 220,
      onComplete: () => burst.destroy()
    });
  }

  destroy() {
    this.container.destroy();
  }
}
