import {
    launchpad_radius
} from "./values.js";

import {
    world
} from "@minecraft/server";

export const launchpadProtectBlocks = [];

function addLaunchpadProtectBlocks(launchpadBlock) {
    for (let ox = -launchpad_radius; ox <= launchpad_radius; ox++)
        for (let oz = -launchpad_radius; oz <= launchpad_radius; oz++)
            launchpadProtectBlocks.push(launchpadBlock.offset({ x: ox, y: 0, z: oz }));
}

function sameLocation(loc1, loc2) { return loc1.x == loc2.x && loc1.y == loc2.y && loc1.z == loc2.z; }

/*
Retrieves, from scoreboard objectives tracking launchpads, the launchpadIds
of each registered launchpad.

Gets the XYZ of the launchpad_block associated with each launchpad. Uses
that XYZ to add each surrounding concrete block to the launchpadProtectBlocks 
array.
*/
export function startProtectingLaunchpads() {
    const launchpadIds = [];
    world.scoreboard.getObjectives().forEach((obj) => {
        if (obj.id.includes("-launchpad-X"))
            launchpadIds.push(obj.id.replaceAll("-launchpad-X", ""));
    });
    launchpadIds.sort();

    world.afterEvents.playerSpawn.subscribe((playerSpawn) => {
        if (world.getPlayers().length == 1) {
            launchpadIds.forEach((id) => {
                const launchpadObj = world.scoreboard.getObjective(id + "-launchpad-X");
                const launchpadCreator = world.scoreboard.getParticipants().find((participant) => launchpadObj.hasParticipant(participant));
                if (launchpadCreator !== undefined) {
                    const launchpadCreatorPlayer = launchpadCreator.getEntity();
                    if (launchpadCreatorPlayer !== undefined) {
                        const bx = world.scoreboard.getObjective(id + "-launchpad-X").getScore(launchpadCreatorPlayer);
                        const by = world.scoreboard.getObjective(id + "-launchpad-Y").getScore(launchpadCreatorPlayer);
                        const bz = world.scoreboard.getObjective(id + "-launchpad-Z").getScore(launchpadCreatorPlayer);
                        addLaunchpadProtectBlocks(world.getDimension("minecraft:overworld").getBlock({ x: bx, y: by, z: bz }));
                    }
                }
            });
        }
    });

    // Uses the launchpadProtectBlocks array to check if the attempt to
    // break a block should be permitted.
    world.beforeEvents.playerBreakBlock.subscribe((playerBreakBlock) => {
        if (launchpadProtectBlocks.find((block) => sameLocation(block.location, playerBreakBlock.block.location)) !== undefined)
            playerBreakBlock.cancel = true;
    });
}