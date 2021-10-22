import { ZccApiClient } from "./Client/ZccApiClient";
import { UdpDiscovery } from "./UDP/discovery";

export class ComponentStore {

    private discovery: UdpDiscovery;
    private zccClientSet: Map<string, ZccApiClient>;

    constructor() {
        this.discovery = new UdpDiscovery(5002);
        this.discovery.listen();
        this.zccClientSet = new Map();
    }

    public getDiscovery() {
        return this.discovery;
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
        if( app){
            this.zccClientSet.delete(zccMac);
        }
    }
}