import * as PIXI from "pixi.js";
import { OutlineFilter } from "pixi-filters";
import _ from "lodash";
import { Creature } from "./creature";

export class Environment {
    env: PIXI.Application;
    food: PIXI.Sprite[];
    foodContainer: PIXI.Container;
    creatureContainer: PIXI.Container;
    creatures: Creature[];

    WIDTH: number;
    HEIGHT: number;

    constructor() {
        this.WIDTH = window.innerWidth;
        this.HEIGHT = window.innerHeight;

        let app = new PIXI.Application({
            width: this.WIDTH,
            height: this.HEIGHT,
            backgroundColor: 0x3D9970,
            antialias: true
        });
        app.stage.interactive = true;

        document.body.appendChild(app.view);

        let foodContainer = new PIXI.Container();
        foodContainer.x = 0;
        foodContainer.y = 0;
        foodContainer.width = this.WIDTH;
        foodContainer.height = this.HEIGHT;

        let creatureContainer = new PIXI.Container();
        creatureContainer.x = 0;
        creatureContainer.y = 0;
        creatureContainer.width = this.WIDTH;
        creatureContainer.height = this.HEIGHT;

        app.stage.addChild(foodContainer, creatureContainer);

        this.env = app;
        this.food = [];
        this.foodContainer = foodContainer;
        this.creatureContainer = creatureContainer;
        this.creatures = [];

        this.foodWave(150);

        this.env.ticker.add(() => {
            this.creatureContainer.children.forEach((creature, creatureIndex) => {
                if (this.creatures[creatureIndex].energy < 1) {
                    (creature as PIXI.Sprite).tint = 0x000000;
                    this.removeCreature(creatureIndex);

                    return;
                }

                this.creatures[creatureIndex].age++;

                (creature as PIXI.Sprite).filters = [
                    new OutlineFilter(Math.min(this.creatures[creatureIndex].energy / 50, 10), 0x000000)
                ];

                let nearestFoodIndex = this.nearestFoodIndex(creature);
                let nearestFood = this.foodContainer.children[nearestFoodIndex] as PIXI.Sprite;

                if (!nearestFood) return;

                let angle = Math.atan2(creature.y - nearestFood.y, creature.x - nearestFood.x);

                creature.x += Math.cos(angle) * -1 * this.creatures[creatureIndex].translateSpeed();
                creature.y += Math.sin(angle) * -1 * this.creatures[creatureIndex].translateSpeed();

                for (let i = 0; i < this.creatureContainer.children.length; i++) {
                    if (i == creatureIndex) break;

                    let testCreature = this.creatureContainer.children[i];

                    // #removeCreature() is flawed but I have no idea why.
                    // Going to have to look into a fix.
                    /*if (this.colliding(creature, testCreature) && this.creatures[creatureIndex].size - this.creatures[i].size > 300) {
                        this.removeCreature(i);
                        this.creatures[creatureIndex].energy += Math.round(this.creatures[i].energy / 10);

                        break;
                    }*/

                    if (this.colliding(creature, testCreature) && this.creatures[creatureIndex].energy > 120 && this.creatures[i].energy > 120) {
                        if (this.creatures[creatureIndex].age > 1000 && this.creatures[i].age > 1000)
                            this.mateCreatures(creatureIndex, i);
                    }

                    while (this.colliding(creature, testCreature)) {
                        let bounceAngle = Math.atan2(creature.y - testCreature.y, creature.x - testCreature.x);

                        creature.x += Math.cos(bounceAngle);
                        creature.y += Math.sin(bounceAngle);
                        testCreature.x += Math.cos(bounceAngle) * -1;
                        testCreature.y += Math.sin(bounceAngle) * -1;
                    }
                }

                this.creatures[creatureIndex].energy -= 1 * (this.creatures[creatureIndex].size / 500) * (this.creatures[creatureIndex].speed / 500);

                for (let i = 0; i < this.foodContainer.children.length; i++) {
                    let testFood = this.foodContainer.children[i];

                    if (this.colliding(creature, testFood)) {
                        this.removeFood(i);
                        this.creatures[creatureIndex].energy += 20;
                    }
                }
            });
        });
    }

