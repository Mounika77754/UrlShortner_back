const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");
const dotenv=require("dotenv");
const bcrypt=require("bcryptjs");
const app=express();
const users=require("./model/users.js")
const jwt=require("jsonwebtoken");
const urls=require("./model/urls.js");
const validator=require("validator");
const crypto=require("crypto");
const auth=require("./middle/auth")
const genCode=(ourl)=>{
    return crypto.randomBytes(4).toString("hex");
}
dotenv.config()
app.use(express.json());
app.use(cors());
mongoose.connect(`${process.env.MONGO_URI}`,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>console.log("connected")).catch((err)=>{console.log(err.message)});
app.get("/", (req, res) => {
  res.send("✅ Backend is live and running!");
});

app.post("/register",async(req,res)=>{
    const {userName,userEmail,Password}=req.body;
   try{
    const euser=await users.findOne({userEmail})
     if(euser){
        return res.status(400).json({message:"user already exists"});
    }
    else{
        const hashpass=await bcrypt.hash(Password,10);
        const newUser=new users({userName,userEmail,Password:hashpass});
        await newUser.save();
        return res.status(200).json({message:"registerd"})
    }
   }catch(err){
     return res.status(500).json({message:err.messsage})
   }
})

app.post("/login",async (req,res)=>{
    const {userEmail,Password}=req.body;
    try{
        const userexist=await users.findOne({userEmail});
        if(userexist){
            const match=await bcrypt.compare(Password,userexist.Password);
            if(!match){
                return res.status(400).json({message:"Invalid credntials"});
            }
            else{
                const token=jwt.sign({ id: userexist._id, email: userexist.userEmail },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN })
      return res.status(200).json({message:"Logged in successfullt",token})
            }
        }else{
            return res.status(404).json({message:"User do not exist!"})
        }
    }catch(err){
        return res.status(500).json({message:err.message})
    }
})
app.post("/url",auth,async (req,res)=>{
   const orUrl=req.body.originalUrl;
   const exist=await urls.findOne({originalUrl:orUrl})
   if(exist){
    return res.status(200).json({message:"done",shUrl:exist.shortUrl})
   }
   if(validator.isURL(orUrl,{require_protocol:true})){
         try{
            const shortCode=genCode(orUrl);
            const shUrl=`${req.protocol}://${req.get("host")}/${shortCode}`;
            const newObj=new urls({
                userId: req.user.id,
      originalUrl:orUrl,
      shortUrl:shUrl,
      shortCode
            })
            await newObj.save();
            return res.status(200).json({message:"done",shUrl});
         }catch(err){
            return res.status(400).json({message:err.message});
         }
   }else{
    return res.status(404).json({message:"Invalid URL"})
   }
})

app.get("/:shortCode",async (req,res)=>{
    try{
        const oUrl=await urls.findOne({shortCode:req.params.shortCode});
        if(oUrl){
            oUrl.count+=1;
            await oUrl.save();
            res.redirect(oUrl.originalUrl)
        }else{
            return res.status(404).json({message:"No url mapping found"});
        }
    }catch(err){
         res.status(500).json({message:err.message})
    }
})
app.listen(process.env.PORT,()=>(console.log("Listening on port 5000")))