class Intro extends Phaser.Scene {
   constructor() {
      super('start');
   }

   preload() {
      this.load.path = "./assets/";
      this.load.spritesheet("sharkman", "images/sharkman.png", { frameWidth: 120, frameHeight: 120 });
      this.load.spritesheet("bullet", "images/energyBall.png", { frameWidth: 120, frameHeight: 120 });
      this.load.spritesheet("target", "images/targetBlock.png", { frameWidth: 120, frameHeight: 120 });
      this.load.image("ground", "images/ground.png");
      this.load.image("underground", "images/underground.png");
      this.load.image("platform", "images/platform.png");
      this.load.image("boots", "images/boots.png");
      this.load.image("weapon", "images/weapon.png");
      this.load.image("exit", "images/exitSign.png");
      this.load.audio("step", "sounds/move.wav");
      this.load.audio("jump", "sounds/jump.wav");
      this.load.audio("charge1", "sounds/charge1.mp3");
      this.load.audio("charge2", "sounds/charge2.mp3");
      this.load.audio("shot", "sounds/shot.wav");
      this.load.audio("absorb", "sounds/absorb.wav");
      this.load.audio("goal", "sounds/goal.wav");
      this.load.audio("pickup", "sounds/pickup.wav");
      this.load.audio("bgm", "sounds/bgm.mp3");
      this.load.json("levelData", "miscellaneous/levels.json");
   }

   create() {
      this.input.keyboard.once('keydown', () => {
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
   create() {
      this.anims.create({
         key: 'idle',
         frames: this.anims.generateFrameNumbers('sharkman', {start: 0, end: 6}),
         frameRate: 20,
         repeat: -1,
         repeatDelay: 1000
      })

      this.anims.create({
         key: 'move',
         frames: this.anims.generateFrameNumbers('sharkman', {start: 7, end: 10}),
         frameRate: 10,
         repeat: -1
      });

      this.anims.create({
         key: 'jump',
         frames: this.anims.generateFrameNumbers('sharkman', {start: 11, end: 11}),
         repeat: -1
      });

      this.anims.create({
         key: 'fall',
         frames: this.anims.generateFrameNumbers('sharkman', {start: 12, end: 12}),
         repeat: -1
      });

      this.sound.add("step", {volume: 0.75, loop: true});
      this.sound.add("jump");
      this.sound.add("charge1", {loop: true});
      this.sound.add("charge2", {loop: true});
      this.sound.add("shot");
      this.sound.add("absorb");
      this.sound.add("goal");
      this.sound.add("pickup");
      this.sound.add("bgm", {loop: true});

      super.create();
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

class Level3 extends Level {
   constructor() {
      super(3);
   }
}

class Level3Summary extends LevelSummary {
   constructor() {
      super(3);
   }
}
