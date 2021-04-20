const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const verify = require('email-verifier')

async function encryptPassword(password) {
    return await new Promise((resolve, reject) => {
        bcrypt.genSalt(10, function (err, salt) {
            if (salt) {
                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        reject(err)
                    }
                    resolve(hash)
                })
            }
        })
    })
}


async function comparePassword(password, hashedPassword) {
    return await new Promise((resolve, reject) => {
        bcrypt.compare(password, hashedPassword, function (err, res) {
            if (err) {
                reject(err)
            }
            resolve(res)
        })
    })
}


async function createJWT(data) {
    return await new Promise((resolve, reject) => {
        jwt.sign(data, `${process.env.NEO4J_GRAPHQL_JWT_SECRET}`, { expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, function (err, token) {
            if (err) {
                reject(err)
            }
            resolve(token)
        })
    })
}


async function decodeToken(data) {
    return await new Promise((resolve, reject) => {
        jwt.decode(data, `${process.env.NEO4J_GRAPHQL_JWT_SECRET}`, function (err, res) {
            if (err) {
                reject(err)
                console.log(err)
            }
            resolve(res)
        })
    })
}


async function verifyEmail(email) {
    let verifier = new verify(`${process.env.VERIFY_API_KEY}`)
    return await new Promise((resolve, reject) => {
        verifier.verify(email, function (err, data) {
            if (err) {
                reject(err)
            }
            if (data) {
                console.log(data)
            }
        })
    })
}

module.exports = {
    encryptPassword,
    comparePassword,
    createJWT,
    decodeToken,
    verifyEmail
}