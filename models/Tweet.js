const mongoose = require('mongoose');

const {Schema} = mongoose;


const TweetSchema = new Schema(

   { 
    content : {
        type:String,
    },
    image:{
        type:String
    },
    // ! i have added this to distinguish between original tweets and
    // ! reply tweets
    isAReply:{
        type:Boolean,
        default:false
    },
    // ! to find the parent of a reply tweet
    isAReplyOfTweet:{
        // ! we use .populate() function to show the entire details relating to that ObjectId
        type:mongoose.Schema.Types.ObjectId,
        // ! every tweet is a reply in itself, so a parent Tweet will have a child tweet
        // ! this child tweet can be thought of as a reply tweet(or reply).
        ref:'Tweet'
    },

    // ! to find the creator of a tweet
    tweetedBy:{
        type:mongoose.Types.ObjectId,
        ref:'User',
    },

    // ! likes array stores the IDs of users who have liked it
    likes:[{
        user:{

            type:mongoose.Types.ObjectId,
            immutable:false,
            ref:'User',
            
        }
    }],

    // ! redundant schema field(not used in this project after I planned my project differently)
    comments : [
 {     
    //    comment:{
         
    //    }   
   
  comment:{
    type:mongoose.Types.ObjectId,
    ref:'Tweet',
    content:{
        type:String
    },
    commentedBy:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    }
  }
   
        }

    ],
    
    reTweetedBy:[
        {
            type:mongoose.Types.ObjectId,
            ref:'User'
        }
    ],

    // ! I added this field at last when I wanted to show the retweeted text in the single feed section
    thisTweetIsRetweetedBy:{
        type:mongoose.Types.ObjectId,
        ref:'User'

    },
    isARetweet:{
        type:Boolean,
        default:false
    },
    replies:[
        {
           reply:{
            type:mongoose.Types.ObjectId,
            ref:'Tweet'   
           }
        }
    ],
   

}
,{timestamps:true}
)






module.exports = mongoose.model("Tweet",TweetSchema)