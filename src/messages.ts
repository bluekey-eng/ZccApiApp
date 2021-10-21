
export class Messages {


    public static getAuthAppMessage(appId: string, appToken: string, deviceMac: string) {

        const message = { request: { type: "auth_app", params: { appId, deviceMac, appToken } } }

        return JSON.stringify(message);
    }

    public static startSessionMessage(appId: string, accessToken: string, deviceMac: string) {

        const message = { request: { type: "start_session", params: { appId, deviceMac, accessToken } } }
        return JSON.stringify(message);
    }

    public static getCPPropertiesMessage() {
        const message = { request: { path: 'api/v1/controlpoint/properties' } }
        return JSON.stringify(message);
    }

    public static getCPStateMessage() {
        const message = { request: { path: 'api/v1/controlpoint/states' } }
        return JSON.stringify(message);
    }

    public static getCPActionsMessage() {
        const message = { request: { path: 'api/v1/controlpoint/actions', method: 'GET' } }
        return JSON.stringify(message);
    }

    public static getCPPropertiesSubscribeMessage() {
        const message = { request: { path: 'api/v1/subscribe/controlpoint/properties' } }
        return JSON.stringify(message);
    }

    public static getCPStateSubscribeMessage() {
        const message = { request: { path: 'api/v1/subscribe/controlpoint/states' } }
        return JSON.stringify(message);
    }

    public static getCPPropertiesUnSubscribeMessage() {
        const message = { request: { path: 'api/v1/unsubscribe/controlpoint/properties' } }
        return JSON.stringify(message);
    }

    public static getCPStateUnSubscribeMessage() {
        const message = { request: { path: 'api/v1/unsubscribe/controlpoint/states', method: 'GET' } }
        return JSON.stringify(message);
    }

    public static getCPSetActions(actions: any) {
        const message = { request: { path: 'api/v1/controlpoint/actions', method: 'POST', body: { actions } } }
        return JSON.stringify(message);
    }

    public static getEchoMessage(counter: number) {
        const message = { request: { path: 'api/v1/echo', method: 'POST', body: { counter } } }
        return JSON.stringify(message);
    }
}