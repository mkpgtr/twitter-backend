const Tweet = require('../models/Tweet.js');
const cloudinary = require('cloudinary');
const cloudinaryUploadImg = require('../utilities/uploadToCloudinary.js');
const fs = require('fs')
const mongoose = require('mongoose')
const createTweet = async(req,res)=>{
    // ! https://stackoverflow.com/questions/7878557/cant-find-documents-searching-by-objectid-using-mongoose





    
    const {tweet,image} = req.body;

    if(!tweet.content){
        return res.json({error:"Please Enter something to tweet"})
    }

    const createdTweet = await new Tweet({
        content:tweet.content,
        tweetedBy:new mongoose.Types.ObjectId(req?.user?.userId),
        image:image
    }).save()
    

    

    // const tweet = await new Tweet(req.body).save();
    
    
    res.json({tweet:createdTweet})


}


const getAllTweets = async(req,res)=>{

    // ! sort by latest posts

    const tweets = await Tweet.find({}).populate('tweetedBy').populate('thisTweetIsRetweetedBy').populate('likes').sort({createdAt:'-1'})

    res.json({tweets})
}

const deleteTweet = async(req,res)=>{
    try {
        const {id} = req.params;

       

        const findThisTweet = await Tweet.find({_id:id,isAReply:true})
        // console.log(findThisTweet),"findThisTweet"

       
    
        // const deleteComments = await Tweet.findByIdAndUpdate({_id:id},{
        //     $set:{
        //         comments:[

        //         ],
        //         replies:[

        //         ]
        //     }
        // })
    
    const tweet = await Tweet.findOne({_id:id})
    
    
   

    
   
    

    



const tweetReplies = await Tweet.findOne({_id:id}).populate('replies.reply').select('replies')
    

// ! map over the replies array and create a new array of ObjectIds
const tweetReplyIDs = tweetReplies.replies.map((reply)=> {
    return reply?.reply?._id
})

// ! delete the tweet in the replies array
const deleteTweetReplies = await Tweet.deleteMany({_id:{
    $in:tweetReplyIDs
}})



 // ! this will give {acknowledged:true,deletedCount:3} if there were three replies and all those replies were deleted
// ! iska matlab yeh hai ki 3 replies the aur ab woh delete ho chuke hain!


    

    // ! tweet can also be a reply
    if(tweet.isAReply){
        // ! .valueOf() this will extract the id from the new ObjectId()
        const parentTweet = tweet.isAReplyOfTweet.valueOf();
        await Tweet.findByIdAndUpdate({_id:tweet.isAReplyOfTweet},{
            $pull:{
                // ! replies is an array of reply tweets
                replies:{

                    reply:tweet._id
                }
                
            }
        },{new:true})
        
       
        const deletedTweet = await Tweet.findByIdAndDelete(id)
        return res.json({deletedTweet,parentTweet:parentTweet,deletedReplies:deleteTweetReplies?.deletedCount,message:"Tweet Deleted Successfully"})
    }else{

        
        
        const deletedTweetNotAReply = await Tweet.findByIdAndDelete({_id:id})
        return res.json({deletedTweetNotAReply,deletedReplies:deleteTweetReplies?.deletedCount,message:"Tweet Deleted Successfully"})
    }

    

    

    // res.json({tweet,message:"Tweet Deleted successfully"})
    } catch (error) {
        return res.json({error})
    }


}

// const followUser = ()



const likeTweet = async(req,res)=>{

    // ! if user and postID exists in  like table, then the request has come for unlike
    // ! if not like exists then add a like
    
    

    try {
        const {tweetId} = req.params;

        

        // ! req.user.userId contains the currrent user sending the request to like one more time
        // ! we check here to see if this user has already liked this post
       const alreadyLiked = await Tweet.findOne({"likes.user": new mongoose.Types.ObjectId(req.user.userId),_id:tweetId})

       if(alreadyLiked){
        const unlikeTweet = await Tweet.findOneAndUpdate({_id:new mongoose.Types.ObjectId(alreadyLiked._id)},
        {
            $pull : {
                likes : {
                    user:req.user.userId
                }
            }
        })

        return res.json({unlikeTweet,like:false})
       }


   


        

    const likedTweet = await Tweet.findByIdAndUpdate({_id:tweetId},{
        $push : {
            likes :[

                {user:req.user.userId}
            ]
            
        }
    })
    
    
    res.json({likedTweet,like:true})
    } catch (error) {
        console.log(error)
        return res.json({error})
    }
}


const followUser = async(req,res)=>{

}

const reTweet = async(req,res)=>{

}

const uploadImageToCloud = async(req,res)=>{

    // console.log(req.file,'yeh mera request hai aur latest bhi');

    if(req?.file){

        const localPath = `uploads/${req?.file.filename}`
        
        const result = await cloudinaryUploadImg(localPath)
        
        
        
        fs.unlinkSync(localPath)
         return res.json({imgURL:result});
    }

    // const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
    //     use_filename: true,
    //     folder: `twitter/${}`
    // });

    res.json({imgURL:""})

}

