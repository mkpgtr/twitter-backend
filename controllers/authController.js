const User = require('../models/User.js');
const { hashPassword, matchPassword } = require('../utilities/auth-utils.js');
const jwt = require('jsonwebtoken');


const register = async(req,res)=>{
    // ! email regular expresssions
    let emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    
    console.log(req.body)
    try {
        
        const {name,email,password,username} = req.body;
        // ! if email is not valid

        console.log(req.body)

        
        if(!emailPattern.test(email)){

            // ! returning is very important
            return res.json({error:'Please enter a valid email'});
        }
        // ! if any field is missing
        if(!name || !email || !password || !username ){
            return res.json({error:'One or more values are missing.'});
        }

        // ! if user exists?
        const alreadyExistingUser = await User.findOne({email});
        const alreadyExistingUserName = await User.findOne({username});

        // ! 200 status code means success
        // ! if user already
        if(alreadyExistingUser){
            return res.json({error:"User already present with this email"});
        }

        if(alreadyExistingUserName){
            return res.json({error:"User already present with this username"});
        }

        const hashedPassword = await hashPassword(password);

        const user = await new User({name,email,password:hashedPassword,username}).save();

        // ! create json web token

        const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'2d'});

        // ! frontend mein yeh data bhejo
        // ! browser me console me dikhega
        // ! abhi lekin postman mein dikhega
        res.json({
            user:{
                name:user.name,
                email:user.email,
                // ! admin, user
                role:user.role, 
                address:user.address,
            },
            token
        });
    } catch (error) {
        console.log(error)
        return res.json({error:error})
    }

    
}


const login = async(req,res)=>{
    
    let emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    try {
        // ! coming from the frontend via axios request
        const {email,password} = req.body;

        console.log(req.body,email)
        // ! if email is not valid
        
        
        if(!emailPattern.test(email)){
            
            // ! returning is very important
            return res.json({error:'Please enter a valid email'});
        }
        // ! if any field is missing
        if(!email || !password ){
            return res.json({error:'One or more values are missing.'});
        }

        // ! if user exists?
        const user = await User.findOne({email});


        // ! 200 status code means success
        // ! if user already
        if(!user){
            return res.json({error:"user not found"});
        }

        const isMatch = await matchPassword(password,user.password);

        if(!isMatch){
            return res.json({error:"Wrong Password"});
        }

        // ! create json web token

        const token = jwt.sign({_id:user._id,name:user.name},process.env.JWT_SECRET,{expiresIn:'10d'});


        
        res.status(200).json({
            user:{
                userId:user._id,
                name:user.name,
                email:user.email,
                // ! admin, user
                role:user.role, 
                joiningDate:user.createdAt,
                username:user.username,
                following:user?.following,
                followers:user?.followers
            },
            token
        });
    } catch (error) {
        return res.json({error:error})
    }

}



module.exports = {register,login}