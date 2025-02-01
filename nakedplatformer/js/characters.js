"use strict";

let animationTime = 16;

class SpriteAnimator {
    //En array med objekter som inneholder url og antall og type.
    constructor(arr) {
        this.animations = [];
        for (let i = 0; i < arr.length; i++) {
            this.saveAnimation(arr[i].url, arr[i].amount, arr[i].type);
        }
        this.currentAnimation = -1;
    }

    saveAnimation(url, amount, type) {
        let anim = [];
        for (let i = 0; i < amount; i++) {
            let fullUrl = new String(url + i + type);
            let spriteMap = new THREE.TextureLoader().load(fullUrl);
            spriteMap.magFilter = THREE.NearestFilter;
            anim[i] = spriteMap;
        }
        this.animations[this.animations.length] = anim;
    }

    stopAnimation() {
        clearInterval(this.animationInterval);
        this.currentAnimation = -1;
    }

    playAnimationOnMaterial(index, material, fps) {
        this.material = material;
        this.playAnimation(index, fps)
    }

    playAnimation(index, fps){
        //Check
        if (index >= this.animations.length || index < 0) {
            console.error("FAILED TO START ANIMATION BECAUSE INDEX: " + index);
            return;
        }

        //End old animation

        animationTime = fps;

        //Set up
        this.currentAnimation = index;
        this.currentFrame = 0;

        //Start new
        //Start new
        this.animationInterval = () => {

            this.currentTextureMap = this.animations[this.currentAnimation][this.currentFrame];
            this.material.map = this.currentTextureMap;
            this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentAnimation].length;
            setTimeout(this.animationInterval, 1000 / animationTime);
        }
        this.animationInterval();
    }

    setIndexAnim(index, fps) {
        if (index >= this.animations.length || index < 0) {
            console.error("FAILED TO START ANIMATION BECAUSE INDEX: " + index);
            return;
        }

        if (this.currentAnimation === index)
            return;

        animationTime = fps;

        this.currentAnimation = index;
        this.currentFrame = 0;
    }

}

class Character {
    constructor(_sprite, _position, animation, size = new THREE.Vector2(1, 1)) {
        this.spawn = new THREE.Vector2(_position.x, _position.y);
        this.sprite = _sprite;
        this.size = size;
        this.baseScale = size.x;
        this.sprite.scale.set(this.baseScale, size.y);
        this.position = _position;
        this.animation = animation;

        // Add center offset for flipping
        this.sprite.center.set(0.5, 0.5);
        
        this.verticalMovement = {value: 0, max: 1.3, min: -0.15};
        this.fallingCount = 0;
        this.fallingMax = 20;

        this.walkingSpeed = 0;
        this.walkingCount = 0;
        this.walkingMax = 4;
        this.walkingAcceleration = 0.005;

        this.facingRight = true;

        // Set up material properties for flipping
        this.sprite.material.map.repeat.x = 1;
        this.sprite.material.map.offset.x = 0;
        this.sprite.material.needsUpdate = true;
    }

    jump(dt) {
        if (this.fallingCount < this.fallingMax && this.verticalMovement.value < this.verticalMovement.max)
            this.verticalMovement.value += 0.06 / (this.fallingCount + 1) * (dt/16.67);
        this.position.y += this.verticalMovement.value;

        if(this.fallingCount === 0){
            new Sound("res/sounds/ldjamjump.mp3").play();
        }
    }

    stopJumping() {
        this.fallingCount = this.fallingMax;
    }

    fall(dt) {
        if (this.fallingCount < this.fallingMax) {
            this.fallingCount++;
        }

        if (this.verticalMovement.value > this.verticalMovement.min)
            this.verticalMovement.value -= 0.0005 * this.fallingCount * (dt/16.67);
        this.position.y += this.verticalMovement.value;

        // Add death when falling below y = -5
        if (this.position.y < -5) {
            this.die();
            deathCountCount--;
        }
    }

    stopFalling() {
        this.verticalMovement.value = 0;
        this.fallingCount = 0;
    }

