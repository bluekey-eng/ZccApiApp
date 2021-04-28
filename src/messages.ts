
export class Messages{

    public static getCPPropertiesMessage(){
        const message = {request: {path: 'api/v1/controlpoint/properties'}}
        return JSON.stringify(message);
    }

    public static getCPStateMessage(){
        const message = {request: {path: 'api/v1/controlpoint/states'}}
        return JSON.stringify(message);
    }

    public static getCPActionsMessage(){
        const message = {request: {path: 'api/v1/controlpoint/actions'}}
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
        const message = {request: {path: 'api/v1/unsubscribe/controlpoint/states'}}
        return JSON.stringify(message);
    }

    public static getCPSetActions( actions: any){
        const message = {request: {path: 'api/v1/controlpoint/actions', method: 'POST', body: { actions} }}
        return JSON.stringify(message);
    }
}