import { EventEmitter } from "events";

// import { IDevice } from '../Devices/device'

export interface IFoundZccData {
    brand: string;
    product: string;
    mac: string;
    tcp: number;
    availableTcps: number;
    host: string;
}

export class ZimiDiscoveryEvents extends EventEmitter {

    public discoverZcc() {
        this.emit('discover');
    }

    public onDiscoverZcc(callback: () => void) {
        this.on('discover', () => {
            callback();
        });
    }


    public foundZcc(data: IFoundZccData) {
        this.emit('found', data);
    }

    public onFoundZcc (callback: (params: IFoundZccData) => void)  {
        this.on('found', data => {
            callback(data);
        })
    }
    

}