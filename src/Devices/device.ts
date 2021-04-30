
export interface IDevice{
    id: string;
    properties?: {
        name: string,
        controlPointType: 'switch' | 'outlet'|'dimmer'|'fan'|'garagedoor', 
        roomName: string,
        roomId: number,

    },
    states?: {
        controlState?:{
            switch?: {
                isOn: boolean,
            },
            dimmer?: {
                isOn: boolean,
                brightness: number;
            },
            outlet?: {
                isOn: boolean,
            },
            fan?: {
                isOn: boolean,
            },
            isConnected: boolean;
        }
    },
    actions?: {

    }
}

export class Device{

    private device: IDevice;
    constructor(deviceId: string){
        this.device = {id: deviceId}
    }

    setProperties( props: any){
        this.device.properties = props;
    }

    setStates(states: any){
        this.device.states = states;
    }

    get(): IDevice{
        return this.device;
    }
    
}