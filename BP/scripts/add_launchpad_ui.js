import {
    ModalFormData,
} from '@minecraft/server-ui';

// UI Prompt to ask for a Launchpad name
export const addLaunchpadPrompt = new ModalFormData()
    .title("Add launchpad destination to FlightMap")
    .textField("Enter launchpad name", "Launchpad name")
    .submitButton("Add");