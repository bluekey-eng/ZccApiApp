# ZccApiApp

## To install

please install nodejs version 12.18 and yarn

then below command to install
```
yarn install
```

use below command to run 
```
yarn start
```

## Functionality

The demo app will fetch the controlpoint properties, control point states and store in a device list. 
Will subscribe for control point state updates.
When states are received, will udpate the state in the device list

Every 10 seconds, all the devices in the network will be toggled on and off. ( off device will be on , on devices will be off) 
