import { MessageHandler } from "./MessageHandler"
import { MessageHandlerEchoTest } from "./MessageHandlerEchoTest"

import { UdpDiscovery } from "./UDP/discovery";

const run = async () => {
    const udpDiscovery = new UdpDiscovery(5002)
    udpDiscovery.listen();

    const msgHandler = new MessageHandler();
    msgHandler.run();

    process.on('uncaughtException', function (err) {
        console.error(err.stack);
    });
}

run();