    standByOnUnder(tile) {
        // Check for spike collision first
        if (tile.type === 'spike') {
            // Only die if we're actually within the spike's hitbox
            let playerBottom = this.position.y - this.size.y/2;
            let spikeTop = tile.position.y + tile.size.y/2;
            
            if (playerBottom <= spikeTop) {
                this.die();
                return;
            }
        }

        if (tile.interaction !== null) {
            if (tile.interaction())
                return;
        }

        if (this.position.y - tile.position.y > 0) {
            //You're above!
            let feet = new THREE.Vector2(this.position.x, this.position.y - this.size.y / 2);
            let leftCorner = new THREE.Vector2(tile.position.x - tile.size.x / 2, tile.position.y + tile.size.y / 2);
            let rightCorner = new THREE.Vector2(tile.position.x + tile.size.x / 2, tile.position.y + tile.size.y / 2);

            let feetComparedToLeft = (feet.x - tile.position.x) * (leftCorner.y - tile.position.y) - (feet.y - tile.position.y) * (leftCorner.x - tile.position.x);
            let feetComparedToRight = (feet.x - tile.position.x) * (rightCorner.y - tile.position.y) - (feet.y - tile.position.y) * (rightCorner.x - tile.position.x);

            if (Math.abs(feet.y - leftCorner.y) >= 0.05) {
                if (feetComparedToLeft < 0) {
                    this.position.x = tile.position.x - tile.size.x / 2 - this.size.x / 2;
                } else if (feetComparedToRight > 0) {
                    this.position.x = tile.position.x + tile.size.x / 2 + this.size.x / 2;
                } else {
                    this.stopFalling();
                    this.position.y = tile.position.y + tile.size.y / 2 + this.size.y / 2;
                }
            } else {
                this.stopFalling();
                this.position.y = tile.position.y + tile.size.y / 2 + this.size.y / 2;
            }

        } else {
            //You're below!
            let head = new THREE.Vector2(this.position.x, this.position.y + this.size.y / 2);
            let leftCorner = new THREE.Vector2(tile.position.x - tile.size.x / 2, tile.position.y - tile.size.y / 2);
            let rightCorner = new THREE.Vector2(tile.position.x + tile.size.x / 2, tile.position.y - tile.size.y / 2);

            let headComparedToLeft = (head.x - tile.position.x) * (leftCorner.y - tile.position.y) - (head.y - tile.position.y) * (leftCorner.x - tile.position.x);
            let headComparedToRight = (head.x - tile.position.x) * (rightCorner.y - tile.position.y) - (head.y - tile.position.y) * (rightCorner.x - tile.position.x);
            if (Math.abs(head.y - leftCorner.y) >= 0.05) {
                if (headComparedToLeft > 0) {
                    this.position.x = tile.position.x - tile.size.x / 2 - this.size.x / 2;
                } else if (headComparedToRight < 0) {
                    this.position.x = tile.position.x + tile.size.x / 2 + this.size.x / 2;
                } else {
                    this.stopJumping();
                    this.position.y = tile.position.y - tile.size.y / 2 - this.size.y / 2;
                }
            } else {
                this.stopJumping();
                this.position.y = tile.position.y - tile.size.y / 2 - this.size.y / 2;
            }

            // console.log("left, " + headComparedToLeft + ", right " + headComparedToRight);
        }
    }

    walk(running, forwBackValue, dt) {
        let newWalkingSpeed = this.walkingSpeed;
        let newWalkingCount = this.walkingCount;

        if (newWalkingCount < this.walkingMax) {
            newWalkingCount++;
            newWalkingSpeed += this.walkingAcceleration * newWalkingCount * (dt/16.67);
        }

        let finalWalkingSpeed = forwBackValue * (newWalkingSpeed * 3);

        // Update facing direction based on movement
        if (forwBackValue < 0) {
            this.facingRight = false;
            console.log("Facing left", this.sprite.scale.x); // Debug log
        } else if (forwBackValue > 0) {
            this.facingRight = true;
            console.log("Facing right", this.sprite.scale.x); // Debug log
        }

        let newPosition = new THREE.Vector2(this.position.x + finalWalkingSpeed, this.position.y);
        if (!this.isWithinColliderX(colliders, newPosition, this.size)) {
            this.walkingSpeed = newWalkingSpeed;
            this.walkingCount = newWalkingCount;
            this.position.x = newPosition.x;
        }
    }

    stopWalking() {
        this.walkingSpeed = 0;
        this.walkingCount = 0;
    }

    die() {
        this.position.set(this.spawn.x, this.spawn.y);
        this.stopFalling();
        this.stopWalking();
        new Sound("res/sounds/ldjamdead.mp3").play();
        incrementDeathCounter();
        return true;
    }

