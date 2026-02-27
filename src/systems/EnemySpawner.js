class EnemySpawner {
  constructor(scene) {
    this.scene = scene;
    this.timer = 1.2;
    this.globalCooldown = 0;
    this.lastWasArmored = false;
    this.lastWasBat = false;
    this.consecutiveArmored = 0;
    this.ARMORED_CHANCE_BASE = 0.30;
    this.CLUSTER_CHANCE = 0.30;
  }

  _randomInterval(score) {
    let base, top;
    if (score >= 1500)      { base = 0.45; top = 0.7; }
    else if (score >= 1000) { base = 0.55; top = 0.85; }
    else if (score >= 700)  { base = 0.65; top = 1.0; }
    else if (score >= 300)  { base = 0.8;  top = 1.2; }
    else                    { base = 1.0;  top = 1.6; }
    return base + Math.random() * (top - base);
  }

  _spawnGroundEnemy(spawnX, groundY, score) {
    const spawnArmored = score >= 700 &&
                         !this.lastWasArmored &&
                         Math.random() < (this.ARMORED_CHANCE_BASE + Math.min(0.3, (score - 700) / 3000)) &&
                         this.consecutiveArmored < 1;
    if (spawnArmored) {
      this.scene.enemies.push(new EnemyArmored(this.scene, spawnX, this.scene.groundY - 27));
      this.consecutiveArmored++;
      this.lastWasArmored = true;
      this.scene.crateSpawner.triggerGlobalCooldown();
      this.scene.collectibleSpawner.triggerGlobalCooldown();
      return true;
    } else {
      this.scene.enemies.push(new EnemyBasic(this.scene, spawnX, this.scene.groundY - 24));
      this.consecutiveArmored = 0;
      this.lastWasArmored = false;
      return false;
    }
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
    const groundY = this.scene.groundY;
    const spawnX = W + Phaser.Math.Between(40, 120);
    const canBat = score >= 500;

    if (canBat && !this.lastWasBat && Math.random() < 0.25) {
      const batY = groundY - 155 - Phaser.Math.Between(0, 20);
      this.scene.enemies.push(new EnemyBat(this.scene, spawnX, batY));
      this.lastWasBat = true;
      this.scene.crateSpawner.triggerGlobalCooldown(1.0);
      this.scene.collectibleSpawner.triggerGlobalCooldown(0.5);
    } else {
      this.lastWasBat = false;
      const wasArmored = this._spawnGroundEnemy(spawnX, groundY, score);

      let clusterChance, gapMin, gapMax;
      if (score >= 1500)      { clusterChance = 0.55; gapMin = 55;  gapMax = 90; }
      else if (score >= 1000) { clusterChance = 0.45; gapMin = 60;  gapMax = 100; }
      else if (score >= 700)  { clusterChance = 0.20; gapMin = 80;  gapMax = 120; }
      else                    { clusterChance = this.CLUSTER_CHANCE; gapMin = 50; gapMax = 80; }

      if (!wasArmored && Math.random() < clusterChance) {
        const gap = Phaser.Math.Between(gapMin, gapMax);
        this._spawnGroundEnemy(spawnX + gap, groundY, score);
        if (score >= 1000 && Math.random() < 0.3) {
          this._spawnGroundEnemy(spawnX + gap * 2, groundY, score);
        }
      }
    }

    let interval = this._randomInterval(score);
    if (this.lastWasArmored) interval *= (score >= 1000 ? 1.2 : 1.5);
    const minInterval = score >= 1500 ? 0.35 : score >= 1000 ? 0.45 : 0.5;
    this.timer = Math.max(minInterval, interval);
  }
}
