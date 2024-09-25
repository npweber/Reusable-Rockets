import {
    ModalFormData,
} from '@minecraft/server-ui';

export const addLaunchpadPrompt = new ModalFormData()
    .title("Add launchpad destination to FlightMap")
    .textField("Enter launchpad name", "Launchpad name")
    .submitButton("Add");