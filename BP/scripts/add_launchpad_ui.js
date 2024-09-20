import {
    ModalFormData,
} from '@minecraft/server-ui';

import {
    world
} from "@minecraft/server"

export function promptAddLaunchpad(player, launchpadX, launchpadZ) {
    const addLaunchpadPrompt = new ModalFormData()
        .title("Add launchpad destination @ " + launchpadX + "," + launchpadZ)
        .textField("Enter launchpad name", "Launchpad name")
        .submitButton("Add");

    addLaunchpadPrompt.show(player).then((response) => {
        if (response.formValues !== undefined) {
            const launchpadXObjId = response.formValues[0] + "-launchpad-X"
            const launchpadXObj = world.scoreboard.addObjective(launchpadXObjId);
            launchpadXObj.addScore(player, launchpadX);

            const launchpadZObjId = response.formValues[0] + "-launchpad-Z"
            const launchpadZObj = world.scoreboard.addObjective(launchpadZObjId);
            launchpadZObj.addScore(player, launchpadZ);
        }
    });
}