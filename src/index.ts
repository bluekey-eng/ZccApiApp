import { MessageHandler } from "./MessageHandler"
import { MessageHandlerEchoTest } from "./MessageHandlerEchoTest"

import { UdpDiscovery } from "./UDP/discovery";

// const zccIp = '192.168.0.95';
// const zccIp = '172.20.10.11'
// const zccIp = '192.168.1.139'
const zccIp = '192.168.86.120';
const zccPort = 5003;
const zccMac = 'testmac1';

const run = async () => {
    const udpDiscovery = new UdpDiscovery(5002)
    udpDiscovery.listen();

    const msgHandler = new MessageHandler(zccIp, zccPort, zccMac);
    msgHandler.run();

    process.on('uncaughtException', function (err) {
        console.error(err.stack);
    });
}

run();