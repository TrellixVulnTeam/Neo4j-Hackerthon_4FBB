const neo4j = require('neo4j-driver')
const { createDebug } = require('./debugger')
require('dotenv').config()

createDebug("Neo4j")


const driver = neo4j.driver(
    `${process.env.NEO4J_URL}`,
    neo4j.auth.basic(
        `${process.env.NEO4J_USERNAME}`,
        `${process.env.NEO4J_PASSWORD}`
    )
)


async function connect() {
    createDebug('Establishing link to database')
    await driver.verifyConnectivity()
    createDebug('Link Established')
}

async function disconnect() {
    await driver.close()
    createDebug('link closed')
}

module.exports = {
    connect,
    disconnect,
    driver
}