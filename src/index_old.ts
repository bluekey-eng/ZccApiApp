import { ZccApiClient } from "./Client/ZccApiClient";
// import { MessageHandler } from "./MessageHandler"
// import { MessageHandlerEchoTest } from "./MessageHandlerEchoTest"

import { UdpDiscovery } from "./UDP/discovery";
// import { WSServer } from "./WS/server";

// const zccIp = '192.168.0.95';
// const zccIp = '172.20.10.11'
// const zccIp = '192.168.1.139'
const zccIp = '192.168.86.130';
const zccPort = 5003;
const zccMac = 'testmac1';

const run = async () => {
    const udpDiscovery = new UdpDiscovery(5002)
    udpDiscovery.listen();

    udpDiscovery.getEvents().onFoundZcc((data => {
        console.log('found zcc ' + JSON.stringify(data));
    }))

    udpDiscovery.getEvents().discoverZcc()

    // setInterval(() => {
    //     udpDiscovery.getEvents().discoverZcc()
    // }, 10000)

    const msgHandler = new ZccApiClient({zccIp, zccPort, zccMac});
    msgHandler.run();

    // const wsServer = new WSServer( 8080, msgHandler.getEventEmitter());


    process.on('uncaughtException', function (err) {
        console.error(err.stack);
    });
}

run();