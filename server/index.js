const { createDebug } = require('./debugger')
const { connect } = require('./neo4j')
const { start } = require('./server')

createDebug("Application")
async function main() {
    createDebug('Starting')
    await connect()
    await start()
    createDebug('started')
}

main()