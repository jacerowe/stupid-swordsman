class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;

    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x0a0a1e).setDepth(-10);

    this.add.text(this.W / 2, 36, 'SHOP', {
      fontSize: '40px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffdd44', stroke: '#553300', strokeThickness: 6
    }).setOrigin(0.5).setDepth(10);

    this.coins = this._getCoins();
    this.coinText = this.add.text(this.W / 2, 78, '\uD83D\uDCB0 ' + this.coins + ' coins', {
      fontSize: '20px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffee88', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);

    this.items = [
      { id: 'extra_heart',    label: 'Extra Heart',        desc: 'Start with 4 HP',           cost: 200, icon: '\u2764\uFE0F' },
      { id: 'sword_gold',     label: 'Gold Sword',         desc: 'Golden blade - looks sick',  cost: 100, icon: '\u2694\uFE0F' },
      { id: 'x2_longer',      label: 'Longer X2',          desc: 'X2 lasts 6s not 3s',        cost: 50,  icon: '\u26A1' },
      { id: 'shield_longer',  label: 'Longer Shield',      desc: 'Shield lasts 20s not 10s',  cost: 50,  icon: '\uD83D\uDEE1\uFE0F' },
      { id: 'enemy_bounty',   label: 'Enemy Bounty',       desc: '+5 pts per enemy kill',     cost: 100, icon: '\uD83D\uDC7E' },
      { id: 'coin_magnet',    label: 'Coin Magnet',        desc: 'Auto-collect nearby coins', cost: 150, icon: '\uD83E\uDDF2' },
    ];

    this._buildItems();

    this._makeButton(this.W / 2, this.H - 30, 'BACK', 0x333355, 0x4455aa, () => {
      this.scene.start('MainMenuScene');
    });

    this.msgText = this.add.text(this.W / 2, this.H - 62, '', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif',
      color: '#88ff88', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(15);
  }

  _buildItems() {
    const startY = 128;
    const colW = this.W / 2 - 10;
    this.itemRows = [];

    this.items.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = col === 0 ? colW / 2 : colW + colW / 2 + 20;
      const y = startY + row * 88;

      const owned = this._isOwned(item.id);

      const bg = this.add.rectangle(x, y, colW - 20, 72, owned ? 0x113311 : 0x111133)
        .setDepth(9).setInteractive({ useHandCursor: !owned });
      const border = this.add.rectangle(x, y, colW - 20, 72)
        .setStrokeStyle(2, owned ? 0x44cc44 : 0x4466cc).setDepth(9);

      this.add.text(x - colW / 2 + 20, y - 18, item.icon + ' ' + item.label, {
        fontSize: '15px', fontFamily: 'Arial Black, sans-serif',
        color: owned ? '#88ff88' : '#ffffff', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0, 0.5).setDepth(10);

      this.add.text(x - colW / 2 + 20, y + 2, item.desc, {
        fontSize: '12px', fontFamily: 'Arial, sans-serif',
        color: '#aaaacc'
      }).setOrigin(0, 0.5).setDepth(10);

      const costLabel = owned ? 'OWNED' : '\uD83D\uDCB0 ' + item.cost;
      this.add.text(x + colW / 2 - 16, y + 18, costLabel, {
        fontSize: '14px', fontFamily: 'Arial Black, sans-serif',
        color: owned ? '#44cc44' : '#ffee44', stroke: '#000000', strokeThickness: 2
      }).setOrigin(1, 0.5).setDepth(10);

      if (!owned) {
        bg.on('pointerover', () => bg.setFillStyle(0x222255));
        bg.on('pointerout', () => bg.setFillStyle(0x111133));
        bg.on('pointerdown', () => this._tryBuy(item));
      }
    });
  }

  _tryBuy(item) {
    if (this._isOwned(item.id)) return;
    if (this.coins < item.cost) {
      this._showMsg('Not enough coins!', '#ff6666');
      return;
    }
    this.coins -= item.cost;
    localStorage.setItem('ss_coins', String(this.coins));
    this._setOwned(item.id);
    this.coinText.setText('\uD83D\uDCB0 ' + this.coins + ' coins');
    this._showMsg('Purchased: ' + item.label + '!', '#88ff88');
    this.scene.restart();
  }

  _showMsg(txt, color) {
    this.msgText.setText(txt).setColor(color);
    this.tweens.killTweensOf(this.msgText);
    this.msgText.setAlpha(1);
    this.tweens.add({ targets: this.msgText, alpha: 0, delay: 1800, duration: 400 });
  }

  _getCoins() {
    return parseInt(localStorage.getItem('ss_coins') || '0');
  }

  _isOwned(id) {
    return localStorage.getItem('ss_own_' + id) === '1';
  }

  _setOwned(id) {
    localStorage.setItem('ss_own_' + id, '1');
  }

  _makeButton(x, y, label, colorNormal, colorHover, onClick) {
    const bg = this.add.rectangle(x, y, 160, 38, colorNormal)
      .setDepth(10).setInteractive({ useHandCursor: true });
    this.add.rectangle(x, y, 160, 38).setStrokeStyle(2, 0x8899cc).setDepth(10);
    this.add.text(x, y, label, {
      fontSize: '20px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(11);
    bg.on('pointerover', () => bg.setFillStyle(colorHover));
    bg.on('pointerout', () => bg.setFillStyle(colorNormal));
    bg.on('pointerdown', onClick);
  }
}
