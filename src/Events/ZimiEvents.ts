import { EventEmitter } from "events";

import { IDevice } from '../Devices/device'
export type ZimiEventType = 'sendApiMessage' | 'receiveApiMessage' | 'updateDeviceProperties' | 'updateDeviceStates' | 'setDeviceAction';
export type ZimiSendMessageType = 'auth_app' | 'start_session' | 'get_properties' | 'get_states';
export type ZimiReceiveMessageType = 'auth_app_success' | 'auth_app_failed' | 'start_session_pass' | 'start_session_failed' | 'properties' | 'states' | 'state_events'

export class ZimiEvents extends EventEmitter {

    public sendApiMessage(message: string, messageType: ZimiSendMessageType) {
        this.emit('sendApiMessage', { messageType, message });
    }

    public onsendApiMessage(callback: (message: string, messageType: ZimiSendMessageType) => void) {
        this.on('sendApiMessage', data => {
            callback(data.message, data.messageType);
        });
    }

    

    public receiveApiMessage(message: string, messageType: ZimiReceiveMessageType) {
        this.emit('receiveApiMessage', { messageType, message });
    }

    public onReceiveApiMessage(callback: (message: string, messageType: ZimiSendMessageType) => void) {
        this.on('receiveApiMessage', data => {
            callback(data.message, data.messageType);
        });
    }



    public updateDeviceProperties(device: IDevice) {
        this.emit('updateDeviceProperties', { device })
    }

    public onUpdateDeviceProperties(callback: (device: IDevice) => void) {
        this.on('updateDeviceProperties', data => {
            callback(data.device);
        });
    }



    public updateDeviceStates(device: IDevice) {
        this.emit('updateDeviceStates', { device })
    }

    public onUpdateDeviceStates(callback: (device: IDevice) => void) {
        this.on('updateDeviceStates', data => {
            callback(data.device);
        });
    }



    public setDeviceAction(device: IDevice, action: any) {
        this.emit('setDeviceAction', {device, action});
    }

    public onSetDeviceAction(callback: (device: IDevice, action: any) => void) {
        this.on('setDeviceAction', data => {
            callback(data.device, data.action);
        });
    }

}