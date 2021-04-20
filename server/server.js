const { createDebug } = require('./debugger')
const { server } = require('./gql')
require('dotenv').config()
const express = require('express')

const app = express()
server.applyMiddleware({ app })
createDebug('HTTP')


async function start() {
    return await new Promise((resolve, reject) => {
        try {
            app.listen(`${process.env.PORT}`, () => {
                console.log(`Server listening at http://localhost:${process.env.PORT}/graphql`)
                resolve()
            })
        }
        catch (err) {
            rejects(err)
        }
    })
}
module.exports = {
    start
}