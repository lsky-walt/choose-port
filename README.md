# choose-port
> Get an available port.

## Install

```shell
$ npm i @lsky/choose-port
```

or

```shell
$ yarn add @lsky/choose-port
```


## Use
```javascript
const choosePort = require("@lsky/choose-port")

choosePort().then(port => {
  console.log(port)
}).catch(err => {
  console.error(err)
})
```


## Environment

only use in **Node**.