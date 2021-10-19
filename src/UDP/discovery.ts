import * as dgram from 'dgram'

export class UdpDiscovery {

  private port: number;
  private server: dgram.Socket;
  constructor(port: number) {
    this.port = port;
    this.server = dgram.createSocket('udp4')

  }

  public listen() {
    return new Promise<void>((resolve, reject) => {
      this.server.bind(this.port, () => {

        this.server.on('error', (err) => {
          console.log(`server error:\n${err.stack}`);
          this.server.close();
        });

        this.server.on('message', (msg, rinfo) => {
          console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

          // setTimeout(() => { this.server.close(), this, this.server.disconnect() }, 5000)
        });

        this.server.on('listening', () => {
          var address = this.server.address();
          console.log(`server listening ${address.address}:${address.port}`);
        });
      })
    })
  }

}