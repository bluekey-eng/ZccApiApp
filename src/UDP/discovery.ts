import * as dgram from 'dgram'
import { IFoundZccData, ZimiDiscoveryEvents } from '../Events/ZimiDiscoveryEvents';

export class UdpDiscovery {

  private port: number;
  private server: dgram.Socket;
  private discoveryEvents: ZimiDiscoveryEvents;
  constructor(port: number) {
    this.port = port;
    this.server = dgram.createSocket('udp4');
    this.discoveryEvents = new ZimiDiscoveryEvents();


    this.discoveryEvents.onDiscoverZcc( () => {
      const broadcastPort = 5001
      const broadcastHost = '255.255.255.255';

      const bcServer = dgram.createSocket('udp4');
      bcServer.bind( () => {
        bcServer.setBroadcast(true);
        bcServer.send( 'ZIMI', broadcastPort, broadcastHost)
      })

   })
  }

  public listen() {
    return new Promise<void>((resolve, reject) => {
      this.server.bind(this.port, () => {

        this.server.on('error', (err) => {
          console.log(`server error:\n${err.stack}`);
          this.server.close();
        });

        this.server.on('message', (msg, rinfo) => {
          // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

          const foundObj = JSON.parse(msg.toString())
          const foundData: IFoundZccData = {
            brand: foundObj.brancd,
            product: foundObj.product,
            mac: foundObj.mac,
            tcp: foundObj.tcp,
            availableTcps: foundObj.availableTcps,
            host: rinfo.address
          }
          this.discoveryEvents.foundZcc( foundData )

          // setTimeout(() => { this.server.close(), this, this.server.disconnect() }, 5000)
        });

        this.server.on('listening', () => {
          var address = this.server.address();
          console.log(`server listening ${address.address}:${address.port}`);
        });
      })
    })
  }

  public getEvents(){
    return this.discoveryEvents;
  }

}