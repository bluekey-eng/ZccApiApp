import { DeviceList } from "../Devices/DeviceList";
import { ZimiEvents } from "../Events/ZimiEvents";
import { log } from "../log";
import { Messages } from "../messages";
import { AppStorage } from "../Storage/AppStorage";


const appId = '_g2RkgNN';
const appToken = 'd2a49da8-b3e1-4957-ac4a-bd25a62e99dd'

interface IStates {
    propertiesRequested: boolean;
    statesRequested: boolean;
    actionsRequested: boolean;

    sendActionsStarted: boolean;
}

export class ZccApiProcessor {
    //     const actions = this.deviceList.toggleOnOffAllMessages(true);
    //     this.sendMessage(Messages.getCPSetActions(actions));
    //     setTimeout(() => {
    //         const actions = this.deviceList.toggleOnOffAllMessages(false);
    //         this.sendMessage(Messages.getCPSetActions(actions));
    //     }, 10000)
    // }, 20000)

    private appStorage: AppStorage;
    private deviceList: DeviceList;
    private states: IStates;
    private zimiEventEmitter: ZimiEvents;
    constructor(eventEmitter: ZimiEvents, zccMac: string) {
        this.zimiEventEmitter = eventEmitter;
        this.appStorage = new AppStorage(zccMac);
        this.deviceList = new DeviceList();
        this.states = {
            propertiesRequested: false,
            statesRequested: false,
            actionsRequested: false,
            sendActionsStarted: false
        }


        // this.messageReceiveHandler.bind(this);


    }

    public requestDetails() {
        this.sendMessage(Messages.getCPPropertiesMessage())
        this.sendMessage(Messages.getCPPropertiesCountMessage())
        this.sendMessage(Messages.getCPStateMessage())
    }

    public async initSession() {
        const accessToken = await this.appStorage.getItem('accessToken')
        this.appStorage.getItem('deviceMac')
            .then(deviceMac => {
                this.sendMessage(Messages.startSessionMessage(appId, accessToken, deviceMac));
            })
    }

    private messageReceiveHandler(message: any) {

        if (message) {
            const responseData = message.response;

            if (responseData.auth_app_success) {

                const accessToken = responseData.auth_app_success.accessToken;
                if (accessToken) {
                    this.appStorage.setItem('accessToken', accessToken)
                        .then(ret => {
                            this.appStorage.getItem('deviceMac')
                                .then(deviceMac => {
                                    this.sendMessage(Messages.startSessionMessage(appId, accessToken, deviceMac));
                                })
                        })

                }
            }
            if (responseData.start_session_success) {

                if (this.states.propertiesRequested === false) {
                    this.sendMessage(Messages.getCPPropertiesMessage())
                    this.sendMessage(Messages.getCPPropertiesCountMessage())
                    this.states.propertiesRequested = true;
                }
            }
            if (responseData.controlpoint_properties) {

                responseData.controlpoint_properties.forEach((devProps: any) => {
                    this.deviceList.addDevice(devProps.id)
                    this.deviceList.setDeviceProps(devProps.id, devProps.properties)
                })

                if (this.states.statesRequested === false) {
                    this.sendMessage(Messages.getCPStateMessage());
                    this.states.statesRequested = true;
                }
            }
            else if (responseData.controlpoint_actions) {
                if (this.states.actionsRequested === false) {
                    this.sendMessage(Messages.getCPActionsMessage());
                    this.states.actionsRequested = true;
                }
            }
            else if (responseData.controlpoint_states) {

                const states = responseData.controlpoint_states;
                states.forEach((devStates: any) => {
                    this.deviceList.addDevice(devStates.id)
                    this.deviceList.setDeviceStates(devStates.id, devStates.states)
                })
                this.deviceList.displayDeviceStatus()
            }
            else if (responseData.controlpoint_states_events) {

                responseData.controlpoint_states_events.forEach((devStates: any) => {
                    this.deviceList.addDevice(devStates.id)
                    this.deviceList.setDeviceStates(devStates.id, devStates.states)
                })
                this.deviceList.displayDeviceStatus();
                if (this.states.sendActionsStarted === false) {
                    this.states.sendActionsStarted = true;

                    // setInterval(() => {

                    //     // this.deviceList.displayDeviceStatus();

                    //     // const actions = this.deviceList.toggleOnOffMessages();
                    //     // this.clientSocket.sendData(Messages.getCPSetActions(actions));

                    //     // actions.forEach(action =>{
                    //     //     this.clientSocket.sendData(Messages.getCPSetActions([action]));
                    //     // })


                    //     const actions = this.deviceList.toggleOnOffAllMessages(true);
                    //     this.sendMessage(Messages.getCPSetActions(actions));
                    //     setTimeout(() => {
                    //         const actions = this.deviceList.toggleOnOffAllMessages(false);
                    //         this.sendMessage(Messages.getCPSetActions(actions));
                    //     }, 10000)

                    // }, 20000)
                }
            }

            // this.messageSendHandler();
        }
    }

    private processReceivedEvents() {
        this.zimiEventEmitter.onReceiveApiMessage((message, messageType) => {
            this.messageReceiveHandler(message);
        })
    }

    private sendMessage(message: object) {
        this.zimiEventEmitter.sendApiMessage(message, 'auth_app'); // TODO messageType
    }

    public run() {
        this.processReceivedEvents();

        this.appStorage.getItem('deviceMac')
            .then(deviceMac => {
                if (deviceMac === undefined) {
                    deviceMac = '00000000000A';
                }

                this.appStorage.getItem('accessToken')
                    .then(accessToken => {

                        if (!accessToken) {

                            this.sendMessage(Messages.getAuthAppMessage(appId, appToken, deviceMac))
                        } else {
                            this.sendMessage(Messages.startSessionMessage(appId, accessToken, deviceMac))
                        }
                    })
                    .catch(err => {
                        log('appStorage.getItem error ' + err.message)
                    })

            })

    }
}