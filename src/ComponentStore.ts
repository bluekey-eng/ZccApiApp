import { ZccApiClient } from "./Client/ZccApiClient";
import { UdpDiscovery } from "./UDP/discovery";

export class ComponentStore {

    private zccClientSet: Map<string, ZccApiClient>;

    constructor() {

        this.zccClientSet = new Map();
    }

    public addZccClient(zccIp: string, zccPort: number, zccMac: string) {

        if (this.zccClientSet.get(zccMac) === undefined) {
            const zccClient = new ZccApiClient({ zccIp, zccPort, zccMac });
            this.zccClientSet.set(zccMac, zccClient);
        }
    }

    public getZccClient(zccMac: string) {
        const app = this.zccClientSet.get(zccMac);
        if (app) {
            return app;
        }
        return;
    }

    public removeZccClient(zccMac: string){
        const app = this.zccClientSet.get(zccMac);
        app.stop();
        if( app){
            this.zccClientSet.delete(zccMac);
        }
    }
}