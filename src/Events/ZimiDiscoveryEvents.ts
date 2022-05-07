import { EventEmitter } from "events";

// import { IDevice } from '../Devices/device'

export interface IFoundZccData {
    brand: string;
    product: string;
    mac: string;
    tcp: number;
    availableTcps: number;
    host: string;
    apiVersion?: string;
    firmwareVersion?: string;
    numberOfDevices: number;
    numberOfControlpoints?: number;
    networkName?: string;
    uptime?: number;
}

export class ZimiDiscoveryEvents extends EventEmitter {

    public discoverZcc() {
        this.emit('discover');
    }

    public foundZcc(data: IFoundZccData) {
        this.emit('found', data);
    }

    public onDiscoverZcc(callback: () => void) {
        this.on('discover', () => {
            callback();
        });
    }

    public onFoundZcc (callback: (params: IFoundZccData) => void)  {
        this.on('found', data => {
            callback(data);
        })
    }
    

}