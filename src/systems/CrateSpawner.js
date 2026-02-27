class CrateSpawner {
  constructor(scene) {
    this.scene = scene;
    this.timer = 2.5;
    this.globalCooldown = 0;
  }

  _randomInterval(score) {
    let base, top;
    if (score >= 1500)      { base = 1.2; top = 1.8; }
    else if (score >= 1000) { base = 1.4; top = 2.0; }
    else if (score >= 300)  { base = 1.6; top = 2.4; }
    else                    { base = 2.0; top = 3.0; }
    return base + Math.random() * (top - base);
  }

  triggerGlobalCooldown(duration) {
    this.globalCooldown = Math.max(this.globalCooldown, duration !== undefined ? duration : 0.3);
  }

  update(dt, score) {
    if (this.globalCooldown > 0) {
      this.globalCooldown -= dt;
      return;
    }
    this.timer -= dt;
    if (this.timer > 0) return;

    const W = this.scene.W;
    const spawnX = W + Phaser.Math.Between(40, 120);

    const tooClose = this.scene.enemies.some(e => !e.dead && Math.abs(e.x - spawnX) < 200);
    if (tooClose) {
      this.timer = 0.3;
      return;
    }

    const isBreakable = Math.random() < 0.5;
    const hard = score >= 700;
    if (isBreakable) {
      this.scene.crates.push(new BreakableCrate(this.scene, spawnX, this.scene.groundY - 20));
      this.scene.enemySpawner.triggerGlobalCooldown(hard ? 0.5 : 0.7);
      this.scene.collectibleSpawner.triggerGlobalCooldown(hard ? 0.3 : 0.5);
    } else {
      this.scene.crates.push(new Crate(this.scene, spawnX, this.scene.groundY - 20));
      this.scene.enemySpawner.triggerGlobalCooldown(hard ? 0.7 : 1.0);
      this.scene.collectibleSpawner.triggerGlobalCooldown(hard ? 0.5 : 0.7);
    }

    this.timer = this._randomInterval(score);
  }
}
