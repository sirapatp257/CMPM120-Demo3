let gameConfig = {
   scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1920,
      height: 1080
   },
   physics: {
      default: 'arcade',
      arcade: {
         debug: true
      }
   },
   pixelArt: true,
   backgroundColor: '#031936',
   scene: [Intro, Level1, Level1Summary, Level2, Level2Summary, Level3, Level3Summary],
   title: "CMPM 120 - D3"
};

const game = new Phaser.Game(gameConfig);