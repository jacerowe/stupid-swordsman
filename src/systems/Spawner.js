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
    const base = score >= 500 ? 0.7 : 0.9;
    const top  = score >= 500 ? 1.3 : 1.6;
    const speedFactor = Math.max(0.6, 1 - (speed - 220) / 600);
    return (base + Math.random() * (top - base)) * speedFactor;
  }

  update(time, dt, score, speed) {
    this.timer -= dt;
    if (this.timer > 0) return;

    const W = this.scene.W;
    const groundY = this.scene.groundY;
    const spawnX = W + Phaser.Math.Between(60, 220);

    let spawnCrate = Math.random() < this.CRATE_CHANCE;

    if (this.lastWasCrate && spawnCrate) {
      if (Math.random() < 0.55) spawnCrate = false;
    }

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

      let enemyY;
      if (spawnArmored) {
        enemyY = groundY - 27;
        const enemy = new EnemyArmored(this.scene, spawnX, enemyY);
        this.scene.enemies.push(enemy);
        this.consecutiveArmored++;
      } else {
        enemyY = groundY - 24;
        const enemy = new EnemyBasic(this.scene, spawnX, enemyY);
        this.scene.enemies.push(enemy);
        this.consecutiveArmored = 0;
      }

      this.lastWasCrate = false;
      this.lastWasEnemy = true;
    }

    let interval = this._randomInterval(score, speed);
    if (this.lastWasCrate && this.lastWasEnemy) interval *= 1.25;
    this.timer = Math.max(0.55, interval);
  }
}
