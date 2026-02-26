class Spawner {
  constructor(scene) {
    this.scene = scene;
    this.timer = 1.2;
    this.lastWasCrate = false;
    this.lastWasBat = false;
    this.lastWasEnemy = false;
    this.consecutiveArmored = 0;

    this.CRATE_CHANCE = 0.30;
    this.BAT_CHANCE = 0.25;
    this.ARMORED_CHANCE_BASE = 0.18;
    this.CLUSTER_CHANCE = 0.20;
  }

  _randomInterval(score) {
    const base = score >= 500 ? 0.85 : 1.0;
    const top  = score >= 500 ? 1.5 : 1.8;
    return base + Math.random() * (top - base);
  }

  _spawnGroundEnemy(spawnX, groundY, score) {
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
  }

  update(time, dt, score, speed) {
    this.timer -= dt;
    if (this.timer > 0) return;

    const W = this.scene.W;
    const groundY = this.scene.groundY;
    const spawnX = W + Phaser.Math.Between(60, 180);

    const canBat = score >= 700;
    let spawnCrate = !this.lastWasCrate && Math.random() < this.CRATE_CHANCE;
    let spawnBat   = canBat && !this.lastWasBat && !spawnCrate && Math.random() < this.BAT_CHANCE;

    if (spawnBat) {
      const batY = groundY - 130 - Phaser.Math.Between(0, 40);
      const bat = new EnemyBat(this.scene, spawnX, batY);
      this.scene.enemies.push(bat);
      this.lastWasBat = true;
      this.lastWasCrate = false;
      this.lastWasEnemy = false;
    } else if (spawnCrate) {
      const crateY = groundY - 20;
      const crate = new Crate(this.scene, spawnX, crateY);
      this.scene.crates.push(crate);
      this.lastWasCrate = true;
      this.lastWasBat = false;
      this.lastWasEnemy = false;
    } else {
      this._spawnGroundEnemy(spawnX, groundY, score);

      const canCluster = !this.lastWasCrate && !this.lastWasBat && Math.random() < this.CLUSTER_CHANCE;
      if (canCluster) {
        const gap = Phaser.Math.Between(55, 85);
        this._spawnGroundEnemy(spawnX + gap, groundY, score);
      }

      this.lastWasCrate = false;
      this.lastWasBat = false;
      this.lastWasEnemy = true;
    }

    let interval = this._randomInterval(score);
    if (spawnCrate || this.lastWasCrate) interval *= 1.3;
    if (spawnBat) interval *= 1.1;
    this.timer = Math.max(0.85, interval);
  }
}
