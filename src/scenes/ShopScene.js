class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.page = 0;

    this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x0a0a1e).setDepth(-10);

    this.add.text(this.W / 2, 22, 'SHOP', {
      fontSize: '32px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffdd44', stroke: '#553300', strokeThickness: 6
    }).setOrigin(0.5).setDepth(10);

    this.coins = this._getCoins();
    this.coinText = this.add.text(this.W / 2, 52, '\uD83D\uDCB0 ' + this.coins + ' coins', {
      fontSize: '16px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffee88', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);

    this.pages = [
      // PAGE 0: Core upgrades (levelled)
      {
        label: 'Upgrades',
        type: 'upgrade',
        items: [
          {
            id: 'hearts', icon: '\u2764', label: 'Extra Hearts',
            levels: [
              { desc: '4 HP at start',  cost: 200 },
              { desc: '5 HP at start',  cost: 400 },
              { desc: '6 HP at start',  cost: 600 },
              { desc: '7 HP at start',  cost: 800 },
            ]
          },
          {
            id: 'x2', icon: '\u26A1', label: 'X2 Duration',
            levels: [
              { desc: 'X2 lasts 4s',   cost: 40  },
              { desc: 'X2 lasts 5s',   cost: 80  },
              { desc: 'X2 lasts 6s',   cost: 130 },
              { desc: 'X2 lasts 8s',   cost: 200 },
            ]
          },
          {
            id: 'shield', icon: '\uD83D\uDEE1', label: 'Shield Dur.',
            levels: [
              { desc: 'Shield: 15s',   cost: 50  },
              { desc: 'Shield: 20s',   cost: 100 },
              { desc: 'Shield: 30s',   cost: 180 },
            ]
          },
          {
            id: 'bounty', icon: '\uD83D\uDC7E', label: 'Bounty',
            levels: [
              { desc: '+1 pt/kill',    cost: 30  },
              { desc: '+3 pt/kill',    cost: 70  },
              { desc: '+5 pt/kill',    cost: 120 },
              { desc: '+7 pt/kill',    cost: 180 },
            ]
          },
          {
            id: 'magnet', icon: '\uD83E\uDDF2', label: 'Coin Magnet',
            levels: [
              { desc: 'Wider pickup',  cost: 150 },
            ]
          },
          {
            id: 'bandage', icon: '+', label: 'Double Heal',
            levels: [
              { desc: 'Bandage heals 2 HP', cost: 1000 },
            ]
          },
        ]
      },
      // PAGE 1: Skins (buy + equip)
      {
        label: 'Skins',
        type: 'skin',
        groups: [
          {
            label: 'Sword',
            equipKey: 'equip_sword',
            defaultVal: 'default',
            skins: [
              { id: 'sword_default', label: 'Default',   cost: 0,   key: 'sword_default', desc: 'Silver blade' },
              { id: 'sword_gold',    label: 'Gold',      cost: 100, key: 'sword_gold',    desc: 'Golden blade' },
              { id: 'sword_blue',    label: 'Blue',      cost: 80,  key: 'sword_blue',    desc: 'Icy blue blade' },
            ]
          },
          {
            label: 'Hat',
            equipKey: 'equip_hat',
            defaultVal: 'default',
            skins: [
              { id: 'hat_default',   label: 'Default',   cost: 0,   key: 'hat_default',   desc: 'Brown cap' },
              { id: 'hat_red',       label: 'Red Cap',   cost: 60,  key: 'hat_red',        desc: 'Red triangular cap' },
              { id: 'hat_blue',      label: 'Wizard',    cost: 90,  key: 'hat_blue',       desc: 'Tall blue wizard hat' },
            ]
          }
        ]
      }
    ];

    this.itemContainer = this.add.container(0, 0).setDepth(9);

    this.msgText = this.add.text(this.W / 2, this.H - 54, '', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif',
      color: '#88ff88', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(15);

    // Page indicator text (centered between buttons)
    this.pageIndicator = this.add.text(this.W / 2, this.H - 28, '', {
      fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
      color: '#aaddff', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(15);

    this._makeButton(80, this.H - 28, 'BACK', 0x333355, 0x4455aa, () => {
      this.scene.start('MainMenuScene');
    });

    this._makeButton(this.W - 80, this.H - 28, 'NEXT \u25B6', 0x334433, 0x446644, () => {
      this.page = (this.page + 1) % this.pages.length;
      this._buildPage();
    });

    this._buildPage();
  }

  _buildPage() {
    this.itemContainer.removeAll(true);
    const pg = this.pages[this.page];
    this.pageIndicator.setText('Page ' + (this.page + 1) + ' / ' + this.pages.length + '  \u2014  ' + pg.label);

    if (pg.type === 'upgrade') {
      this._buildUpgradePage(pg.items);
    } else {
      this._buildSkinPage(pg.groups);
    }
  }

  _buildUpgradePage(items) {
    const colW = this.W / 2 - 8;
    const startY = 78;
    const rowH = 72;

    items.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = col === 0 ? colW / 2 + 4 : colW + colW / 2 + 12;
      const y = startY + row * rowH;

      const ownedLv = this._getLevel(item.id);
      const maxLv = item.levels.length;
      const nextLevel = item.levels[ownedLv];
      const isMaxed = ownedLv >= maxLv;

      const bgColor = isMaxed ? 0x0d2b0d : 0x0d0d2b;
      const borderColor = isMaxed ? 0x44cc44 : 0x3355bb;

      const bg = this.add.rectangle(x, y, colW - 10, rowH - 6, bgColor)
        .setDepth(9).setInteractive({ useHandCursor: !isMaxed });
      const border = this.add.rectangle(x, y, colW - 10, rowH - 6)
        .setStrokeStyle(2, borderColor).setDepth(9);

      const lvLabel = maxLv > 1 ? ' Lv' + ownedLv + '/' + maxLv : '';
      const nameText = this.add.text(x - colW / 2 + 10, y - 20, item.icon + ' ' + item.label + lvLabel, {
        fontSize: '12px', fontFamily: 'Arial Black, sans-serif',
        color: isMaxed ? '#88ff88' : '#ffffff', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0, 0.5).setDepth(10);

      const descStr = isMaxed ? 'MAXED OUT!' : nextLevel.desc;
      const descText = this.add.text(x - colW / 2 + 10, y - 2, descStr, {
        fontSize: '10px', fontFamily: 'Arial, sans-serif',
        color: isMaxed ? '#88ff88' : '#9999bb'
      }).setOrigin(0, 0.5).setDepth(10);

      const costStr = isMaxed ? '' : '\uD83D\uDCB0 ' + nextLevel.cost;
      const costText = this.add.text(x + colW / 2 - 10, y + 18, costStr, {
        fontSize: '12px', fontFamily: 'Arial Black, sans-serif',
        color: '#ffee44', stroke: '#000000', strokeThickness: 2
      }).setOrigin(1, 0.5).setDepth(10);

      this.itemContainer.add([bg, border, nameText, descText, costText]);

      if (!isMaxed) {
        bg.on('pointerover', () => bg.setFillStyle(0x1a1a44));
        bg.on('pointerout', () => bg.setFillStyle(bgColor));
        bg.on('pointerdown', () => this._tryBuyUpgrade(item, nextLevel));
      }
    });
  }

  _buildSkinPage(groups) {
    const colW = this.W / 2 - 8;
    let globalIdx = 0;

    groups.forEach((group, gi) => {
      const equipped = localStorage.getItem('ss_' + group.equipKey) || group.defaultVal;

      // Group label
      const gLabelX = gi === 0 ? colW / 2 + 4 : colW + colW / 2 + 12;
      const gLabel = this.add.text(gLabelX, 78, group.label, {
        fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
        color: '#ffdd88', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(10);
      this.itemContainer.add(gLabel);

      group.skins.forEach((skin, si) => {
        const x = gi === 0 ? colW / 2 + 4 : colW + colW / 2 + 12;
        const y = 100 + si * 88;

        const owned = skin.cost === 0 || localStorage.getItem('ss_own_' + skin.key) === '1';
        const isEquipped = equipped === skin.id;

        const bgColor = isEquipped ? 0x112211 : (owned ? 0x111133 : 0x1a0a0a);
        const borderColor = isEquipped ? 0x44ff44 : (owned ? 0x4466cc : 0x553333);

        const bg = this.add.rectangle(x, y, colW - 10, 78, bgColor)
          .setDepth(9).setInteractive({ useHandCursor: true });
        const border = this.add.rectangle(x, y, colW - 10, 78)
          .setStrokeStyle(2, borderColor).setDepth(9);

        const nameText = this.add.text(x - colW / 2 + 10, y - 26, skin.label, {
          fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
          color: isEquipped ? '#44ff44' : (owned ? '#ffffff' : '#886666'),
          stroke: '#000000', strokeThickness: 2
        }).setOrigin(0, 0.5).setDepth(10);

        const descText = this.add.text(x - colW / 2 + 10, y - 8, skin.desc, {
          fontSize: '10px', fontFamily: 'Arial, sans-serif',
          color: '#9999bb'
        }).setOrigin(0, 0.5).setDepth(10);

        let actionText;
        if (!owned) {
          actionText = this.add.text(x, y + 18, '\uD83D\uDCB0 ' + skin.cost + '  BUY', {
            fontSize: '12px', fontFamily: 'Arial Black, sans-serif',
            color: '#ffee44', stroke: '#000000', strokeThickness: 2
          }).setOrigin(0.5).setDepth(10);
          bg.on('pointerover', () => bg.setFillStyle(0x331111));
          bg.on('pointerout', () => bg.setFillStyle(bgColor));
          bg.on('pointerdown', () => this._tryBuySkin(skin, group));
        } else if (!isEquipped) {
          actionText = this.add.text(x, y + 18, 'EQUIP', {
            fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
            color: '#88ddff', stroke: '#000000', strokeThickness: 2
          }).setOrigin(0.5).setDepth(10);
          bg.on('pointerover', () => bg.setFillStyle(0x112233));
          bg.on('pointerout', () => bg.setFillStyle(bgColor));
          bg.on('pointerdown', () => this._equipSkin(skin, group));
        } else {
          actionText = this.add.text(x, y + 18, '\u2713 EQUIPPED', {
            fontSize: '13px', fontFamily: 'Arial Black, sans-serif',
            color: '#44ff44', stroke: '#000000', strokeThickness: 2
          }).setOrigin(0.5).setDepth(10);
        }

        this.itemContainer.add([bg, border, nameText, descText, actionText]);
      });
    });
  }

  _tryBuyUpgrade(item, level) {
    if (this.coins < level.cost) {
      this._showMsg('Need ' + level.cost + ' coins!', '#ff6666');
      return;
    }
    this.coins -= level.cost;
    localStorage.setItem('ss_coins', String(this.coins));
    localStorage.setItem('ss_lvl_' + item.id, String(this._getLevel(item.id) + 1));
    this.coinText.setText('\uD83D\uDCB0 ' + this.coins + ' coins');
    this._showMsg('Upgraded: ' + item.label + ' Lv' + this._getLevel(item.id) + '!', '#88ff88');
    this._buildPage();
  }

  _tryBuySkin(skin, group) {
    if (this.coins < skin.cost) {
      this._showMsg('Need ' + skin.cost + ' coins!', '#ff6666');
      return;
    }
    this.coins -= skin.cost;
    localStorage.setItem('ss_coins', String(this.coins));
    localStorage.setItem('ss_own_' + skin.key, '1');
    // Auto-equip on purchase
    localStorage.setItem('ss_' + group.equipKey, skin.id);
    this.coinText.setText('\uD83D\uDCB0 ' + this.coins + ' coins');
    this._showMsg('Bought & equipped: ' + skin.label + '!', '#88ff88');
    this._buildPage();
  }

  _equipSkin(skin, group) {
    localStorage.setItem('ss_' + group.equipKey, skin.id);
    this._showMsg('Equipped: ' + skin.label + '!', '#88ddff');
    this._buildPage();
  }

  _getLevel(itemId) {
    return parseInt(localStorage.getItem('ss_lvl_' + itemId) || '0');
  }

  _showMsg(txt, color) {
    this.msgText.setText(txt).setColor(color);
    this.tweens.killTweensOf(this.msgText);
    this.msgText.setAlpha(1);
    this.tweens.add({ targets: this.msgText, alpha: 0, delay: 2200, duration: 400 });
  }

  _getCoins() {
    return parseInt(localStorage.getItem('ss_coins') || '0');
  }

  _makeButton(x, y, label, colorNormal, colorHover, onClick) {
    const bg = this.add.rectangle(x, y, 140, 34, colorNormal)
      .setDepth(10).setInteractive({ useHandCursor: true });
    this.add.rectangle(x, y, 140, 34).setStrokeStyle(2, 0x8899cc).setDepth(10);
    this.add.text(x, y, label, {
      fontSize: '15px', fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(11);
    bg.on('pointerover', () => bg.setFillStyle(colorHover));
    bg.on('pointerout', () => bg.setFillStyle(colorNormal));
    bg.on('pointerdown', onClick);
  }
}
