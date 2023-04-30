const mongoose = require('mongoose');

const {Schema} = mongoose;

const UserSchema = new Schema(
    {
        name:{
            type:String,
            trim:true,
            required:true,
        },
        username:{
            type:String,
            trim:true,
            required:true,
            unique:true,
            
        },
        email:{
            type:String,
            trim:true,
            required:true,
            unique:true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please provide a valid email',
              ],
            
        },
        password:{
            type:String,
            required:true,
            min:6,
            max:30
            
        },
        profile_picture:{
            // ! upload to cloudinary. we will get a link. store that link in this field.
            type:String,

        },
        location:{
            type:String,
        },
        DateOfBirth : {
            type:Date,

        },
        // ! followers
        followers:[

            {
                user:{
                    // ! a different way of writing mongoose Types ObjectId
                type:Schema.ObjectId,
                ref:'User'
            }}
            
        ],
        // ! following and the followers array have the same kind of structure.
        following:[
            {
            user:
            {type:Schema.ObjectId,
            ref:'User'}
        }],
        address:{
            type:String,
            trim:true
        },
        role:{
            type:String,
            enum:['admin','user'],
            default:'user'
        }
    },
    {timestamps:true}
)

// ! model ko compile karne
module.exports = mongoose.model("User",UserSchema)



