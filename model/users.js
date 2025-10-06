const mongoose=require("mongoose")
const dotenv=require("dotenv")
dotenv.config();


const useSchema=new mongoose.Schema({
    userName:{type:String,required:true},
    userEmail:{type:String,required:true,unique:true},
    Password:{type:String,required:true}
})

const users=mongoose.model("users",useSchema,"users");

module.exports=users;
