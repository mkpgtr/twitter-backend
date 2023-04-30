const Tweet = require('../models/Tweet.js');
const User  = require('../models/User.js')
const mongoose = require('mongoose');
const fs = require('fs')
const cloudinaryUploadImg = require('../utilities/uploadToCloudinary.js');

const getAllUsers = async(req,res)=>{

}


const getSingleUser = async(req,res)=>{
    const {id} = req.params;
    console.log(id)
    const tweetsByThisUser = await Tweet.find({tweetedBy:id})

    const user = await User.findOne({_id:id}).select('-password');

    res.json({user,tweetsByThisUser})
}

const followUserController = async(req,res)=>{

    const {follower,toFollow} = req.params;



    const alreadyFollowed = await User.findOne({"followers.user":follower,_id:toFollow})

    if(alreadyFollowed){
        // return res.json({message:"You have already followed"});

        const userToUnfollow = await User.findOneAndUpdate({_id:toFollow},{
            $pull:{
                followers:{
                    user:new mongoose.Types.ObjectId(req.user.userId)
                }
            }
        },{new:true});

        const userToRemoveFromFollowingArray = await User.findOneAndUpdate({_id:req.user.userId},{
            $pull:{
                following:{
                    user:new mongoose.Types.ObjectId(toFollow)
                }
            }
        },{new:true})

        return res.status(200).json({userToUnfollow,userToRemoveFromFollowingArray})
    }

    const userToFollow = await User.findOneAndUpdate({_id:toFollow},{
        $push:{
            followers:{
                user:req.user.userId
            }
        }
    },{new:true});

    console.log(req.user)
    const userWhoFollowed = await User.findOneAndUpdate({_id:req.user.userId},{
        $push:{
            following:{
                user:new mongoose.Types.ObjectId(toFollow.toString())
            }
        }
    },{new:true})

    res.status(200).json({userToFollow,userWhoFollowed})
}



const getLoggedInUserDetails = async(req,res)=>{

    const loggedInUser = await User.findOne({_id:req.user.userId}).select('-password');


    res.json(loggedInUser)
}


const uploadProfilePicture = async(req,res)=>{
    res.json({message:'upload profile picture'})
}

const uploadImageToCloud = async(req,res)=>{

    // console.log(req.file,'yeh mera request hai aur latest bhi');

    console.log('upload image to cloud')
    if(req?.file){

        const localPath = `uploads/profilePhoto/${req?.file.filename}`
        console.log(localPath,'localpath')
        
        const result = await cloudinaryUploadImg(localPath)
        console.log(result)
        
        
        
        fs.unlinkSync(localPath)
        const findUserToUpdateProfilePicture = await User.findByIdAndUpdate({_id:req.user.userId},{
            profile_picture:result.url
        })
         return res.json({imgURL:result});
    }

    // ! ma'am actually I started the project by adding fea
    // const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
    //     use_filename: true,
    //     folder: `twitter/${}`
    // });

    res.json({imgURL:""})

}
// ! i used the word directly here because I am not adding /:id to the route in routes/users.js that triggers this controller
const getSingleUserDirectly = async(req,res)=>{


    const user = await User.findOne({_id:req.user.userId}).select('-password');

    const tweets = await Tweet.find({tweetedBy:req.user.userId}).populate('tweetedBy').sort({createdAt:"desc"})

    const allReplies = await Tweet.find({isAReply:true,tweetedBy:req.user.userId})


    res.json({user,allReplies,tweets});
}

const updateUserProfileDetails = async(req,res)=>{
    const {id} = req.params;
    const {name,location,date_of_birth} = req.body;

    if(!name || !location || !date_of_birth){ 
        return res.json({error:"please enter all the fields"}).status(404)
    }

    console.log(req.body,"req.body")
    
    try {
    const token = req.headers.authorization.split(' ')[1]
    console.log(req.body,token,id)
    const userAlreadyExists = await User.findOne({_id:id}).select('-password')

    if(!userAlreadyExists){
        return res.json({error:"user does not exist"}).status(409)
    }

    

    const editedUser = await User.findByIdAndUpdate({_id:id},{
        name:name ? name : userAlreadyExists?.name,
        location:location ? location : userAlreadyExists?.location,
        DateOfBirth: new Date(date_of_birth) ? date_of_birth : userAlreadyExists?.DateOfBirth

    },{new:true})
    console.log(editedUser,userAlreadyExists?.DateOfBirth)

    res.json({user:{
        userId:userAlreadyExists._id,
        name:editedUser?.name || userAlreadyExists.name,
        email:userAlreadyExists?.email,
        DateOfBirth:editedUser?.DateOfBirth || userAlreadyExists.DateOfBirth,
        location:editedUser?.location ||  userAlreadyExists.location,
        role:userAlreadyExists?.role, 
        joiningDate:userAlreadyExists?.createdAt,
        username:userAlreadyExists?.username,
        following:userAlreadyExists?.following,
        followers:userAlreadyExists?.followers
    },token});
    } catch (error) {
       console.log(error) 
    }
}

module.exports = {updateUserProfileDetails,getSingleUserDirectly,getSingleUser,followUserController,getLoggedInUserDetails,uploadProfilePicture,uploadImageToCloud}