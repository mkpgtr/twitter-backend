const express  = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path')
const connectDB = require('./db/connect.js');
const app = express();
const authRoutes = require('./routes/auth.js')
const tweetRoutes = require('./routes/tweet.js')
const userRoutes = require('./routes/user.js')
const multer = require('multer')

const fileUpload = require('express-fileupload')

const cloudinary = require('cloudinary').v2



dotenv.config();
// ! form values ko receive karne k liye express.json() middleware ki help lete h

// ! cross origin resource sharing enable karne k liye cors() use hota h
app.use(cors());
app.use(express.json());


cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key : process.env.CLOUD_API_KEY,
  api_secret : process.env.CLOUD_API_SECRET

})

app.use(express.static(path.join(__dirname, 'frontend', 'build')))

// ! login
app.use('/auth',authRoutes);
// ! user
app.use('/user',userRoutes);
// !tweets
app.use('/tweet',tweetRoutes);


app.get('*',async(req,res)=>{
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'))
})



// ! process.env.PORT = 5000

const start = async () => {
    try {
      await connectDB(process.env.MONGO_URI2);
      app.listen(process.env.PORT, () =>
        console.log(`Server is listening on port ${process.env.PORT}...`)
      );
    } catch (error) {
      console.log(error);
    }
  };

  start()