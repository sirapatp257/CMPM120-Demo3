class Intro extends Phaser.Scene {
   preload() {
      this.load.path = "../assets/";
      this.load.spritesheet("sharkman", "textures/Sharkman.png", { frameWidth: 120, frameHeight: 120 });
      this.load.image("ground", "textures/Ground.png");
      this.load.image("underground", "textures/Underground.png");
      this.load.image("platform", "textures/Platform.png");
      this.load.image("boots", "textures/Boots.png");
      this.load.image("weapon", "textures/Weapon.png");
      this.load.image("exit", "textures/ExitSign.png");
      this.load.json("levelData", "miscellaneous/levels.json");
   }

   create() {
      this.input.keyboard.on('keydown', () => {
         this.cameras.main.fadeOut(1000, 0, 0, 0, (c, t) => {
            if (t >= 1) this.scene.start('lvl1');
         });
      });

      this.add.text(960, 270, "A keyboard is required for this game.\n\nAre you ready?")
            .setFontSize(60)
            .setAlign('center')
            .setOrigin(0.5, 0)
            .setWordWrapWidth(800);
        
      let bottomLine = this.add.text(960, 840, "Press any key to begin.")
         .setFontSize(40)
         .setAlign('center')
         .setOrigin(0.5, 0);
      
      this.tweens.add({
         targets: bottomLine,
         alpha: 0.1,
         yoyo: true,
         duration: 1200,
         repeat: -1
      });
   }
}

class Level1 extends Level {
   constructor() {
      super(1);
   }
}

class Level1Summary extends LevelSummary {
   constructor() {
      super(1);
   }
}

class Level2 extends Level {
   constructor() {
      super(2);
   }
}

class Level2Summary extends LevelSummary {
   constructor() {
      super(2);
   }
}
