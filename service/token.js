const jwt = require('jsonwebtoken')
const config = require('../config/config')

module.exports = {
    generateToken (id) {
        const token = jwt.sign({id},  config.jwt_hash, { expiresIn: '30d' })
        return token
    }
}