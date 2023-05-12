class Level extends Phaser.Scene {
   init(data) {
      this.totalTime = data.totalTime ? data.totalTime : 0;
   }

   constructor(lvlNumber) {
      super(`lvl${lvlNumber}`);
      this.level = lvlNumber;
   }

   create() {
      this.objectiveComplete = false;
      this.exitReached = false;
      this.fadeOutStarted = false;

      let levelData = this.cache.json.get('levelData')[this.level];

      this.cameras.main.fadeIn();

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

      let floorGroup = this.physics.add.staticGroup();

      for (let chunk of levelData.floor) {
         for (let f = chunk.start; f < chunk.start + chunk.count; ++f) {
            floorGroup.create(60 + 120 * f, 900, 'ground').setOrigin(0.5);
            floorGroup.create(60 + 120 * f, 1020, 'underground').setOrigin(0.5);
         }
      }

      let exit = this.physics.add.sprite(levelData.goal.x, levelData.goal.y, 'exit')
         .setOrigin(0.5)
         .setScale(2)
         .setSize(50, 120);

      this.playerChar = this.physics.add.sprite(levelData.spawn.x, levelData.spawn.y, 'sharkman')
         .setOrigin(0.5)
         .setSize(60, 120) // Hitbox size, not sprite size
         .setScale(2)
         .setGravityY(400)
         .setCollideWorldBounds(true);
      
      if (levelData.collectible) {
         let collectible = this.physics.add.sprite(levelData.collectible.x, levelData.collectible.y, levelData.collectible.imgKey)
         .setOrigin(0.5)
         .setSize(100, 100);

         this.tweens.add({
            targets: collectible,
            y: '+= 30',
            duration: 800,
            yoyo: true,
            ease: "Sine.inOut",
            repeat: -1
         });

         this.physics.add.overlap(this.playerChar, collectible, () => {
            collectible.destroy();
            this.objectiveComplete = true;
         });
      }

      this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.jump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.drop = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

      this.physics.add.overlap(this.playerChar, exit, () => {
         if (this.objectiveComplete) this.exitReached = true
      });
      this.floorCollision = this.physics.add.collider(this.playerChar, floorGroup);
      this.stopwatch = 0;

      this.input.keyboard.on('keyup-DOWN', () => this.floorCollision.active = true);
   }

   update(t, dt) {
      if (this.exitReached) {
         if (this.fadeOutStarted) return;
         this.fadeOutStarted = true;
         this.cameras.main.fadeOut(600, 0, 0, 0, (c, t) => {
            if (t >= 1) this.scene.start(`lvl${this.level}end`, {
               "clearTime" : this.stopwatch,
               "totalTime" : this.totalTime + this.stopwatch
            });
         });
         return;
      }
      if (this.left.isDown) {
         this.playerChar.anims.play('move', true);
         
         this.playerChar.setFlipX(true);
         this.playerChar.setVelocityX(-360);
      }
      else if (this.right.isDown) {
         this.playerChar.anims.play('move', true);
         
         this.playerChar.setFlipX(false);
         this.playerChar.setVelocityX(360);
      }
      else {
         this.playerChar.anims.play('idle', true);
         this.playerChar.setVelocityX(0);
      }

      if (this.playerChar.body.velocity.y < 0) this.playerChar.anims.play('jump', true);
      else if (this.playerChar.body.velocity.y > 0) this.playerChar.anims.play('fall', true);

      this.stopwatch += dt;

      if (this.level == 1) return;

      if (this.playerChar.body.touching.down) {
         this.playerChar.setCollideWorldBounds(false);

         if (this.jump.isDown) {
            this.playerChar.setVelocityY(-500);
         }
         else if (this.drop.isDown) {
            // TODO: temporarily ignore collision with platforms
            this.floorCollision.active = false;
         }
      }
   }
}

class LevelSummary extends Phaser.Scene {
   constructor(lvlNumber) {
      super(`lvl${lvlNumber}end`);
      this.level = lvlNumber;
   }

   init(data) {
      this.clearTime = data.clearTime;
      this.totalTime = data.totalTime ? data.totalTime : data.clearTime;
   }

   create() {
      this.cameras.main.fadeIn();
      
      let levelData = this.cache.json.get('levelData')[this.level];

      let centiseconds = (Math.floor(this.clearTime / 10) % 100).toString().padStart(2, "0");
      let seconds = (Math.floor(this.clearTime / 1000) % 60).toString().padStart(2, "0");
      let minutes = Math.floor(this.clearTime / 60000);

      this.add.text(960, 120, "Level 1 Cleared")
         .setFontSize(60)
         .setAlign('center')
         .setOrigin(0.5, 0);

      this.add.text(960, 240, `Clear time: ${minutes}:${seconds}'${centiseconds}"`)
         .setFontSize(40)
         .setAlign('center')
         .setOrigin(0.5, 0);

      if (this.level < 3) {
         this.add.text(960, 320, "Item acquired:")
         .setFontSize(40)
         .setAlign('center')
         .setOrigin(0.5, 0);

         this.add.image(960, 540, levelData.collectible.imgKey)
            .setScale(1.25)
            .setOrigin(0.5);

         this.add.text(960, 660, `Sharkman can now ${levelData.nextLevelActions}!`)
            .setFontSize(32)
            .setAlign('center')
            .setOrigin(0.5, 0);

         let bottomLine = this.add.text(960, 840, "Press any key to proceed.")
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
}