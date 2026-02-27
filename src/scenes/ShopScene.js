class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.page = 0;

    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x0a0a1e).setDepth(-10);

    this.titleText = this.add.text(this.W / 2, 28, 'SHOP', {
      fontSize: '36px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffdd44', stroke: '#553300', strokeThickness: 6
    }).setOrigin(0.5).setDepth(10);

    this.coins = this._getCoins();
    this.coinText = this.add.text(this.W / 2, 62, '\uD83D\uDCB0 ' + this.coins + ' coins', {
      fontSize: '18px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffee88', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);

    // Multi-level items. Each level entry: { lv, desc, cost, key }
    // key = localStorage key suffix for that level owned flag
    this.pages = [
      // PAGE 0: Core upgrades (levelled)
      [
        {
          id: 'hearts', icon: '\u2764\uFE0F', label: 'Extra Hearts',
          levels: [
            { lv: 1, desc: '4 HP at start',  cost: 200, key: 'heart_1' },
            { lv: 2, desc: '5 HP at start',  cost: 400, key: 'heart_2' },
            { lv: 3, desc: '6 HP at start',  cost: 600, key: 'heart_3' },
            { lv: 4, desc: '7 HP at start',  cost: 800, key: 'heart_4' },
          ]
        },
        {
          id: 'x2', icon: '\u26A1', label: 'X2 Duration',
          levels: [
            { lv: 1, desc: 'X2 lasts 4s',    cost: 40,  key: 'x2_1' },
            { lv: 2, desc: 'X2 lasts 5s',    cost: 80,  key: 'x2_2' },
            { lv: 3, desc: 'X2 lasts 6s',    cost: 130, key: 'x2_3' },
            { lv: 4, desc: 'X2 lasts 8s',    cost: 200, key: 'x2_4' },
          ]
        },
        {
          id: 'shield', icon: '\uD83D\uDEE1\uFE0F', label: 'Shield Duration',
          levels: [
            { lv: 1, desc: 'Shield: 15s',    cost: 50,  key: 'shield_1' },
            { lv: 2, desc: 'Shield: 20s',    cost: 100, key: 'shield_2' },
            { lv: 3, desc: 'Shield: 30s',    cost: 180, key: 'shield_3' },
          ]
        },
        {
          id: 'bounty', icon: '\uD83D\uDC7E', label: 'Enemy Bounty',
          levels: [
            { lv: 1, desc: '+1 pt per kill', cost: 30,  key: 'bounty_1' },
            { lv: 2, desc: '+3 pt per kill', cost: 70,  key: 'bounty_2' },
            { lv: 3, desc: '+5 pt per kill', cost: 120, key: 'bounty_3' },
            { lv: 4, desc: '+7 pt per kill', cost: 180, key: 'bounty_4' },
          ]
        },
        {
          id: 'magnet', icon: '\uD83E\uDDF2', label: 'Coin Magnet',
          levels: [
            { lv: 1, desc: 'Wider pickup',   cost: 150, key: 'magnet_1' },
          ]
        },
      ],
      // PAGE 1: Skins
      [
        {
          id: 'sword_gold', icon: '\u2694\uFE0F', label: 'Gold Sword',
          levels: [
            { lv: 1, desc: 'Golden blade',   cost: 100, key: 'sword_gold' },
          ]
        },
        {
          id: 'sword_blue', icon: '\uD83D\uDEE1\uFE0F', label: 'Blue Sword',
          levels: [
            { lv: 1, desc: 'Icy blue blade', cost: 80,  key: 'sword_blue' },
          ]
        },
        {
          id: 'hat_red', icon: '\uD83C\uDFAA', label: 'Red Hat',
          levels: [
            { lv: 1, desc: 'Red cap instead of brown', cost: 60, key: 'hat_red' },
          ]
        },
        {
          id: 'hat_blue', icon: '\uD83C\uDFA9', label: 'Wizard Hat',
          levels: [
            { lv: 1, desc: 'Tall blue wizard hat', cost: 90, key: 'hat_blue' },
          ]
        },
      ]
    ];

    this.pageLabels = ['Upgrades', 'Skins'];

    this.itemContainer = this.add.container(0, 0).setDepth(9);
    this._buildPage();

    this.msgText = this.add.text(this.W / 2, this.H - 56, '', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif',
      color: '#88ff88', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(15);

    this._makeButton(100, this.H - 28, 'BACK', 0x333355, 0x4455aa, () => {
      this.scene.start('MainMenuScene');
    });

    this._makeButton(this.W - 100, this.H - 28, 'NEXT PAGE \u25B6', 0x334433, 0x446644, () => {
      this.page = (this.page + 1) % this.pages.length;
      this._buildPage();
    });
  }

  _buildPage() {
    this.itemContainer.removeAll(true);

    const pageTitle = this.add.text(this.W / 2, 88, this.pageLabels[this.page], {
      fontSize: '14px', fontFamily: 'Arial Black, sans-serif',
      color: '#aaddff', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(10);
    this.itemContainer.add(pageTitle);

    const items = this.pages[this.page];
    const colW = this.W / 2 - 8;
    const startY = 112;
    const rowH = 76;

    items.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = col === 0 ? colW / 2 + 4 : colW + colW / 2 + 12;
      const y = startY + row * rowH;

      const ownedLv = this._getLevel(item.id);
      const maxLv = item.levels.length;
      const nextLevel = item.levels[ownedLv]; // undefined if maxed
      const isMaxed = ownedLv >= maxLv;

      const bgColor = isMaxed ? 0x113311 : 0x111133;
      const borderColor = isMaxed ? 0x44cc44 : 0x4466cc;

      const bg = this.add.rectangle(x, y, colW - 10, rowH - 8, bgColor)
        .setDepth(9).setInteractive({ useHandCursor: !isMaxed });
      const border = this.add.rectangle(x, y, colW - 10, rowH - 8)
        .setStrokeStyle(2, borderColor).setDepth(9);

      const nameColor = isMaxed ? '#88ff88' : '#ffffff';
      const lvLabel = maxLv > 1 ? ' Lv' + ownedLv + '/' + maxLv : '';
      const nameText = this.add.text(x - colW / 2 + 14, y - 22, item.icon + ' ' + item.label + lvLabel, {
        fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
        color: nameColor, stroke: '#000000', strokeThickness: 2
      }).setOrigin(0, 0.5).setDepth(10);

      const descStr = isMaxed ? 'MAXED OUT!' : nextLevel.desc;
      const descColor = isMaxed ? '#88ff88' : '#aaaacc';
      const descText = this.add.text(x - colW / 2 + 14, y - 4, descStr, {
        fontSize: '11px', fontFamily: 'Arial, sans-serif', color: descColor
      }).setOrigin(0, 0.5).setDepth(10);

      const costStr = isMaxed ? '' : '\uD83D\uDCB0 ' + nextLevel.cost;
      const costText = this.add.text(x + colW / 2 - 12, y + 18, costStr, {
        fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
        color: '#ffee44', stroke: '#000000', strokeThickness: 2
      }).setOrigin(1, 0.5).setDepth(10);

      this.itemContainer.add([bg, border, nameText, descText, costText]);

      if (!isMaxed) {
        bg.on('pointerover', () => bg.setFillStyle(0x222255));
        bg.on('pointerout', () => bg.setFillStyle(bgColor));
        bg.on('pointerdown', () => this._tryBuy(item, nextLevel));
      }
    });
  }

  _tryBuy(item, level) {
    if (this.coins < level.cost) {
      this._showMsg('Not enough coins! Need ' + level.cost, '#ff6666');
      return;
    }
    this.coins -= level.cost;
    localStorage.setItem('ss_coins', String(this.coins));
    localStorage.setItem('ss_lvl_' + item.id, String(this._getLevel(item.id) + 1));
    // Also set legacy key for backward compat with GameScene upgrade checks
    localStorage.setItem('ss_own_' + level.key, '1');
    this.coinText.setText('\uD83D\uDCB0 ' + this.coins + ' coins');
    this._showMsg('Upgraded: ' + item.label + ' Lv' + this._getLevel(item.id) + '!', '#88ff88');
    this._buildPage();
  }

  _getLevel(itemId) {
    return parseInt(localStorage.getItem('ss_lvl_' + itemId) || '0');
  }

  _showMsg(txt, color) {
    this.msgText.setText(txt).setColor(color);
    this.tweens.killTweensOf(this.msgText);
    this.msgText.setAlpha(1);
    this.tweens.add({ targets: this.msgText, alpha: 0, delay: 2000, duration: 400 });
  }

  _getCoins() {
    return parseInt(localStorage.getItem('ss_coins') || '0');
  }

  _makeButton(x, y, label, colorNormal, colorHover, onClick) {
    const bg = this.add.rectangle(x, y, 160, 36, colorNormal)
      .setDepth(10).setInteractive({ useHandCursor: true });
    this.add.rectangle(x, y, 160, 36).setStrokeStyle(2, 0x8899cc).setDepth(10);
    this.add.text(x, y, label, {
      fontSize: '16px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(11);
    bg.on('pointerover', () => bg.setFillStyle(colorHover));
    bg.on('pointerout', () => bg.setFillStyle(colorNormal));
    bg.on('pointerdown', onClick);
  }
}
