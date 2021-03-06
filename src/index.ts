// import { ZccApiClient } from "./Client/ZccApiClient";
import { ComponentStore } from "./ComponentStore";

// import { UdpDiscovery } from "./UDP/discovery";
import { WSControlServer } from "./WS/controlServer";
// import { WSServer } from "./WS/server";


const run = async () => {

    const ws = new WSControlServer(8080);


    process.on('uncaughtException', function (err) {
        console.error(err.stack);
    });
}

run();