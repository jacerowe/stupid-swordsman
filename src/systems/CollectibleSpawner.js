class CollectibleSpawner {
  constructor(scene) {
    this.scene = scene;
    this.timer = 3.0;
    this.globalCooldown = 0;
    this.X2_CHANCE      = 0.10;
    this.FIREBALL_CHANCE = 0.07;
    this.SHIELD_CHANCE  = 0.09;
    this.COIN_CHANCE    = 0.40;
    this.COINBAG_CHANCE = 0.15;
    this.COINSAFE_CHANCE = 0.015;
  }

  _randomInterval(score) {
    let base, top;
    if (score >= 1500)      { base = 1.5; top = 2.2; }
    else if (score >= 1000) { base = 1.8; top = 2.6; }
    else if (score >= 300)  { base = 2.0; top = 3.0; }
    else                    { base = 2.5; top = 4.0; }
    return base + Math.random() * (top - base);
  }

  _randomHeight() {
    const groundY = this.scene.groundY;
    const r = Math.random();
    if (r < 0.5)      return groundY - 20;
    else if (r < 0.8) return groundY - 60;
    else              return groundY - 155;
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
    const canPowerup = score >= 100;
    const roll = Math.random();

    const totalPowerup = canPowerup ? (this.X2_CHANCE + this.FIREBALL_CHANCE + this.SHIELD_CHANCE) : 0;
    const totalCoins   = this.COIN_CHANCE + this.COINBAG_CHANCE + this.COINSAFE_CHANCE;

    if (canPowerup && roll < totalPowerup) {
      const puY = this._randomHeight();
      if (roll < this.FIREBALL_CHANCE) {
        this.scene.powerups.push(new PowerupFireball(this.scene, spawnX, puY));
      } else if (roll < this.FIREBALL_CHANCE + this.SHIELD_CHANCE) {
        this.scene.powerups.push(new PowerupShield(this.scene, spawnX, puY));
      } else {
        this.scene.powerups.push(new PowerupX2(this.scene, spawnX, puY));
      }
    } else {
      const coinRoll = Math.random();
      const cY = this._randomHeight();
      if (coinRoll < this.COINSAFE_CHANCE) {
        this.scene.coins.push(new CoinSafe(this.scene, spawnX, cY));
      } else if (coinRoll < this.COINSAFE_CHANCE + this.COINBAG_CHANCE) {
        this.scene.coins.push(new CoinBag(this.scene, spawnX, cY));
      } else {
        this.scene.coins.push(new Coin(this.scene, spawnX, cY));
      }
    }

    this.timer = this._randomInterval(score);
  }
}