    isWithinColliderY(colliders, position, size) {
        let x1 = Math.round(position.x + 0.01 - size.x / 2);
        let x2 = Math.round(position.x - 0.01 + size.x / 2);
        let y1 = position.y + size.y / 2;
        let y2 = position.y - size.y / 2;

        let rows = [];
        let additionalTiles = x1 !== x2;

        let from = Math.round(y1) - 1;
        let to = Math.round(y2) + 1;

        if (from < 0) {
            from = 0;
        }
        if (to > colliders.length) {
            to = colliders.length;
        }

        for (let i = from; i < to; i++) {
            let elem0 = colliders[x1]?.[i];
            if (elem0 != null) {
                rows.push(elem0);
            }
            if (additionalTiles) {
                let elem1 = colliders[x2]?.[i];
                if (elem1 != null) {
                    rows.push(elem1);
                }
            }
        }

        let result = false;

        if (rows != null) {
            rows.forEach((tile) => {
                let y1Tile = tile.position.y + tile.size.y / 2;
                let y2Tile = tile.position.y - tile.size.y / 2;
                let x1Tile = tile.position.x - tile.size.x / 2;
                let x2Tile = tile.position.x + tile.size.x / 2;

                let yOverlap;
                if (tile.type === 'spike') {
                    yOverlap = y1 > y2Tile && y2 < tile.position.y - tile.size.y / 2;
                } else {
                    // Normal collision check for non-spike tiles
                    yOverlap = y1 > y2Tile && y2 < y1Tile;
                }

                let xOverlap = position.x + size.x/2 > x1Tile && position.x - size.x/2 < x2Tile;

                if (xOverlap && yOverlap) {
                    result = true;
                    if (tile.type === 'spike') {
                        console.log("Collided with spike");
                    }
                    this.underCollider = tile;
                    return result;
                }
            });
        }

        return result;
    }

    isWithinColliderX(colliders, position, size) {
        let y1 = Math.round(position.y + size.y / 2);
        let y2 = Math.round(position.y - size.y / 2);
        let x1 = position.x - size.x / 2;
        let x2 = position.x + size.x / 2;
        if (x2 < 0 || x1 > colliders.length)
            return;

        let tiles = [];
        let additionalTiles = y1 !== y2;

        let from = Math.round(x1) - 1;
        let to = Math.round(x2) + 1;

        if (from < 0) {
            from = 0;
        }
        if (to > colliders.length) {
            to = colliders.length;
        }

        for (let i = from; i < to; i++) {
            let elem0 = colliders[i][y1];
            if (elem0 != null) {
                tiles.push(elem0);
            }
            if (additionalTiles) {
                let elem1 = colliders[i][y2];
                if (elem1 != null) {
                    tiles.push(elem1);
                }
            }
        }

        let result = false;

        if (tiles != null) {
            tiles.forEach((tile) => {
                let x1Tile = tile.position.x - tile.size.x / 2;
                let x2Tile = tile.position.x + tile.size.x / 2;
                let y1Tile = tile.position.y + tile.size.y / 2;
                let y2Tile = tile.position.y - tile.size.y / 2;

                if (x1 < x2Tile && x2 > x1Tile) {
                    // Check if we're colliding with a spike
                    if (tile.type === 'spike') {
                        // Only die if we're within the actual spike hitbox
                        let playerBottom = position.y - size.y/2;
                        let playerTop = position.y + size.y/2;
                        
                        // Check if we're within the spike's vertical bounds
                        if (playerBottom < y1Tile && playerTop > y2Tile) {
                            this.die();
                            result = true;
                            return result;
                        }
                    } else {
                        result = true;
                        this.sideCollider = tile;
                        return result;
                    }
                }
            });
        }

        return result;
    }

    updateSprite() {
        this.sprite.position.set(this.position.x, this.position.y, 0);

        // Flip by changing texture repeat and offset
        if (!this.facingRight) {
            this.sprite.material.map.repeat.x = -1;
            this.sprite.material.map.offset.x = 1;
        } else {
            this.sprite.material.map.repeat.x = 1;
            this.sprite.material.map.offset.x = 0;
        }
        this.sprite.material.needsUpdate = true;

        if (this.verticalMovement.value < 0) {
            //Set fall animation
            if (this.walkingSpeed > 0) {
                //Set move animation and direction right
                this.animation.setIndexAnim(4, 16);
            } else if (this.walkingSpeed < 0) {
                //Set move animation and direction left
                this.animation.setIndexAnim(4, 16);
            } else {
                //Regular falling animation
                this.animation.setIndexAnim(3, 16);
            }
        } else if (this.verticalMovement.value > 0) {
            //Set jump animation
            this.animation.setIndexAnim(2, 16);
        } else if (this.walkingSpeed > 0) {
            //Set move animation and direction right
            this.animation.setIndexAnim(1, 16);
        } else if (this.walkingSpeed < 0) {
            //Set move animation and direction left
            this.animation.setIndexAnim(1, 16);
        } else {
            //Idle animation
            this.animation.setIndexAnim(0, 4);
        }
    }
}

class Tile {
    constructor(url, position, interaction, size = new THREE.Vector2(1, 1)) {
        let spriteMap = new THREE.TextureLoader().load(url);
        spriteMap.magFilter = THREE.NearestFilter;
        let spriteMaterial = new THREE.SpriteMaterial({map: spriteMap});
        let sprite = new THREE.Sprite(spriteMaterial);

        this.interaction = interaction;
        this.sprite = sprite;
        this.size = size;
        this.sprite.scale.set(size.x, size.y);
        this.position = position;
        this.sprite.position.set(position.x, position.y, 0);
        this.type = url.includes('spike') ? 'spike' : 'normal';
    }

}
