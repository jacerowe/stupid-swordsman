class EnemyBasic {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 48;
    this.hp = 1;
    this.dead = false;
    this.hitThisSwing = false;

    this.walkTimer = 0;
    this.walkFrame = 0;

    this._buildGraphics();
  }

  _buildGraphics() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(4);

    this.shadow = this.scene.add.ellipse(0, 26, 32, 8, 0x000000, 0.25);
    this.legL = this.scene.add.rectangle(-7, 18, 8, 16, 0x8b4513);
    this.legR = this.scene.add.rectangle(7, 18, 8, 16, 0x8b4513);
    this.body = this.scene.add.rectangle(0, 4, 30, 26, 0xcc2222);
    this.head = this.scene.add.circle(0, -14, 12, 0xffaa88);
    this.eyeL = this.scene.add.rectangle(-4, -14, 4, 5, 0xff0000);
    this.eyeR = this.scene.add.rectangle(4, -14, 4, 5, 0xff0000);
    this.mouth = this.scene.add.rectangle(0, -8, 10, 3, 0x880000);
    this.armL = this.scene.add.rectangle(-18, 4, 7, 18, 0xcc2222);
    this.armR = this.scene.add.rectangle(18, 4, 7, 18, 0xcc2222);
    this.horn1 = this.scene.add.triangle(0, -26, -6, 0, 6, 0, 0, -13, 0xaa0000);

    this.container.add([this.shadow, this.legL, this.legR, this.body, this.head,
                        this.eyeL, this.eyeR, this.mouth, this.armL, this.armR, this.horn1]);
  }

  update(dt, speed) {
    if (this.dead) return;

    this.x -= speed * dt;
    this.container.x = this.x;

    this.walkTimer += dt;
    if (this.walkTimer > 0.15) {
      this.walkTimer = 0;
      this.walkFrame = (this.walkFrame + 1) % 4;
    }
    const phases = [[14, 22, 22, 14], [18, 18, 18, 18], [22, 14, 14, 22], [18, 18, 18, 18]];
    const [lly, lry, aly, ary] = phases[this.walkFrame];
    this.legL.y = lly;
    this.legR.y = lry;
    this.armL.y = aly - 9;
    this.armR.y = ary - 9;
  }

  takeHit(player) {
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
      y: this.container.y - 30,
      duration: 280,
      ease: 'Power2'
    });
    const burst = this.scene.add.circle(this.x, this.y, 20, 0xff4444, 0.8).setDepth(10);
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
