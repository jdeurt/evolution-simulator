import { random } from "lodash";

export class Creature {
    // Not mutable
    energy: number; // starts at 100
    age: number; // 0-indexed
    generation: number; // 0-indexed
    children: number; // number of children this creature has had
    color: number; // generated via rgb(speed, stepFreq, childEnergy)

    // Mutable (1-1000)
    size: number;
    speed: number;
    stepFreq: number;
    childEnergy: number;

    constructor(parents?: Creature[]) {
        let to255 = (num: number) => Math.round(num * 51 / 200);
        let mutated = () => random(1, 16) == 16;
        let evolve = (s1: number, s2: number) => {
            if (mutated()) return random(1, 1000);
            else return (s1 + s2) / 2 + random(-10, 10);
        };

        if (!parents) {
            this.energy = 100;
            this.age = 0;
            this.generation = 0;
            this.children = 0;

            this.size = random(1, 1000);
            this.speed = random(1, 1000);
            this.stepFreq = random(1, 1000);
            this.childEnergy = random(1, 1000);
        } else {
            let p1 = parents[0];
            let p2 = parents[1];

            this.energy = p1.childEnergy + p2.childEnergy;
            this.age = 0;
            this.generation = Math.max(p1.generation, p2.generation) + 1;
            this.children = 0;

            this.size = evolve(p1.size, p2.size);
            this.speed = evolve(p1.speed, p2.speed);
            this.stepFreq = evolve(p1.stepFreq, p2.stepFreq);
            this.childEnergy = evolve(p1.childEnergy, p2.childEnergy);
        }

        this.color = Number(`0x${to255(this.speed).toString(16)}${to255(this.stepFreq).toString(16)}${to255(this.childEnergy).toString(16)}`);
    }

    private mapRange(num: number, in_min: number, in_max: number,  out_min: number,  out_max: number) {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    translateSize() {
        return Math.round(this.mapRange(this.size, 1, 1000, 10, 30));
    }

    translateSpeed() {
        return Math.round(this.mapRange(this.speed, 1, 1000, 1, 10));
    }

    translateStepFreq() {
        return Math.round(this.mapRange(this.stepFreq, 1, 1000, 300, 2000));
    }

    translateChildEnergy() {
        return Math.round(this.mapRange(this.childEnergy, 1, 1000, 20, 80));
    }
}