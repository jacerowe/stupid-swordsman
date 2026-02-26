class Spawner {
  constructor(scene) {
    this.scene = scene;
    this.timer = 1.2;
    this.lastWasCrate = false;
    this.lastWasEnemy = false;
    this.consecutiveArmored = 0;

    this.CRATE_CHANCE = 0.40;
    this.ARMORED_CHANCE_BASE = 0.18;
  }

  _randomInterval(score, speed) {
    const base = score >= 500 ? 0.85 : 1.0;
    const top  = score >= 500 ? 1.5 : 1.8;
    return base + Math.random() * (top - base);
  }

  update(time, dt, score, speed) {
    this.timer -= dt;
    if (this.timer > 0) return;

    const W = this.scene.W;
    const groundY = this.scene.groundY;
    const spawnX = W + Phaser.Math.Between(60, 220);

    let spawnCrate = Math.random() < this.CRATE_CHANCE;

    if (this.lastWasCrate) spawnCrate = false;

    if (spawnCrate) {
      const crateY = groundY - 20;
      const crate = new Crate(this.scene, spawnX, crateY);
      this.scene.crates.push(crate);
      this.lastWasCrate = true;
      this.lastWasEnemy = false;
    } else {
      const spawnArmored = score >= 1000 &&
                           Math.random() < (this.ARMORED_CHANCE_BASE + Math.min(0.22, (score - 1000) / 8000)) &&
                           this.consecutiveArmored < 2;

      if (spawnArmored) {
        const enemy = new EnemyArmored(this.scene, spawnX, groundY - 27);
        this.scene.enemies.push(enemy);
        this.consecutiveArmored++;
      } else {
        const enemy = new EnemyBasic(this.scene, spawnX, groundY - 24);
        this.scene.enemies.push(enemy);
        this.consecutiveArmored = 0;
      }

      this.lastWasCrate = false;
      this.lastWasEnemy = true;
    }

    let interval = this._randomInterval(score, speed);
    if (spawnCrate || this.lastWasCrate) interval *= 1.3;
    this.timer = Math.max(0.85, interval);
  }
}
