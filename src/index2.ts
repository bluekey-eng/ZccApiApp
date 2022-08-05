
import { Command } from 'commander';
import { UdpDiscovery } from './UDP/discovery';
import { IFoundZccData } from './Events/ZimiDiscoveryEvents';
import { ZccApiClient } from './Client/ZccApiClient';
import { receiveLog, sendLog, successLog } from './log';
import { Messages } from './messages';
// 

const run = () => {
    // getParams();
    runCommands();
}

const getParams = async () => {
    const program = new Command();

    program
        .option('-d', '--discover', 'discover ZCCs on the network')
        .option('-c', '--connect', 'connect to a zcc ')
        .option('-h', '--host <value>', 'host ip address')
        .parse(process.argv);

    const options = program.opts();
    console.log(options)
    if (options.d === true) {
        const zccs = await runDiscover();
        console.log(`zccs returned ${JSON.stringify(zccs)}`)
    }
    if (options.c === true && options.h) {
        const host = options.h;
        runStartSession(host, 'mac');
    }
}


const runCommands = async () => {
    const program = new Command();

    program
        .command('d')
        .description('discover')
        .action(async () => {
            const zccs = await runDiscover();
            successLog(`zccs returned ${JSON.stringify(zccs)}`)
        })

    program
        .command('c')
        .description('connect')
        .argument('<ip>', 'ip address of zcc')
        .action(async (ip) => {
            runStartSession(ip, 'mac')
                .then(response => {
                    successLog(JSON.stringify(response))
                })

        })

    program
        .command('e')
        .description('execute action')
        .argument('<ip>', 'ip address of zcc')
        .argument('<cpid>', 'controlpoint id for the action')
        .argument('<action>', 'action type')
        .argument('<actionParam>', 'action parameter')
        .action((zccIp: string, cpid: string, action: string, actionParam: string) => {
            runExecuteAction(zccIp, 'mac', cpid, action, actionParam )

        })

    program.parse(process.argv)

}

const runDiscover = async () => {
    return new Promise<IFoundZccData[]>(async (resolve) => {

        const discovery = new UdpDiscovery(5002)
        discovery.listen();

        const zccs: IFoundZccData[] = [];
        discovery.getEvents().onFoundZcc((foundzcc: IFoundZccData) => {
            // console.log('found zcc - ' + foundzcc);
            zccs.push(foundzcc);
        })

        setTimeout(() => {
            discovery.getEvents().removeAllListeners();
            discovery.stopListening();
            setTimeout(() => {
                resolve(zccs)
            }, 100)
        }, 1000)

        discovery.getEvents().discoverZcc()
    })
}

const runStartSession = async (zccIp: string, zccMac: string) => {
    return new Promise((resolve) => {
        const zccClient = new ZccApiClient({ zccIp, zccMac, zccPort: 5003 })
        const properties: any[] = [];
        const states: any[] = [];

        zccClient.getEventEmitter().onReceiveApiMessage((message, messageType) => {
            receiveLog(`received - ${JSON.stringify({ message, messageType })}`)
            if (messageType === 'start_session_success') {
                zccClient.requestProperties();
                zccClient.requestState();
            }

            if (messageType === 'properties') {
                properties.push(message);
            }
            if (messageType === 'states') {
                states.push(message)
            }
        })

        zccClient.getEventEmitter().onSendApiMessage((message, messageType) => {
            sendLog(`sent - ${JSON.stringify({ message, messageType })}`)

        })

        zccClient.runInitSession()

        setTimeout(() => {
            zccClient.stop();
            resolve({ properties, states })
        }, 400)
    })
}

const runExecuteAction = async (zccIp: string, zccMac: string, cpid: string, action: string, actionParam: string) => {
    return new Promise((resolve) => {
        const zccClient = new ZccApiClient({ zccIp, zccMac, zccPort: 5003 })

        zccClient.getEventEmitter().onReceiveApiMessage((message, messageType) => {
            receiveLog(`received - ${JSON.stringify({ message, messageType })}`)
            if (messageType === 'start_session_success') {
                const actionBody = [{
                    id: cpid,
                    action
                }];
                zccClient.getEventEmitter().sendApiMessage(Messages.getCPSetActions(actionBody), 'setAction')
            }
        })

        zccClient.getEventEmitter().onSendApiMessage((message, messageType) => {
            sendLog(`sent - ${JSON.stringify({ message, messageType })}`)

        })

        zccClient.runInitSession()

        setTimeout(() => {
            zccClient.stop();
            resolve
        }, 400)
    })
}

run()