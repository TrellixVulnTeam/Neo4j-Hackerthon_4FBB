const { driver } = require('../neo4j')
const { ApolloServer } = require('apollo-server-express')
const { Neo4jGraphQL } = require('@neo4j/graphql')
const { OGM } = require('@neo4j/graphql-ogm')
const { Schema } = require('./Schema')
require('dotenv').config()

const typeDefs = [Schema.typeDefs]

const resolvers = {
    ...Schema.resolvers
}

const ogm = new OGM({
    typeDefs,
    resolvers,
    driver,
    debug: `${process.env.NODE_ENV}`,
})


const neoSchema = new Neo4jGraphQL({
    typeDefs,
    resolvers,
    driver,
    debug: `${process.env.NODE_ENV}`
})


const server = new ApolloServer({
    schema: neoSchema.schema,
    context: ({ req }) => ({ ogm, driver, req })
})

module.exports = {
    server
}