import { MessageHandler } from "./MessageHandler"
import { MessageHandlerEchoTest } from "./MessageHandlerEchoTest"

import { UdpDiscovery } from "./UDP/discovery";

const run = async () =>{
    // const udpDiscovery = new UdpDiscovery(5002)
    // udpDiscovery.listen();

    const msgHandler = new MessageHandlerEchoTest();
    msgHandler.run();
}

run();