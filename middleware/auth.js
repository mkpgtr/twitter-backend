
const jwt = require('jsonwebtoken')

const isUserAuthenticated = async (req,res,next)=>{
  // ! headers coming from axios
    const authHeader = req.headers.authorization;

    // ! current user is hidden in this string



    if (!authHeader || !authHeader.startsWith('Bearer')) {
      console.log('jwt problem')
        return res.json({error:'Invalid token is there'})
      }
      // ! removes the word "Bearer" and so only the token string is left
      const token = authHeader.split(' ')[1]

      try {
        const dataComingInTheToken = jwt.verify(token, process.env.JWT_SECRET)
        // attach the user to the job routes
        req.user = { userId: dataComingInTheToken._id, name: dataComingInTheToken.name }
        next()
        
      } catch (error) {
        return res.json({error:error})
      }
}



module.exports = {isUserAuthenticated}