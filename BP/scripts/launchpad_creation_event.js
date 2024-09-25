import {
    world,
    BlockTypes
} from "@minecraft/server";

import {
    launchpad_radius
} from "./values.js";

import {
    addLaunchpadPrompt
} from "./add_launchpad_ui.js"

/*
Collection of concrete blocks in Minecraft: Bedrock Edition.
--------------------------------------------------------------
Concrete blocks surround the launchpad_block to form a launchpad.

NOTE: Need to maintain that .endsWith("concrete") is a working condition to get
all block types of concrete.
*/
const concreteTypes = BlockTypes.getAll().filter((type) => type.id.endsWith("concrete"));

/*
Launchpad Creation Event
--------------------------
Trigger: Launchpad block is placed.

Criteria for success:
Launchpad block is in the overworld or end dimension.
Launchpad block is the center of a radial square of Concrete blocks. This radial square can be defined as a "potential launchpad".
The potential launchpad has a square radius of at least the configured launchpad_radius value.
The potential launchpad has appropriate exposure to the sky.

On success:
Minecraft considers the potential launchpad to be a valid launchpad.
Custom UI asks the player if they want to add this valid launchpad as a Launchpad destination to the Flight Map.
*/

/** @type {import("@minecraft/server").BlockCustomComponent} */
const LaunchpadCreationEvent = {
    beforeOnPlayerPlace(event) {
        const dim = event.dimension;
        const player = event.player;
        let inOverworld = dim.id === "minecraft:overworld";
        let inEnd = dim.id === "minecraft:the_end";
        if (inOverworld || inEnd) {
            const bx = event.block.location.x;
            const by = event.block.location.y;
            const bz = event.block.location.z;
            if (isPartOfValidLaunchpad(event.block, dim)) {
                addLaunchpadPrompt.show(player).then((response) => {
                    if (response.formValues !== undefined) {
                        const launchpadId = response.formValues[0];

                        // Add scoreboard objectives to save launchpad block
                        // XYZ used to identify where launchpad destinations are.

                        // XYZ Scoreboard objectives are specific to the player who
                        // created the launchpad destination. The creator owns the launchpad.
                        if (launchpadId.length > 0) {
                            const launchpadXObjId = launchpadId + "-launchpad-X"
                            const launchpadXObj = world.scoreboard.addObjective(launchpadXObjId);
                            launchpadXObj.addScore(player, bx);

                            const launchpadYObjId = launchpadId + "-launchpad-Y"
                            const launchpadYObj = world.scoreboard.addObjective(launchpadYObjId);
                            launchpadYObj.addScore(player, by);

                            const launchpadZObjId = launchpadId + "-launchpad-Z"
                            const launchpadZObj = world.scoreboard.addObjective(launchpadZObjId);
                            launchpadZObj.addScore(player, bz);
                        }
                        else {
                            player.sendMessage("No name given for Launchpad destination.");
                        }
                    }
                });
            }
            // Keep for debugging temporarily.
            else {
                player.sendMessage("Launchpad at (" + bx + "," + by + "," + bz + ") invalid");
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

function isConcrete(type) { return concreteTypes.find((concreteType) => concreteType === type) !== undefined; }

function isPartOfValidLaunchpad(block, dim) {
    let isPartOfValidLaunchpad = true;
    for (let ox = -launchpad_radius; ox <= launchpad_radius && isPartOfValidLaunchpad; ox++)
        for (let oz = -launchpad_radius; oz <= launchpad_radius && isPartOfValidLaunchpad; oz++) {
            if (ox == 0 && oz == 0)
                continue;
            let offsetBlock = block.offset({ x: ox, y: 0, z: oz });
            isPartOfValidLaunchpad = isConcrete(offsetBlock.type) && blockExposedToSky(offsetBlock, dim);
        }
    return isPartOfValidLaunchpad;
}

export function registerLaunchpadCreationEvent() {
    world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
        blockComponentRegistry.registerCustomComponent("rr:launchpad_creation_event", LaunchpadCreationEvent);
    });
}