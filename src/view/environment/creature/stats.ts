/*

Creatures are the main characters in this simulation. They move by taking aim at the closest food and taking
a single step in that direction. Sometimes their step may be too large so they miss the food. Each step a
creature takes uses 1 of their energy pool.

To product offspring, creatures have to mate. Mating is accomplished when 2 creatures who have above 120
energy collide. The result of two creatures mating is a new creature with mutable stats that follow the
following formula:
() => {
    let split = random(0.3, 0.7);
    let mutationVal = random(1, 16);
    if (mutationVal === 1) return randomStats;
    else return creature1.stats * split + creature2.stats * (1 - split);
}
The energy of the child creature is value of both of the parents' childEnergy stat combined. Parents will
reproduce until their energy is below 120, meaning parents with a low childEnergy stat can produce more
children at once.

Each time a creature collides with food the food is deleted and the creature gains 10 energy.

Creatures that collide with a creature with a size stat that's 5 less than theirs will eat the smaller
creature and get 1/10th of their energy (rounded up). Size also influences how much energy each creature
uses with each step. A size stat of 500 means each step will use 1 energy, while size stats of 1 and 1000
will use 0.5 and 2 energy respectively.

Each time a creature takes a step their stepsLeft stat goes down 1. When a creature's stepsLeft stat reaches
0, it dies.

Mutable stats are in a 1-1000 range. To determine actual simulatable values for each stat, the stat value is
modified to follow the chart below:
|----------------------------------|
|     stat     |   min   |   max   |
|----------------------------------|
| size         | 10px    | 30px    |
| stepSize     | 1px     | 20px    |
| stepFreq     | 300ms   | 2000ms  |
| childEnergy  | 20      | 80      |
| huntRange    | 20      | 500     |
|----------------------------------|
So, for example, a creature with a size stat of 1000 would have a diameter of 30px in the simulation. Values
are always rounded to the nearest whole number.

*/

export default interface CreatureStats {
    // Not mutable
    energy: number; // starts at 100
    age: number; // 0-indexed
    generation: number; // 0-indexed
    children: number; // number of children this creature has had
    color: number; // generated via rgb(stepSize, stepFreq, childEnergy)

    // Mutable (1-1000)
    size: number;
    speed: number;
    childEnergy: number;
    huntRange: number;
}