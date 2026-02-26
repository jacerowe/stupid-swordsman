class Difficulty {
  constructor(scene) {
    this.scene = scene;
    this.speed = 220;
    this.milestone500 = false;
    this.milestone1000 = false;
  }

  update(score) {
    if (!this.milestone500 && score >= 500) {
      this.milestone500 = true;
      this.speed = 310;
      this._showMilestone('Speed Increase!', 0xffdd44);
    }
    if (!this.milestone1000 && score >= 1000) {
      this.milestone1000 = true;
      this.speed = 380;
      this._showMilestone('Armored Enemies!', 0xff4444);
    }
    if (score > 1000) {
      const extra = Math.floor((score - 1000) / 500) * 12;
      this.speed = Math.min(600, 380 + extra);
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
