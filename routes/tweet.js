const express = require('express');
const { createTweet, getAllTweets, deleteTweet, likeTweet, followUser, reTweet, uploadImageToCloud, getSingleTweet, createComment, getAllTweetsFromFollowingUsers, createComment2, createReTweet } = require('../controllers/tweetController');
const { followUserController } = require('../controllers/userController');
const { isUserAuthenticated } = require('../middleware/auth');
const {uploadImage, upload} = require('../middleware/tweet');
const { tweetPhotoUpload, afterUploadingThroughMulter } = require('../utilities/tweetPhotoUpload');


const router = express.Router();


router.post('/uploadPictureToCloud',tweetPhotoUpload.single('file'),afterUploadingThroughMulter,uploadImageToCloud)


router.post('/createTweet',isUserAuthenticated,createTweet)
router.get('/getSingleTweet/:id',isUserAuthenticated,getSingleTweet)
router.post('/getAllTweets',isUserAuthenticated,getAllTweetsFromFollowingUsers)
router.get('/getAllTweets',isUserAuthenticated,getAllTweets)
router.post('/createComment/:tweetId',isUserAuthenticated,createComment)
router.put('/createComment/:tweetId',isUserAuthenticated,createComment2)
router.post('/createRetweet/:tweetId',isUserAuthenticated,createReTweet)
// ! this is exactly what we are sending from the frontend's SingleUserPage.js
router.post('/follow/:follower/:toFollow',isUserAuthenticated,followUserController)

// ! express routers

// ! 
router.put('/likeTweet/:tweetId',isUserAuthenticated,likeTweet);

// ! $push => mongoose array me push karta hai.

// router.put('/follow/:userID/current',isUserAuthenticated,followUser);
// ! followers : []
// ! Tweet.findByIdAndUpdate({_id:userId},{$push:followers()})

// ! retweet => send tweetID to backend.
// ! query the database with that ID
//  ! poora jitna bhi content hai + image, usko current user k ID se query karke db me enter karwa dena
// router.put('/retweet/:tweetID',isUserAuthenticated,reTweet);

router.delete('/deleteTweet/:id',isUserAuthenticated,deleteTweet);




module.exports = router