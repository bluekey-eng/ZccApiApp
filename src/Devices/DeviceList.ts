import { Device } from "./device";

export class DeviceList {

    private deviceMap: Map<string, Device>;
    constructor() {
        this.deviceMap = new Map();
    }

    public addDevice(deviceId: string) {
        if (!this.deviceMap.get(deviceId)) {
            this.deviceMap.set(deviceId, new Device(deviceId))
        }
    }

    public setDeviceProps(deviceId: string, props: any) {
        this.deviceMap.get(deviceId)?.setProperties(props);
    }

    public setDeviceStates(deviceId: string, states: any) {
        this.deviceMap.get(deviceId)?.setStates(states);
    }

    public toggleOnOffMessages() {

        const actionsMessages: any[] = [];
        this.deviceMap.forEach(dev => {
            const isOn = dev.get()?.states?.controlState?.state?.isOn;

            if (isOn != undefined) {

                actionsMessages.push({
                    id: dev.get().id,
                    action: isOn ? "TurnOff" : "TurnOn"
                })
            }
        })
        return actionsMessages;
    }
}