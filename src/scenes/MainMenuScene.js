class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;

    this._buildBackground();

    this.add.text(this.W / 2, this.H * 0.22, 'STUPID', {
      fontSize: '64px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5).setDepth(10);

    this.add.text(this.W / 2, this.H * 0.22 + 64, 'SWORDSMAN', {
      fontSize: '40px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffdd44', stroke: '#553300', strokeThickness: 6
    }).setOrigin(0.5).setDepth(10);

    const coins = this._getCoins();
    this.coinDisplay = this.add.text(this.W / 2, this.H * 0.22 + 116, '\uD83D\uDCB0 ' + coins + ' coins', {
      fontSize: '20px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffee88', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);

    this._makeButton(this.W / 2, this.H * 0.62, 'PLAY', 0x224488, 0x3366cc, () => {
      this.scene.start('GameScene');
    });

    this._makeButton(this.W / 2, this.H * 0.62 + 70, 'SHOP', 0x334422, 0x557733, () => {
      this.scene.start('ShopScene');
    });

    this.add.text(this.W / 2, this.H - 12, 'SPACE: Jump   LMB: Attack', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif',
      color: '#aaaacc', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5, 1).setDepth(10);
  }

  _getCoins() {
    return parseInt(localStorage.getItem('ss_coins') || '0');
  }

  _makeButton(x, y, label, colorNormal, colorHover, onClick) {
    const bg = this.add.rectangle(x, y, 200, 48, colorNormal)
      .setDepth(10).setInteractive({ useHandCursor: true });
    const border = this.add.rectangle(x, y, 200, 48)
      .setStrokeStyle(2, 0x88aaff).setDepth(10);
    const txt = this.add.text(x, y, label, {
      fontSize: '26px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(11);

    bg.on('pointerover', () => bg.setFillStyle(colorHover));
    bg.on('pointerout', () => bg.setFillStyle(colorNormal));
    bg.on('pointerdown', onClick);
  }

  _buildBackground() {
    const W = this.W, H = this.H;

    this.add.rectangle(W / 2, H * 0.275, W, H * 0.55, 0x0d0d2b).setDepth(-10);
    this.add.rectangle(W / 2, H * 0.725, W, H * 0.45, 0x1a1a3e).setDepth(-10);

    this.add.circle(W * 0.8, H * 0.18, 28, 0xeeeebb).setDepth(-9);

    const starsGfx = this.add.graphics().setDepth(-9);
    starsGfx.fillStyle(0xffffff, 1);
    for (let i = 0; i < 60; i++) {
      starsGfx.fillCircle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(10, H * 0.45),
        Phaser.Math.RND.realInRange(0.5, 2)
      );
    }

    this.add.rectangle(W / 2, H - 28, W, 56, 0x0d1f0d).setDepth(-5);
    this.add.rectangle(W / 2, H - 52, W, 8, 0x1a3a1a).setDepth(-4);
  }
}
