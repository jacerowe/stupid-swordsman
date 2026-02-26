class Sword {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.restState = 'UP';
    this.swinging = false;
    this.cooldown = 0;
    this.cooldownDuration = 0.001;
    this.hitSomethingThisSwing = false;
    this.swingTimer = 0;
    this.swingDuration = 0.18;
    this.activeFrameStart = 0.04;
    this.activeFrameEnd = 0.14;

    this.container = scene.add.container(player.x, player.y).setDepth(6);

    this.blade = scene.add.rectangle(22, 0, 40, 7, 0xddddee);
    this.guard = scene.add.rectangle(4, 0, 7, 16, 0xaa8833);
    this.grip = scene.add.rectangle(-3, 0, 9, 11, 0x663311);

    this.container.add([this.grip, this.guard, this.blade]);

    this._setRestAngle();
  }

  _setRestAngle() {
    if (this.restState === 'UP') {
      this.container.setRotation(-Math.PI / 3.5);
    } else {
      this.container.setRotation(Math.PI / 3.5);
    }
  }

  trySwing() {
    if (this.swinging || this.cooldown > 0) return;

    this.swinging = true;
    this.swingTimer = 0;
    this.hitSomethingThisSwing = false;
    this._swingFrom = this.restState === 'UP' ? -Math.PI / 3.5 : Math.PI / 3.5;
    this._swingTo = this.restState === 'UP' ? Math.PI / 3.5 : -Math.PI / 3.5;
    this._nextRestState = this.restState === 'UP' ? 'DOWN' : 'UP';

    this.scene.enemies.forEach(e => { e.hitThisSwing = false; });
  }

  isActive() {
    return this.swinging &&
           this.swingTimer >= this.activeFrameStart &&
           this.swingTimer <= this.activeFrameEnd;
  }

  getHitboxX() {
    return this.player.x + 30;
  }

  update(time, delta) {
    const dt = delta / 1000;
    const px = this.player.x, py = this.player.y;

    this.container.x = px;
    this.container.y = py;

    if (this.cooldown > 0) this.cooldown -= dt;

    if (this.swinging) {
      this.swingTimer += dt;
      const t = Math.min(this.swingTimer / this.swingDuration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      this.container.setRotation(Phaser.Math.Linear(this._swingFrom, this._swingTo, eased));

      if (this.swingTimer >= this.swingDuration) {
        this.swinging = false;
        this.cooldown = this.cooldownDuration;
        this.restState = this._nextRestState;
        this._setRestAngle();
        if (!this.hitSomethingThisSwing) {
          this.scene.events.emit('swordWhiff');
        }
      }
    }
  }

  destroy() {
    this.container.destroy();
  }
}
