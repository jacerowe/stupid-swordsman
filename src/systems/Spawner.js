class Spawner {
  constructor(scene) {
    this.scene = scene;
    this.timer = 1.0;
    this.lastWasCrate = false;
    this.lastWasBat = false;
    this.lastWasArmored = false;
    this.consecutiveArmored = 0;

    this.CRATE_CHANCE = 0.28;
    this.BAT_CHANCE = 0.35;
    this.ARMORED_CHANCE_BASE = 0.30;
    this.CLUSTER_CHANCE = 0.30;
    this.X2_CHANCE = 0.08;
    this.FIREBALL_CHANCE = 0.05;
    this.SHIELD_CHANCE = 0.07;
    this.COIN_CHANCE = 0.15;
    this.COINBAG_CHANCE = 0.07;
    this.COINSAFE_CHANCE = 0.02;
  }

  _randomInterval(score) {
    let base, top;
    if (score >= 1500) { base = 0.4; top = 0.65; }
    else if (score >= 1000) { base = 0.5; top = 0.8; }
    else if (score >= 700)  { base = 0.6; top = 1.0; }
    else if (score >= 300)  { base = 0.75; top = 1.3; }
    else                    { base = 0.9; top = 1.6; }
    return base + Math.random() * (top - base);
  }

  _spawnGroundEnemy(spawnX, groundY, score) {
    const spawnArmored = score >= 700 &&
                         !this.lastWasArmored &&
                         Math.random() < (this.ARMORED_CHANCE_BASE + Math.min(0.3, (score - 700) / 3000)) &&
                         this.consecutiveArmored < 1;
    if (spawnArmored) {
      const enemy = new EnemyArmored(this.scene, spawnX, groundY - 27);
      this.scene.enemies.push(enemy);
      this.consecutiveArmored++;
      this.lastWasArmored = true;
      return true;
    } else {
      const enemy = new EnemyBasic(this.scene, spawnX, groundY - 24);
      this.scene.enemies.push(enemy);
      this.consecutiveArmored = 0;
      this.lastWasArmored = false;
      return false;
    }
  }

  update(time, dt, score, speed) {
    this.timer -= dt;
    if (this.timer > 0) return;

    const W = this.scene.W;
    const groundY = this.scene.groundY;
    const spawnX = W + Phaser.Math.Between(40, 140);

    const canBat = score >= 500;
    const canPowerup = score >= 100;
    const roll = Math.random();

    let spawned = 'enemy';
    const totalPowerup = this.FIREBALL_CHANCE + this.SHIELD_CHANCE + this.X2_CHANCE;
    const totalCoins = this.COIN_CHANCE + this.COINBAG_CHANCE + this.COINSAFE_CHANCE;

    if (canPowerup && roll < totalPowerup) {
      if (roll < this.FIREBALL_CHANCE) spawned = 'fireball';
      else if (roll < this.FIREBALL_CHANCE + this.SHIELD_CHANCE) spawned = 'shield';
      else spawned = 'x2';
    } else if (roll < totalPowerup + totalCoins) {
      const coinRoll = roll - totalPowerup;
      if (coinRoll < this.COINSAFE_CHANCE) spawned = 'coinsafe';
      else if (coinRoll < this.COINSAFE_CHANCE + this.COINBAG_CHANCE) spawned = 'coinbag';
      else spawned = 'coin';
    } else if (!this.lastWasCrate && roll < totalPowerup + totalCoins + this.CRATE_CHANCE) {
      spawned = 'crate';
    } else if (canBat && !this.lastWasBat && roll < totalPowerup + totalCoins + this.CRATE_CHANCE + this.BAT_CHANCE) {
      spawned = 'bat';
    }

    if (spawned === 'coin' || spawned === 'coinbag' || spawned === 'coinsafe') {
      const heightRoll = Math.random();
      let cY;
      if (heightRoll < 0.5) {
        cY = groundY - 16;
      } else if (heightRoll < 0.8) {
        cY = groundY - 55;
      } else {
        cY = groundY - 155;
      }
      if (spawned === 'coinsafe') {
        this.scene.coins.push(new CoinSafe(this.scene, spawnX, cY));
      } else if (spawned === 'coinbag') {
        this.scene.coins.push(new CoinBag(this.scene, spawnX, cY));
      } else {
        this.scene.coins.push(new Coin(this.scene, spawnX, cY));
      }
      this.lastWasCrate = false;
      this.lastWasBat = false;
    } else if (spawned === 'x2' || spawned === 'fireball' || spawned === 'shield') {
      const heightRoll = Math.random();
      let puY;
      if (heightRoll < 0.33) {
        puY = groundY - 16;
      } else if (heightRoll < 0.66) {
        puY = groundY - 50;
      } else {
        puY = groundY - 155;
      }
      if (spawned === 'fireball') {
        this.scene.powerups.push(new PowerupFireball(this.scene, spawnX, puY));
      } else if (spawned === 'shield') {
        this.scene.powerups.push(new PowerupShield(this.scene, spawnX, puY));
      } else {
        this.scene.powerups.push(new PowerupX2(this.scene, spawnX, puY));
      }
      this.lastWasCrate = false;
      this.lastWasBat = false;
    } else if (spawned === 'crate') {
      const crate = new Crate(this.scene, spawnX, groundY - 20);
      this.scene.crates.push(crate);
      this.lastWasCrate = true;
      this.lastWasBat = false;
    } else if (spawned === 'bat') {
      const batY = groundY - 155 - Phaser.Math.Between(0, 20);
      const bat = new EnemyBat(this.scene, spawnX, batY);
      this.scene.enemies.push(bat);
      this.lastWasBat = true;
      this.lastWasCrate = false;
    } else {
      const wasArmored = this._spawnGroundEnemy(spawnX, groundY, score);
      this.lastWasCrate = false;
      this.lastWasBat = false;

      let clusterChance, clusterGapMin, clusterGapMax;
      if (score >= 1500)     { clusterChance = 0.55; clusterGapMin = 55; clusterGapMax = 90; }
      else if (score >= 1000){ clusterChance = 0.45; clusterGapMin = 60; clusterGapMax = 100; }
      else if (score >= 700) { clusterChance = 0.20; clusterGapMin = 80; clusterGapMax = 120; }
      else                   { clusterChance = this.CLUSTER_CHANCE; clusterGapMin = 50; clusterGapMax = 80; }
      if (!wasArmored && Math.random() < clusterChance) {
        const gap = Phaser.Math.Between(clusterGapMin, clusterGapMax);
        this._spawnGroundEnemy(spawnX + gap, groundY, score);
        if (score >= 1000 && Math.random() < 0.3) {
          this._spawnGroundEnemy(spawnX + gap * 2, groundY, score);
        }
      }
    }

    let interval = this._randomInterval(score);
    if (spawned === 'crate') interval *= 1.1;
    if (this.lastWasArmored) interval *= (score >= 1000 ? 1.2 : 1.5);
    const minInterval = score >= 1500 ? 0.35 : score >= 1000 ? 0.45 : 0.55;
    this.timer = Math.max(minInterval, interval);
  }
}
