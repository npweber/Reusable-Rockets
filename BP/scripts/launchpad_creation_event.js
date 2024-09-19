import {
    world,
    system
} from "@minecraft/server";

const launchpad_radius = 2;
const max_raycast_height = 200;

/** @type {import("@minecraft/server").BlockCustomComponent} */
const LaunchpadCreationEvent = {
    onPlace(event) {
        const dim = event.dimension;
        let inOverworld = dim.id === "minecraft:overworld";
        let inEnd = dim.id === "minecraft:the_end";
        if (inOverworld || inEnd) {
            if (isPartOfValidLaunchpad(event.block, dim)) {
                world.sendMessage("Launchpad valid.")
            }
        }
    }
}

function isTopMostBlock(block, dim) {
    let isTopMostBlock = true;
    const bx = block.location.x;
    const by = block.location.y;
    const bz = block.location.z;
    for (let oy = by + 1; oy <= by + max_raycast_height && isTopMostBlock; oy++)
        isTopMostBlock = dim.getBlock({ x: bx, y: oy, z: bz }).type.id === "minecraft:air";
    return isTopMostBlock;
}

function isPartOfValidLaunchpad(block, dim) {
    let isPartOfValidLaunchpad = true;
    for (let ox = -launchpad_radius; ox <= launchpad_radius && isPartOfValidLaunchpad; ox++)
        for (let oz = -launchpad_radius; oz <= launchpad_radius && isPartOfValidLaunchpad; oz++) {
            if (ox == 0 && oz == 0)
                continue;
            let offsetBlock = block.offset({ x: ox, y: 0, z: oz });
            isPartOfValidLaunchpad = offsetBlock.type.id === "minecraft:brown_concrete" && isTopMostBlock(offsetBlock, dim);
        }
    return isPartOfValidLaunchpad;
}

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("rr:launchpad_creation_event", LaunchpadCreationEvent);
});