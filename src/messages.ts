
export class Messages {


    public static getAuthAppMessage(appId: string, appToken: string, deviceMac: string) {

        const message = { request: { type: "auth_app", params: { appId, deviceMac, appToken } } }
        return message;
        // return message;
    }

    public static startSessionMessage(appId: string, accessToken: string, deviceMac: string) {

        const message = { request: { type: "start_session", params: { appId, deviceMac, accessToken } } }
        return message;
    }

    public static getCPPropertiesMessage() {
        const message = { request: { path: 'api/v1/controlpoint/properties' } }
        return message;
    }

    public static getCPStateMessage() {
        const message = { request: { path: 'api/v1/controlpoint/states' } }
        return message;
    }

    public static getCPActionsMessage() {
        const message = { request: { path: 'api/v1/controlpoint/actions', method: 'GET' } }
        return message;
    }

    public static getCPPropertiesSubscribeMessage() {
        const message = { request: { path: 'api/v1/subscribe/controlpoint/properties' } }
        return message;
    }

    public static getCPStateSubscribeMessage() {
        const message = { request: { path: 'api/v1/subscribe/controlpoint/states' } }
        return message;
    }

    public static getCPPropertiesUnSubscribeMessage() {
        const message = { request: { path: 'api/v1/unsubscribe/controlpoint/properties' } }
        return message;
    }

    public static getCPStateUnSubscribeMessage() {
        const message = { request: { path: 'api/v1/unsubscribe/controlpoint/states', method: 'GET' } }
        return message;
    }

    public static getCPSetActions(actions: any) {
        const message = { request: { path: 'api/v1/controlpoint/actions', method: 'POST', body: { actions } } }
        return message;
    }

    public static getEchoMessage(counter: number) {
        const message = { request: { path: 'api/v1/echo', method: 'POST', body: { counter } } }
        return message;
    }
}