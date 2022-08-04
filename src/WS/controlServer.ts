
import { WebSocketServer } from 'ws'
import { ComponentStore } from '../ComponentStore';
// import { ZimiEvents } from '../Events/ZimiEvents';
import { log } from '../log';
import { UdpDiscovery } from '../UDP/discovery';

export class WSControlServer {
    private componentStore: ComponentStore;
    private discovery: UdpDiscovery;
    private wsServer: WebSocketServer;
    constructor(port: number) {
        this.componentStore = new ComponentStore();

        this.discovery = new UdpDiscovery(5002);
        this.discovery.listen();

        this.wsServer = new WebSocketServer({ port })

        this.wsServer.on('connection', (ws, request) => {

            log('wsServer connection ')

            ws.on('message', (messageRaw) => {
                log('ws message received - ' + messageRaw.toString())

                let requestObj: any = {};
                try {
                    requestObj = JSON.parse(messageRaw.toString())
                } catch (err) {
                    ws.send(JSON.stringify({ error: 'not a json request : ' + err.message }))
                }


                if (requestObj.request.type === 'discover') {
                    this.getDiscovery().getEvents().discoverZcc();
                }
                if (requestObj.request.type === 'connectzcc') {
                    const clientParams = requestObj.request.params;

                    const clientCheck = this.componentStore.getZccClient(clientParams.mac);
                    let client;
                    if (!clientCheck) {

                        this.componentStore.addZccClient(clientParams.host, clientParams.port, clientParams.mac)
                        client = this.componentStore.getZccClient(clientParams.mac);
                        client.run();
                    } else {
                        // ws.send(JSON.stringify({ error: 'zcc already connected' }))

                        client = this.componentStore.getZccClient(clientParams.mac);
                        client.requestDetails();
                    }
                    const eventEmitter = client.getEventEmitter();

                    eventEmitter.onReceiveApiMessage((message: any, messageType) => {
                        const newMessagee =
                        {
                            type: 'receivedmessage',
                            data: message,
                            mac: clientParams.mac
                        };

                        ws.send(JSON.stringify(newMessagee));
                    })


                    eventEmitter.onSendApiMessage((message: any, messageType) => {
                        const newMessagee =
                        {
                            type: 'sentmessage',
                            data: message,
                            mac: clientParams.mac
                        }; ws.send(JSON.stringify(newMessagee));
                    })

                }
                if (requestObj.request.type === 'disconnectzcc') {
                    const clientParams = requestObj.request.params;

                    const clientCheck = this.componentStore.getZccClient(clientParams.mac);
                    if (clientCheck) {

                        // const client = this.componentStore.getZccClient(clientParams.mac);
                        // client.stop();

                        // this.componentStore.removeZccClient(clientParams.mac)
                    } else {
                        ws.send(JSON.stringify({ error: 'zcc not found' }))
                    }
                }
                if (requestObj.request.type === 'sendmessage') {
                    const clientParams = requestObj.request.params;
                    const mac = clientParams.mac;
                    const message = clientParams.message;

                    const client = this.componentStore.getZccClient(clientParams.mac);
                    client.getEventEmitter().sendApiMessage(message, 'auth_app');
                }
            })

            this.getDiscovery().getEvents().onFoundZcc(data => {
                ws.send(JSON.stringify({ type: 'foundzcc', data }));
            })

            // ws.send('connected')
        })
    }

    private getDiscovery() {
        return this.discovery;
    }

    public run() {
    }
}


/*

{
    "request": {
        "type": "discover"
    }
}

{
    "request": {
        "type": "connectzcc",
        "params": {
            "host": "192.168.86.120",
            "port": 5003,
            "mac": "c4ffbc90a6fb"
        }
    }
}

{
    "request": {
        "type": "sendmessage",
        "params": {
            "mac": "c4ffbc90a6fb",
            "message": {"request": {"path": "api/v1/controlpoint/properties","method": "GET"}}
        }
    }
}

{
    "request": {
        "type": "sendmessage",
        "params": {
            "mac": "c4ffbc90a6fb",
            "message": {"request": {"path": "api/v1/controlpoint/states","method": "GET"}}
        }
    }
}


*/