const bcrypt =  require('bcryptjs');

// ! hashing utility function

// ! async await

// ! async : let this function run in the background
// ! 

// ! express is single threaded. so an error should not stop the program from running
// ! that's why
const hashPassword = async(password)=>{

    // return new Promise((resolve,reject)=>{
    //     bcrypt.genSalt(10,(error,salt)=>{
    //         if(error){
                
    //             reject(error)
    //         } 
    //         bcrypt.hash(password,salt,(error,hash)=>{
    //             if(error){
    //                 reject(error);
    //             }
    //             resolve(hash);
    //         })
    //     })
    // })

    // ! salt is like a key
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password,salt)

    // ! return the hashed password
    return hash;
}



const matchPassword = (password,hashedPassword)=>{

return bcrypt.compare(password,hashedPassword);

}





module.exports = {hashPassword,matchPassword}