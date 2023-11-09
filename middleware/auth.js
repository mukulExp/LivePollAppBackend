const jwt = require('jsonwebtoken');
const User = require('../models/users');
const config = require('../config/config')


module.exports = async (req, res, next) => {
    try {
        if(!req.headers['authorization'])
            return res.status(401).send({
              status: false,
              message: 'Unauthorized'
            })
        const bearerToken = req.headers['authorization'].split(' ')[1]
        if(!bearerToken) 
            return res.status(401).send({
              status: false,
              message: 'Unauthorized'
            })
        
        const decodedId = jwt.verify(bearerToken,config.jwt_hash)
        const user = await User.findOne({_id: decodedId.id}).select('-token -password')
        if(!user)
            return res.status(401).send({
              status: false,
              message: 'Unauthorized'
            })

        req.user = user
        next()
    }
    catch (err) {
        console.log(err.message)
        return res.status(401).send({
          status: false,
          message: 'Token is Invalid'
        })
    }
}