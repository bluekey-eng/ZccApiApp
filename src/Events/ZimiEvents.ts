import { EventEmitter } from "events";

import { IDevice } from '../Devices/device'
export type ZimiEventType = 'sendApiMessage' | 'receiveApiMessage' | 'updateDeviceProperties' | 'updateDeviceStates' | 'setDeviceAction';
export type ZimiSendMessageType = 'auth_app' | 'start_session' | 'get_properties' | 'get_states' | 'setAction';
export type ZimiReceiveMessageType = 'auth_app_success' | 'auth_app_failed' | 'start_session_success' | 'start_session_failed' | 'properties' | 'states' | 'state_events' | 'actions'

export class ZimiEvents extends EventEmitter {
    public onReceiveApiMessage(callback: (message: object, messageType: ZimiReceiveMessageType) => void) {
        this.on('receiveApiMessage', data => {
            callback(data.message, data.messageType);
        });
    }

    public onSendApiMessage(callback: (message: object, messageType: ZimiSendMessageType) => void) {
        this.on('sendApiMessage', data => {
            callback(data.message, data.messageType);
        });
    }

    public onSetDeviceAction(callback: (device: IDevice, action: any) => void) {
        this.on('setDeviceAction', data => {
            callback(data.device, data.action);
        });
    }

    public onUpdateDeviceProperties(callback: (device: IDevice) => void) {
        this.on('updateDeviceProperties', data => {
            callback(data.device);
        });
    }

    public onUpdateDeviceStates(callback: (device: IDevice) => void) {
        this.on('updateDeviceStates', data => {
            callback(data.device);
        });
    }

    public receiveApiMessage(message: object, messageType: ZimiReceiveMessageType) {
        this.emit('receiveApiMessage', { messageType, message });
    }

    public sendApiMessage(message: object, messageType: ZimiSendMessageType) {
        this.emit('sendApiMessage', { messageType, message });
    }

    public setDeviceAction(device: IDevice, action: any) {
        this.emit('setDeviceAction', {device, action});
    }

    public updateDeviceProperties(device: IDevice) {
        this.emit('updateDeviceProperties', { device })
    }

    public updateDeviceStates(device: IDevice) {
        this.emit('updateDeviceStates', { device })
    }
}