import { offLog, onLog } from "../log";
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

            let isOn: boolean | undefined = undefined
            switch (dev.get().properties?.controlPointType) {
                case 'dimmer':
                    isOn = dev.get()?.states?.controlState?.dimmer?.isOn;
                    break;
                case 'outlet':
                    isOn = dev.get()?.states?.controlState?.outlet?.isOn;
                    break;
                case 'fan':
                    isOn = dev.get()?.states?.controlState?.fan?.isOn;
                    break;
                case 'switch':
                    isOn = dev.get()?.states?.controlState?.switch?.isOn;
                    break;
            }

            if (isOn !== undefined) {

                actionsMessages.push({
                    id: dev.get().id,
                    action: isOn === true ? "TurnOff" : "TurnOn"
                })
            }
        })
        return actionsMessages;
    }

    public toggleOnOffAllMessages(turnOn: boolean) {

        const actionsMessages: any[] = [];
        this.deviceMap.forEach(dev => {

            let isOn: boolean | undefined = undefined
            switch (dev.get().properties?.controlPointType) {
                case 'dimmer':
                    isOn = turnOn;
                    break;
                case 'outlet':
                    isOn = turnOn;
                    break;
                case 'fan':
                    isOn = turnOn;
                    break;
                case 'switch':
                    isOn = turnOn;
                    break;
            }

            if (isOn !== undefined) {

                actionsMessages.push({
                    id: dev.get().id,
                    action: isOn === true ? "TurnOff" : "TurnOn"
                })
            }
        })
        return actionsMessages;
    }

    public displayDeviceStatus() {

        const actionsMessages: any[] = [];
        console.log(' device status')

        this.deviceMap.forEach(dev => {

            let isOn: boolean | undefined = undefined
            switch (dev.get().properties?.controlPointType) {
                case 'dimmer':
                    isOn = dev.get()?.states?.controlState?.dimmer?.isOn;
                    break;
                case 'outlet':
                    isOn = dev.get()?.states?.controlState?.outlet?.isOn;
                    break;
                case 'fan':
                    isOn = dev.get()?.states?.controlState?.fan?.isOn;
                    break;
                case 'switch':
                    isOn = dev.get()?.states?.controlState?.switch?.isOn;
                    break;
                case 'garagedoor':
                    isOn = dev.get()?.states?.controlState?.garagedoor?.openpercentage > 0 ? true: false;
                    break;
            }

            if (isOn !== undefined) {
                const devObj = dev.get();
                const logMessage = ` ${devObj.id} ${devObj.properties.name} : ${isOn}`;
                if (isOn) {
                    onLog(logMessage);
                } else {
                    offLog(logMessage);
                }

            }
        })
    }
}