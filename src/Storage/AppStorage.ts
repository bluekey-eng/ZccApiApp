import { log } from "../log"
import { LocalStorage } from "./LocalStorage"

export type Element = 'deviceMac' | 'accessToken'

export class AppStorage{

    private deviceId: string;
    constructor(deviceId: string){
        LocalStorage.getInstance();
        this.deviceId = deviceId;
    }

    public getItem(element: Element): Promise<any>{
        return new Promise<any>((resolve, reject)=>{            
            LocalStorage.getInstance().getItem( this.deviceId, element)
            .then( ret => {
                if(ret === undefined && element === 'deviceMac'){
                    const mac = this.genMAC();
                    this.setItem(element, mac)
                    .then( ret => {
                        resolve(mac);
                    })
                    .catch(err => {
                        resolve(undefined)
                    })                    
                }else{
                    resolve(ret)
                }
            })

        })
    }

    public setItem(element: Element, value: any): Promise<any> {
        return new Promise<any> ((resolve, reject)=>{
            LocalStorage.getInstance().setItem(this.deviceId, element, value)
            .then(ret =>{
                resolve(ret)
            }).catch(err => {
                log( 'AppStorage setItem error ' + err.message)
                resolve(undefined)
            })
        })

    }


    private genMAC(){
        var hexDigits = "0123456789ABCDEF";
        var macAddress = "";
        for (var i = 0; i < 6; i++) {
            macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
            macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
            if (i != 5) macAddress += "";
        }
    
        return macAddress;
    }

}