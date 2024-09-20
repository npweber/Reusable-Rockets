import {
    world
} from "@minecraft/server";

import {
    launchpad_radius
} from "./config.js";

import {
    promptAddLaunchpad
} from "./add_launchpad_ui.js"

/** @type {import("@minecraft/server").BlockCustomComponent} */
const LaunchpadCreationEvent = {
    beforeOnPlayerPlace(event) {
        const dim = event.dimension;
        let inOverworld = dim.id === "minecraft:overworld";
        let inEnd = dim.id === "minecraft:the_end";
        if (inOverworld || inEnd) {
            const bx = event.block.location.x;
            const by = event.block.location.y;
            const bz = event.block.location.z;
            if (isPartOfValidLaunchpad(event.block, dim)) {
                promptAddLaunchpad(event.player, bx, bz);
                world.sendMessage("Launchpad at (" + bx + "," + by + "," + bz + ") valid");
            }
            else {
                world.sendMessage("Launchpad at (" + bx + "," + by + "," + bz + ") invalid");
            }
        }
    }
}

function blockExposedToSky(block, dim) {
    let isExposed = true;
    const bx = block.location.x;
    const by = block.location.y;
    const bz = block.location.z;
    for (let oy = by + 1; oy <= dim.heightRange.max && isExposed; oy++)
        isExposed = dim.getBlock({ x: bx, y: oy, z: bz }).type.id === "minecraft:air";
    return isExposed;
}

function isPartOfValidLaunchpad(block, dim) {
    let isPartOfValidLaunchpad = true;
    for (let ox = -launchpad_radius; ox <= launchpad_radius && isPartOfValidLaunchpad; ox++)
        for (let oz = -launchpad_radius; oz <= launchpad_radius && isPartOfValidLaunchpad; oz++) {
            if (ox == 0 && oz == 0)
                continue;
            let offsetBlock = block.offset({ x: ox, y: 0, z: oz });
            isPartOfValidLaunchpad = offsetBlock.type.id === "minecraft:brown_concrete" && blockExposedToSky(offsetBlock, dim);
        }
    return isPartOfValidLaunchpad;
}

export function registerLaunchpadCreationEvent() {
    world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
        blockComponentRegistry.registerCustomComponent("rr:launchpad_creation_event", LaunchpadCreationEvent);
    });
}