    colliding(sprite1: PIXI.DisplayObject, sprite2: PIXI.DisplayObject) {
        let b1 = sprite1.getBounds();
        let b2 = sprite2.getBounds();

        return (
            b1.x + b1.width > b2.x &&
            b1.x < b2.x + b2.width &&
            b1.y + b1.height > b2.y &&
            b1.y < b2.y + b2.height
        );
    }

    nearestFoodIndex(creature: PIXI.DisplayObject) {
        let lowestDistance = [Infinity, -1]; // [distance, index]

        for (let i = 0; i < this.foodContainer.children.length; i++) {
            let food = this.foodContainer.children[i];

            let xDist = Math.abs(creature.x - food.x);
            let yDist = Math.abs(creature.y - food.y);

            let dist = Math.sqrt(xDist*xDist + yDist*yDist);

            if (dist < lowestDistance[0]) {
                lowestDistance = [dist, i];
            }
        }

        return lowestDistance[1];
    }

    /* Food utilities */

    createFood(x?: number, y?: number) {
        let food = new PIXI.Sprite(PIXI.Texture.WHITE);
        food.tint = 0x85144b;
        food.anchor.set(0.5);
        food.width = 5;
        food.height = 5;
        food.x = x || _.random(10, this.WIDTH - 10);
        food.y = y || _.random(10, this.HEIGHT - 10);

        return food;
    }

    addFood(food: PIXI.Sprite) {
        this.food.push(food);
        this.foodContainer.addChild(food);
    }

    removeFood(index: number) {
        this.food.splice(index, 1);
        this.foodContainer.removeChildAt(index);
    }

    spawnFood(x?: number, y?: number) {
        let food = this.createFood(x, y);
        this.addFood(food);
    }

    foodWave(amount: number) {
        for (let i = 0; i < amount; i++) {
            this.spawnFood();
        }
    }

    /* Creature utilities */

    createCreature(x?: number, y?: number, parents?: Creature[]) {
        let creature = new Creature(parents);

        let creatureSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        creatureSprite.tint = creature.color;
        creatureSprite.filters = [
            new OutlineFilter()
        ];
        creatureSprite.anchor.set(0.5);
        creatureSprite.width = creature.translateSize();
        creatureSprite.height = creature.translateSize();
        creatureSprite.x = x || Math.round(_.random(10, this.WIDTH - 10));
        creatureSprite.y = y || Math.round(_.random(10, this.HEIGHT - 10));
        creatureSprite.rotation = Math.PI / 4;
        creatureSprite.interactive = true;

        creatureSprite.on("mouseover", () => {
            this.creatureContainer.children.forEach(creatureSprite => {
                creatureSprite.alpha = 1;
            });
            creatureSprite.alpha = 0.7;

            console.log(creature);
        });

        return {
            sprite: creatureSprite,
            creature
        };
    }

    addCreature(creature: { sprite: PIXI.Sprite, creature: Creature }) {
        this.creatures.push(creature.creature);
        this.creatureContainer.addChild(creature.sprite);
    }

    removeCreature(index: number) {
        this.creatures.splice(index, 1);
        this.creatureContainer.removeChildAt(index);
    }

    spawnCreature(x?: number, y?: number, parents?: Creature[]) {
        let creature = this.createCreature(x, y, parents);
        this.addCreature(creature);
    }

    mateCreatures(creatureIndex1: number, creatureIndex2: number) {
        let sprite1 = this.creatureContainer.children[creatureIndex1];
        let stats1 = this.creatures[creatureIndex1];
        let sprite2 = this.creatureContainer.children[creatureIndex2];
        let stats2 = this.creatures[creatureIndex2];

        while (stats1.energy - stats1.childEnergy > 200 && stats2.energy - stats2.childEnergy > 200) {
            this.spawnCreature((sprite1.x + sprite2.x) / 2, (sprite1.y + sprite2.y) / 2, [stats1, stats2]);
            stats1.energy -= stats1.childEnergy;
            stats2.energy -= stats2.childEnergy;
        }
    }
}