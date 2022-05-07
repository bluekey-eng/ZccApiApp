
import * as storage from 'node-persist'
import { resolve } from 'path';
import { log } from '../log';


export class LocalStorage{

    private static instance: LocalStorage;

    public static getInstance(){
        if(!this.instance){
            this.instance = new LocalStorage();
        }
        return this.instance;
    }

    private constructor(){
        storage.init();
    }

    private getStoreKey( deviceId: string, key: string){
        return `${deviceId}_${key}`

    }

    public getItem( deviceId: string, key: string): Promise<any> {
        return new Promise<any>((resolve, reject)=>{
            return storage.getItem(this.getStoreKey(deviceId,key))
            .then(ret => {
                resolve(ret);
    
            })
            .catch(err => {
                log('LocalStorage.getItem failed ' + err.message  )
                resolve(undefined)
            })

        })
    }

    public  setItem( deviceId: string,  key: string, value: any){
        
        const storeKey = this.getStoreKey(deviceId,key)
        return storage.setItem(storeKey, value)
        .then(ret => {
             return ret;

        })
        .catch(err => {
            log('LocalStorage.setItem failed ' + err.message  )
            return (undefined);
        })

    }
}