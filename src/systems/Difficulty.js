class Difficulty {
  constructor(scene) {
    this.scene = scene;
    this.speed = 300;
    this.milestone300 = false;
    this.milestone500 = false;
    this.milestone700 = false;
    this.milestone1000 = false;
    this.milestone1500 = false;
  }

  update(score) {
    if (!this.milestone300 && score >= 300) {
      this.milestone300 = true;
      this.speed = 380;
      this._showMilestone('Faster!', 0xffdd44);
    }
    if (!this.milestone500 && score >= 500) {
      this.milestone500 = true;
      this.speed = 450;
      this._showMilestone('Bats!', 0xaa44ff);
    }
    if (!this.milestone700 && score >= 700) {
      this.milestone700 = true;
      this.speed = 520;
      this._showMilestone('Armored Enemies!', 0xff4444);
    }
    if (!this.milestone1000 && score >= 1000) {
      this.milestone1000 = true;
      this.speed = 620;
      this._showMilestone('DANGER ZONE!', 0xff2200);
    }
    if (!this.milestone1500 && score >= 1500) {
      this.milestone1500 = true;
      this.speed = 720;
      this._showMilestone('CHAOS!', 0xff0000);
    }
    if (score > 1500) {
      const extra = Math.floor((score - 1500) / 200) * 15;
      this.speed = Math.min(900, 720 + extra);
    }
  }

  getSpeed() {
    return this.speed;
  }

  _showMilestone(text, color) {
    const W = this.scene.W;
    const H = this.scene.H;
    const txt = this.scene.add.text(W / 2, H / 2 - 60, text, {
      fontSize: '28px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#' + color.toString(16).padStart(6, '0'),
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.scene.tweens.add({
      targets: txt,
      alpha: 1,
      y: H / 2 - 80,
      duration: 300,
      yoyo: true,
      hold: 900,
      onComplete: () => txt.destroy()
    });
  }
}
