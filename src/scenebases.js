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
      this.chargeTime = 0;

      let levelData = this.cache.json.get('levelData')[this.level];
      this.spawnPoint = levelData.spawn;

      let instruction = this.add.text(960, 200, levelData.tutorialText).setOrigin(0.5)
         .setFontSize(40)
         .setWordWrapWidth(1000);

      this.tweens.add({
         targets: instruction,
         alpha: {start: 0.25, to: 1},
         yoyo: true,
         duration: 1000,
         repeat: 3,
         onComplete: () => instruction.setAlpha(0)
      });

      this.cameras.main.fadeIn();

      let leftInvisWall = this.physics.add.body(0, 0, 2, 1080).setImmovable(true);
      let rightInvisWall = this.physics.add.body(1920, 0, 2, 1080).setImmovable(true);

      this.playerChar = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'sharkman')
         .setOrigin(0.5)
         .setSize(60, 120)
         .setScale(2)
         .setGravityY(400)
         .setCollideWorldBounds(true);
      this.playerChar.depth = 1;

      this.physics.add.collider(this.playerChar, leftInvisWall);
      this.physics.add.collider(this.playerChar, rightInvisWall);

      let floorGroup = this.physics.add.staticGroup();

      for (let chunk of levelData.floor) {
         for (let f = chunk.start; f < chunk.start + chunk.count; ++f) {
            floorGroup.create(60 + 120 * f, 900, 'ground').setOrigin(0.5);
            floorGroup.create(60 + 120 * f, 1020, 'underground').setOrigin(0.5);
         }
      }

      this.exit = this.physics.add.sprite(levelData.goal.x, levelData.goal.y, 'exit')
         .setOrigin(0.5)
         .setScale(2)
         .setSize(50, 120); // Hitbox size, not sprite size

      if (levelData.platform) {
         this.platforms = [];
         this.platformSpeeds = [];
         this.platformBounds = [];
         this.platformsActive = [];
         this.platformCollisions = [];
         let count = 0;
         for (let platform of levelData.platform) {
            let platformObj = this.physics.add.image(platform.x, platform.y, 'platform')
               .setOrigin(0.5, 0)
               .setImmovable(true);
            this.platforms[count] = platformObj;
            this.platformSpeeds[count] = platform.speed ? platform.speed : 0;
            this.platformBounds[count] = {"x" : platform.x, "y" : platform.y, "x2" : platform.x2, "y2" : platform.y2};
            this.platformCollisions[count] = this.physics.add.collider(this.playerChar, platformObj);

            this.platformsActive[count] = platform.inactive ? false : true;
            platformObj.setVisible(this.platformsActive[count]);
            ++count;
         }
      }

      if (levelData.collectible) {
         let collectible = this.physics.add.sprite(levelData.collectible.x, levelData.collectible.y, levelData.collectible.imgKey)
            .setOrigin(0.5)
            .setSize(100, 100);
         collectible.depth = 2;

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
            this.enableExit();
         });
      }
      
      if (levelData.target) {
         this.target = this.physics.add.sprite(levelData.target.x, levelData.target.y, levelData.target.imgKey, levelData.target.initialState)
            .setOrigin(0.5);

         this.targetCharge = 0;
      }

      this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.jump = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.drop = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.charge = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
      
      // Multiplier number tweens to help create flashing effects
      this.flashTweens = [];
      this.flashTweens[0] = this.tweens.addCounter({
         duration: 750,
         yoyo: true,
         repeat: -1,
         paused: true
      });
      this.flashTweens[1] = this.tweens.addCounter({
         duration: 200,
         yoyo: true,
         repeat: -1,
         paused: true
      });
      this.flashTweens[2] = this.tweens.addCounter({
         duration: 100,
         yoyo: true,
         repeat: -1,
         paused: true
      });

      this.chargeParticles = this.add.particles(0, 0, 'bullet', {
         scale: {start: 1.25, end: 0},
         speedY: -180,
         lifespan: 800,
         frequency: 150,
         depth: 6,
         emitting: false
      });
      this.chargeParticles.depth = 3;
      console.log(this.chargeParticles);

      this.physics.add.overlap(this.playerChar, this.exit, () => {
         if (this.objectiveComplete) this.exitReached = true
      });
      this.physics.add.collider(this.playerChar, floorGroup);
      this.stopwatch = 0;
   }

   update(t, dt) {
      if (this.objectiveComplete) {
         let progress = this.flashTweens[0].getValue();
         let intensity = 255 * progress;
         let color = Phaser.Display.Color.GetColor(intensity, intensity, intensity);
         this.exit.setTint(color);
      }

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
         this.playerChar.setVelocityX(-240);
      }
      else if (this.right.isDown) {
         this.playerChar.anims.play('move', true);
         
         this.playerChar.setFlipX(false);
         this.playerChar.setVelocityX(240);
      }
      else {
         this.playerChar.anims.play('idle', true);
         this.playerChar.setVelocityX(0);
      }

      if (this.playerChar.body.velocity.y < 0) this.playerChar.anims.play('jump', true);
      else if (this.playerChar.body.velocity.y > 0) this.playerChar.anims.play('fall', true);

      this.stopwatch += dt;

      if (this.level == 1) return;

      for (let p = 0; p < this.platforms.length; ++p) {
         let playerAbove = this.playerChar.body.bottom <= this.platforms[p].body.top;
         this.platformCollisions[p].active = (this.platformsActive[p] && playerAbove && !this.drop.isDown);

         if (this.platforms[p].x <= this.platformBounds[p].x) this.platforms[p].setVelocityX(this.platformSpeeds[p]);
         else if (this.platforms[p].x >= this.platformBounds[p].x2) this.platforms[p].setVelocityX(-this.platformSpeeds[p]);
      }

      this.playerChar.setCollideWorldBounds(this.playerChar.body.onFloor() && this.playerChar.body.touching.down);

      if (this.playerChar.body.touching.down && this.jump.isDown) this.playerChar.setVelocityY(-500);
      
      if (this.playerChar.body.y >= 1200) this.playerChar.setX(this.spawnPoint.x).setY(this.spawnPoint.y);

      if (this.level == 2) return;

      if (this.charge.isDown) {
         this.chargeTime += dt;

         if (this.chargeTime >= 1200) {
            if (this.flashTweens[2].isPaused()) this.flashTweens[2].restart();
            let progress = this.flashTweens[1].getValue();
            
            let r = 255;
            let g = 255 - progress * (255 - 218);
            let b = 255 - progress * (255 - 84);
            let tint = Phaser.Display.Color.GetColor(r, g, b);
            
            this.playerChar.setTint(tint);
            this.chargeParticles.setParticleTint(tint);
         }
         else if (this.chargeTime >= 500) {
            if (this.flashTweens[1].isPaused()) this.flashTweens[1].restart();
            let progress = this.flashTweens[1].getValue();
            
            let r = 255 - progress * (255 - 84);
            let g = 255;
            let b = 255 - progress * (255 - 147);
            let tint = Phaser.Display.Color.GetColor(r, g, b);
            
            this.playerChar.setTint(tint);
            this.chargeParticles.setParticleTint(tint);
         }

         let xOffset = -80 + Math.random() * 160;
         let yOffset = 40 + Math.random() * 40;
         this.chargeParticles.startFollow(this.playerChar, xOffset, yOffset);
         this.chargeParticles.emitting = true;
      }
      else if (this.chargeTime > 0) {
         this.launchProjectile();
         for (let t = 1; t < 3; ++t) this.flashTweens[t].pause();
         this.chargeParticles.emitting = false;
         this.chargeParticles.setParticleTint(0xffffff);
         this.playerChar.clearTint();
      }
   }

   launchProjectile() {
      let chargeLevel = 0;
      if (this.chargeTime >= 1200) chargeLevel = 2;
      else if (this.chargeTime >= 500) chargeLevel = 1;

      let dir = this.playerChar.flipX ? -1 : 1;
      let xPos = this.playerChar.x + dir * 90;
      let yPos = this.playerChar.y - 30;
      
      let colliderSize;
      switch (chargeLevel) {
         case 0: colliderSize = 25; break;
         case 1: colliderSize = 60; break;
         case 2: colliderSize = 100; break;
      }

      let tint = 0xffffff;
      if (chargeLevel == 1) tint = Phaser.Display.Color.GetColor(84, 255, 147);
      else if (chargeLevel == 2) tint = Phaser.Display.Color.GetColor(255, 218, 84);

      let ball = this.physics.add.image(xPos, yPos, 'bullet', chargeLevel).setSize(colliderSize, colliderSize).setTint(tint);
      let speed = 270 + chargeLevel * 120;
      ball.setVelocityX(speed * dir);
      
      // Probably not the best way to do collision detection,
      // but this is good enough for the specific case of my D3.
      this.physics.add.overlap(ball, this.target, () => {
         ball.destroy();

         let effectMagnitude = 1;
         switch (chargeLevel) {
            case 1: effectMagnitude = 3; break;
            case 2: effectMagnitude = 5; break;
         }

         if (this.targetCharge < 5) {
            this.targetCharge += effectMagnitude;
            this.target.setFrame(Math.min(this.targetCharge, 5));
            if (this.targetCharge >= 5) {
               this.enableExit();
               this.platforms[0].setVisible(true);
               this.tweens.add({
                  targets: this.platforms[0],
                  alpha: {start: 0, to: 1},
                  duration: 600,
                  onComplete: () => { this.platformsActive[0] = true }
               });
            }
         }
      });
      this.chargeTime = 0;
   }

   enableExit() {
      this.objectiveComplete = true;
      this.flashTweens[0].play();
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

      this.add.text(960, 120, `Level ${this.level} Cleared`)
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

         this.time.delayedCall(1500, () => {
            this.input.keyboard.on('keydown', () => {
               this.cameras.main.fadeOut(1000, 0, 0, 0, (c, t) => {
                  if (t >= 1) this.scene.start(`lvl${this.level + 1}`, {"totalTime" : this.totalTime});
               });
            });
         });
      }
      else {
         let tCentiseconds = (Math.floor(this.totalTime / 10) % 100).toString().padStart(2, "0");
         let tSeconds = (Math.floor(this.totalTime / 1000) % 60).toString().padStart(2, "0");
         let tMinutes = Math.floor(this.totalTime / 60000);

         this.add.text(960, 540, `Total time: ${tMinutes}:${tSeconds}'${tCentiseconds}"`)
            .setFontSize(50)
            .setAlign('center')
            .setOrigin(0.5);

         let bottomLine = this.add.text(960, 720, "Press left or right arrow key to select, then press enter/return to confirm.")
            .setFontSize(40)
            .setAlign('center')
            .setWordWrapWidth(1000)
            .setOrigin(0.5, 0);

         let quitBacking = this.add.rectangle(0, 0, 360, 90, 0xffffff)
         let quitButton = this.add.container().setPosition(600, 900)
            .add(quitBacking)
            .add(this.add.text(0, 0, "Quit").setOrigin(0.5).setFontSize(45).setColor("0"));

         let reBacking = this.add.rectangle(0, 0, 360, 90, 0xffffff)
         let reButton = this.add.container().setPosition(1320, 900)
            .add(reBacking)
            .add(this.add.text(0, 0, "Restart").setOrigin(0.5).setFontSize(45).setColor("0"));

         this.option = 0;

         this.input.keyboard.on('keydown-LEFT', () => {
            quitBacking.setFillStyle(0x00bb99);
            reBacking.setFillStyle(0xffffff);
            this.option = 1;
         });

         this.input.keyboard.on('keydown-RIGHT', () => {
            quitBacking.setFillStyle(0xffffff);
            reBacking.setFillStyle(0x00bb99);
            this.option = 2;
         });

         this.input.keyboard.on('keydown-ENTER', () => {
            if (this.option == 0) return;
            this.cameras.main.fadeOut(1000, 0, 0, 0, (c, t) => {
               if (t >= 1){
                  let target;
                  switch(this.option) {
                     case 1: target = 'start'; break;
                     case 2: target = 'lvl1'; break;
                     default: console.log("Ruh roh, Raggy");
                  }
                  this.scene.start(target);
               }
            });
         });
      }
   }
}