import {
    registerLaunchpadCreationEvent
} from "./launchpad_creation_event.js";

import {
    startProtectingLaunchpads
} from "./protect_launchpads.js";

registerLaunchpadCreationEvent();
startProtectingLaunchpads();