const getSingleTweet = async(req,res)=>{

    

    const {id} = req.params;

    if(!id){
        return res.json({error:"Please provide an id"})
    }

    const singleTweet = await Tweet.findOne({_id:id}).populate('tweetedBy replies.reply replies.reply').populate(
      {  path:'replies.reply',
        populate:'tweetedBy'}
    ).select('-password').populate({
        path:'tweetedBy',
        select:'-password'
    })




   

    if(!singleTweet){
        return res.json({error:"no such tweet found"})
    }


    res.send({singleTweet})
}

const createComment = async(req,res)=>{

    const {tweetId} = req.params;
    const {content,commentedBy} = req.body


    

    const tweetToAddACommentOn = await Tweet.findByIdAndUpdate({_id:tweetId},{
        $push:{
            comments:{
                content,commentedBy
            }
        }
    },{new:true})
    res.json({tweetToAddACommentOn})
}


const createComment2 = async(req,res)=>{

    const {tweetId} = req.params;
    const {content,commentedBy} = req.body

    if(!content){
        return res.json({error:"Please enter something to reply"}).status(400)
    }
    const commentToAdd = {
        content:content,
        commentedBy:commentedBy,
        
    }

    const tweetAsComment = await new Tweet({
        content,tweetedBy:req.user.userId,isAReply:true,isAReplyOfTweet:tweetId
    }).save()

    

    const tweetToAddACommentOn = await Tweet.findByIdAndUpdate({_id:tweetId},{
        $push:{
            comments:[

                {comment:new mongoose.Types.ObjectId(tweetAsComment._id),content,commentedBy:new mongoose.Types.ObjectId(req.user.userId)}
                
        ]
        }
    },{new:true})

    // ! now add the recently created comment which is actually a tweet in the replies array.
    const addToReplyArray = await Tweet.findByIdAndUpdate({_id:tweetId},{
        $push:{
            replies:[

                {reply:new mongoose.Types.ObjectId(tweetAsComment._id)}
                
        ]
        }
    },{new:true})

   
    // console.log(tweetId)
    res.json({tweetToAddACommentOn})
}


const getAllTweetsFromFollowingUsers = async(req,res)=>{



//    console.log(loggedInUser?.following,'following h yeh')
//    console.log(req.body)

//    const followingUsers = req.body.loggedInUser?.following;

   

   const followingUsers = req.body.loggedInUser?.following.map((singleTweet)=>{
    return singleTweet.user
   })

//    console.log(followingUsers,'user h yeh')

   const tweets = await Tweet.find({tweetedBy:followingUsers}).populate('tweetedBy')

 

    res.json({tweets})
}

const createReTweet = async(req,res)=>{

    const {tweetId} = req.params;
    const tweetedBy = req.user.userId

    const tweetToRetweet = await Tweet.findOne({_id:tweetId})
    const retweetsOfTweetToReTweet = tweetToRetweet?.reTweetedBy

    retweetsOfTweetToReTweet.push(tweetedBy)

// ! isAReTweet field allows us to check if a tweet is retweet or not.
// ! if it is a retweet then we have different css for that along with who created this tweet and who is retweeting it


    const createNewTweetAsARetweet = await new Tweet({
        isARetweet:true,
        content:tweetToRetweet.content,tweetedBy:new mongoose.Types.ObjectId(tweetToRetweet.tweetedBy._id),
        thisTweetIsRetweetedBy:new mongoose.Types.ObjectId(req?.user.userId),
        image:tweetToRetweet?.image ? tweetToRetweet?.image : null,
        
    }).save()

    // console.log(createNewTweetAsARetweet)

    // ! update the already existing tweet by adding the tweetedBy to the reTweetedByArray
    // ! what is tweetedBy? tweetedBy is the user who is retweeting, i.e req.user.userId

    const retweet = await Tweet.findByIdAndUpdate({_id:tweetId},{
        $push:{
            reTweetedBy:[
                tweetedBy
            ]
        }
    },{new:true})
 
    console.log(createNewTweetAsARetweet._id)
    // retweetsOfTweetToReTweet.map(async(userID)=>{
    //     await Tweet.findByIdAndUpdate({_id:tweetId.valueOf()},{
    //         $push:{
    //             reTweetedBy:[
    //                 userID
    //             ]
    //         }
    //     },{new:true})
    // })

    retweet?.reTweetedBy?.map(async(userID)=>{
        await Tweet.findByIdAndUpdate({_id:createNewTweetAsARetweet._id.valueOf()},{
            $push:{
                reTweetedBy:[
                    userID
                ]
            }
        },{new:true})
    })



    res.json({message:"createReTweet",tweetId,tweetedBy,retweet,createNewTweetAsARetweet});
}



module.exports = {createReTweet,getAllTweetsFromFollowingUsers,createTweet,createComment2,createComment,getSingleTweet,getAllTweets,deleteTweet,likeTweet,followUser,reTweet,uploadImageToCloud}