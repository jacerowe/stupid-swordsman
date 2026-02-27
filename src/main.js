const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false
    }
  },
  scene: [MainMenuScene, GameScene, UIScene, ShopScene]
};

const game = new Phaser.Game(config);
