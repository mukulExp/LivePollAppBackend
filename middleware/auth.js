const jwt = require('jsonwebtoken');
const User = require('../models/users');

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
        
        const decodedId = jwt.verify(bearerToken, process.env.JWT_HASH)
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
        return res.status(401).send({
          status: false,
          message: 'Token is Invalid'
        })
    }
}