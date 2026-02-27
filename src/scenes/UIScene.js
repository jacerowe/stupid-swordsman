class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;

    this._buildHUD();
    this._buildGameOverPanel();

    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  _buildHUD() {
    const padding = 14;
    const maxHp = parseInt(localStorage.getItem('ss_own_extra_heart') === '1' ? '4' : '3');

    const hudBg = this.add.rectangle(0, 0, 260, 68, 0x000000, 0.45)
      .setOrigin(0, 0)
      .setDepth(15);

    this.heartSprites = [];
    for (let i = 0; i < maxHp; i++) {
      const heartContainer = this.add.container(padding + 16 + i * 34, 20).setDepth(16);

      const heartOuter = this.add.graphics();
      heartOuter.fillStyle(0xff2244, 1);
      this._drawHeart(heartOuter, 0, 0, 12);

      const heartInner = this.add.graphics();
      heartInner.fillStyle(0xff6688, 1);
      this._drawHeart(heartInner, -1, -2, 6);

      heartContainer.add([heartOuter, heartInner]);
      this.heartSprites.push(heartContainer);
    }

    this.moneyText = this.add.text(padding, 46, '💰 0', {
      fontSize: '15px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffee44',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0, 0.5).setDepth(16);

    this.scoreLabel = this.add.text(this.W - padding, padding, '0 m', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(1, 0).setDepth(16);

    const controlsTip = this.add.text(this.W / 2, this.H - 10, 'SPACE: Jump   LMB: Attack', {
      fontSize: '11px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaacc',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 1).setDepth(15);
  }

  _drawHeart(gfx, ox, oy, size) {
    const s = size;
    gfx.beginPath();
    gfx.moveTo(ox, oy + s * 0.3);
    gfx.lineTo(ox - s * 0.5, oy - s * 0.2);
    gfx.arc(ox - s * 0.25, oy - s * 0.5, s * 0.32, Math.PI * 0.75, 0, false);
    gfx.arc(ox + s * 0.25, oy - s * 0.5, s * 0.32, Math.PI, Math.PI * 0.25, false);
    gfx.lineTo(ox, oy + s * 0.3);
    gfx.closePath();
    gfx.fillPath();
  }

  _buildGameOverPanel() {
    this.gameOverGroup = this.add.container(this.W / 2, this.H / 2).setDepth(30).setAlpha(0);

    const panelW = 360, panelH = 270;
    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x000000, 0.85);
    const border = this.add.rectangle(0, 0, panelW, panelH).setStrokeStyle(3, 0xff4444);

    const title = this.add.text(0, -96, 'GAME OVER', {
      fontSize: '42px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.finalScoreText = this.add.text(0, -42, 'Score: 0', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.finalCoinsText = this.add.text(0, -10, '', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffee44',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const restartHint = this.add.text(0, 20, 'Press R to Restart', {
      fontSize: '15px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaacc',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const btnBg = this.add.rectangle(0, 62, 160, 42, 0x224488)
      .setInteractive({ useHandCursor: true });
    const btnBorder = this.add.rectangle(0, 62, 160, 42).setStrokeStyle(2, 0x4488ff);
    const btnText = this.add.text(0, 62, 'Restart', {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    const menuBg = this.add.rectangle(0, 114, 160, 38, 0x333355)
      .setInteractive({ useHandCursor: true });
    const menuBorder = this.add.rectangle(0, 114, 160, 38).setStrokeStyle(2, 0x8899cc);
    const menuText = this.add.text(0, 114, 'Main Menu', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x3366cc));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x224488));
    btnBg.on('pointerdown', () => this._doRestart());

    menuBg.on('pointerover', () => menuBg.setFillStyle(0x4455aa));
    menuBg.on('pointerout', () => menuBg.setFillStyle(0x333355));
    menuBg.on('pointerdown', () => this._doMainMenu());

    this.gameOverGroup.add([bg, border, title, this.finalScoreText, this.finalCoinsText, restartHint, btnBg, btnBorder, btnText, menuBg, menuBorder, menuText]);
  }

  updateHearts(health) {
    for (let i = 0; i < this.heartSprites.length; i++) {
      this.heartSprites[i].setAlpha(i < health ? 1 : 0.2);
    }
  }

  updateMoney(money) {
    if (this.moneyText) this.moneyText.setText('💰 ' + money);
  }

  updateScore(score) {
    if (this.scoreLabel) this.scoreLabel.setText(score + ' m');
  }

  showGameOver(score, coinsEarned) {
    if (this.finalScoreText) this.finalScoreText.setText('Score: ' + score);
    if (this.finalCoinsText) this.finalCoinsText.setText('💰 +' + (coinsEarned || 0) + ' coins earned');
    this.tweens.add({
      targets: this.gameOverGroup,
      alpha: 1,
      duration: 400,
      ease: 'Power2'
    });
  }

  _doRestart() {
    const gameScene = this.scene.get('GameScene');
    if (gameScene) gameScene.restartGame();
  }

  _doMainMenu() {
    const gameScene = this.scene.get('GameScene');
    if (gameScene) {
      gameScene.enemies.forEach(e => e.destroy());
      gameScene.crates.forEach(c => c.destroy());
    }
    this.scene.stop('UIScene');
    this.scene.stop('GameScene');
    this.scene.start('MainMenuScene');
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      const gameScene = this.scene.get('GameScene');
      if (gameScene && gameScene.gameOver) this._doRestart();
    }
  }
}
