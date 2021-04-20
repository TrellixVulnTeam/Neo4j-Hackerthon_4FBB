const debug = require('debug')

const main = debug('Server')
async function createDebug(data) {
    return await new Promise((resolve, reject) => {
        resolve(main.extend(data))
    })
}

module.exports = {
    createDebug
}