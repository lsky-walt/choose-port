const net = require("net")
const os = require("os")

// 端口队列
const PORTS = []

const DEFAULT_PORT = 8000
const TOP_PORT = 65535
let MAX_PORT = 65535

// 检查指定端口是否被占用
function portIsOccupied(port, h) {
  return new Promise((resolve) => {
    const server = net.createServer().listen(port, h)
    function onListen() {
      server.removeListener("error", onError)
      server.close()
      resolve(port)
    }

    function onError(err) {
      server.removeListener("listening", onListen)
      if (err.code === "EADDRINUSE") {
        resolve(err)
        return
      }
      resolve(port)
    }
    server.once("listening", onListen)

    server.once("error", onError)
  })
}

// 循环检查端口
async function loopCheckPortInHostList(port, hosts) {
  let t = null
  for (const host of hosts) {
    t = await portIsOccupied(port, host)
    if (t instanceof Error) {
      break
    }
  }
  return t
}

async function checkPorts(hosts) {
  let p = null
  for (const port of PORTS) {
    if (port > MAX_PORT) {
      p = new Error("所有端口被占用，请重试！")
      throw p
    }
    p = await loopCheckPortInHostList(port, hosts)
    if (p instanceof Error) {
      PORTS.push(port + 1)
    }
  }
  return p
}

/**
 * 挑选一个可用端口
 * @param {number} userPort 从 userPort 开始检查端口是否被占用
 * @param {number} limit 限制检查多少个端口
 */
async function choosePort(userPort, limit) {
  try {
    const networks = os.networkInterfaces()
    let hosts = new Set([undefined, "0.0.0.0"])
    Object.keys(networks).map((k) => {
      networks[k].forEach((item) => {
        hosts.add(item.address)
      })
    })

    PORTS.push(userPort || DEFAULT_PORT)

    if (typeof limit === "number") {
      MAX_PORT = (userPort || DEFAULT_PORT) + limit
    }

    const port = await checkPorts(hosts)
    MAX_PORT = TOP_PORT
    return port
  } catch (err) {
    MAX_PORT = TOP_PORT
    throw err
  }
}

module.exports = choosePort
