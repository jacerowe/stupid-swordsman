class Spawner {
  constructor(scene) {
    this.scene = scene;
    this.timer = 1.0;
    this.lastWasCrate = false;
    this.lastWasBat = false;
    this.consecutiveArmored = 0;

    this.CRATE_CHANCE = 0.28;
    this.BAT_CHANCE = 0.35;
    this.ARMORED_CHANCE_BASE = 0.30;
    this.CLUSTER_CHANCE = 0.30;
  }

  _randomInterval(score) {
    const base = score >= 300 ? 0.75 : 0.9;
    const top  = score >= 300 ? 1.3 : 1.6;
    return base + Math.random() * (top - base);
  }

  _spawnGroundEnemy(spawnX, groundY, score) {
    const spawnArmored = score >= 700 &&
                         Math.random() < (this.ARMORED_CHANCE_BASE + Math.min(0.3, (score - 700) / 3000)) &&
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
    const spawnX = W + Phaser.Math.Between(40, 140);

    const canBat = score >= 500;
    const roll = Math.random();

    let spawned = 'enemy';

    if (!this.lastWasCrate && roll < this.CRATE_CHANCE) {
      spawned = 'crate';
    } else if (canBat && !this.lastWasBat && roll < this.CRATE_CHANCE + this.BAT_CHANCE) {
      spawned = 'bat';
    }

    if (spawned === 'crate') {
      const crate = new Crate(this.scene, spawnX, groundY - 20);
      this.scene.crates.push(crate);
      this.lastWasCrate = true;
      this.lastWasBat = false;
    } else if (spawned === 'bat') {
      const batY = groundY - 100 - Phaser.Math.Between(10, 30);
      const bat = new EnemyBat(this.scene, spawnX, batY);
      this.scene.enemies.push(bat);
      this.lastWasBat = true;
      this.lastWasCrate = false;
    } else {
      this._spawnGroundEnemy(spawnX, groundY, score);
      this.lastWasCrate = false;
      this.lastWasBat = false;

      if (Math.random() < this.CLUSTER_CHANCE) {
        const gap = Phaser.Math.Between(50, 80);
        this._spawnGroundEnemy(spawnX + gap, groundY, score);
      }
    }

    let interval = this._randomInterval(score);
    if (spawned === 'crate') interval *= 1.2;
    this.timer = Math.max(0.7, interval);
  }
}
