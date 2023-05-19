# Poom P. - CMPM 120 Demo 3

## Where to Play

Follow [this link](https://sirapatp257.github.io/CMPM120-Demo3/) to access the game.

## Credits

All artwork and sounds are made by me (Sirapat "Poom" Phunjamaneechot).

All artwork was made using Aseprite.

All sound effects were generated using Pure Data. charge1.mp3 and charge2.mp3 were edited with Audacity.

## Requirements Met

* **The game uses both continuous and discrete inputs from the player**
  - **Continuous**:
    - How long has far has the player moved horizontally (i.e. how long did they hold the left or right arrow key)?
    - How long has the charge button (F key) been held?
  - **Discrete**
    - Did the player press the jump button (up arrow key)?
    - Did the player press the drop button (down arrow key)?
    - Has the player released the charge button?

* **The player’s goal can only be achieved indirectly (by allowing the physics engine to move key objects into position/contact)**
  - In levels 1 and 2, the player must first lead the player character toward the collectible item in the level by pressing and holding the left and/or the right arrow key to let the physics engine know to set the player character's velocity accordingly.
  - In level 3, the player must hold and release the F key to generate a projectile to hit the target object, possibly multiple times, to activate a platform that allows the player to reach the goal. The player can influence the spawning conditions of the projectile by how long they hold the F key, and by changing the orientation of the player character by pressing on either the left or right arrow key. After the projectile is spawned, it is controlled solely by the physics engine.
  - In all levels, after the first objective has been met (i.e. collecting the collectible or hitting the target a sufficient number of times), the player must lead the player character towards the goal object by pressing on the arrow keys. The physics engine dictates the player character's response to the player's input.

* **3+ physics-based gameplay scenes (possibly implemented with a single Phaser Scene subclass):**
  - All scenes based on the `Level` class (i.e. `Level1`, `Level2`, and `Level3`).

* **Other scenes are used to separate and contextualize the gameplay scenes**:
  - All scenes based on the `LevelSummary` class (i.e. `Level1Summary`, `Level2Summary`, and `Level3Summary`).
  - `Level1Summary` and `Level2Summary` tell the player how much time was spent in the preceding level, and what new ability the player character unlocks for the level to follow.
  - `Level3Summary` serves as the ending point. It tells the player both how much time they spent in the last level, as well as how much time they spent in total amongst all levels.
