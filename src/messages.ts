
export class Messages{

    public static startSessionMessage(){

        const message = {"request":{"type":"start_session","params":{"appId":"_g2RkgNN", "deviceMac": "0123456789B4", "accessToken":"0f5ffb2fb2304c33bd4d6a205a7266c7"}}}
        return JSON.stringify(message);
    }

    public static getCPPropertiesMessage(){
        const message = {request: {path: 'api/v1/controlpoint/properties'}}
        return JSON.stringify(message);
    }

    public static getCPStateMessage(){
        const message = {request: {path: 'api/v1/controlpoint/states'}}
        return JSON.stringify(message);
    }

    public static getCPActionsMessage(){
        const message = {request: {path: 'api/v1/controlpoint/actions',  method: 'GET'}}
        return JSON.stringify(message);
    }

    public static getCPPropertiesSubscribeMessage(){
        const message = {request: {path: 'api/v1/subscribe/controlpoint/properties'}}
        return JSON.stringify(message);
    }

    public static getCPStateSubscribeMessage(){
        const message = {request: {path: 'api/v1/subscribe/controlpoint/states'}}
        return JSON.stringify(message);
    }

    public static getCPPropertiesUnSubscribeMessage(){
        const message = {request: {path: 'api/v1/unsubscribe/controlpoint/properties'}}
        return JSON.stringify(message);
    }

    public static getCPStateUnSubscribeMessage(){
        const message = {request: {path: 'api/v1/unsubscribe/controlpoint/states' , method: 'GET'}}
        return JSON.stringify(message);
    }

    public static getCPSetActions( actions: any){
        const message = {request: {path: 'api/v1/controlpoint/actions', method: 'POST', body: { actions} }}
        return JSON.stringify(message);
    }

    public static getEchoMessage( counter: number){
        const message = {request: {path: 'api/v1/echo', method: 'POST', body: { counter} }}
        return JSON.stringify(message) ;
    }
}