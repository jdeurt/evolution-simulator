import * as PIXI from "pixi.js";
import _ from "lodash";
import { Environment } from "./environment";

export function sayHello() {
    PIXI.utils.sayHello(
        PIXI.utils.isWebGLSupported() ? "WebGL" : "canvas"
    );
}

export async function build() {
    let environment = new Environment();

    for (let i = 0; i < 25; i++) {
        environment.spawnCreature();
    }

    setInterval(() => environment.foodWave(5), 250);
}