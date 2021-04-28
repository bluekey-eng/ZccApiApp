
export interface IDevice{
    id: string;
    properties?: {
        name: string,
        controlPointType: string, 
        roomName: string,
        roomId: number,

    },
    states?: {
        controlState?:{
            state?: {
                isOn: boolean,
                brightness: number;
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