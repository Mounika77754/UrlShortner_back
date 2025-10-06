const jwt=require("jsonwebtoken")
function auth(req,res,next){
    const token=req.header("Authorization")?.replace("Bearer ","");
    if(token){
        try{
            const ver=jwt.verify(token,process.env.JWT_SECRET)
            req.user=ver;
            next();
        }catch(err){
            return res.status(400).json({message:err.message});
        }
    }else{
        return res.status(404).json({message:"token do not exist"});
    }
} 
module.exports=auth;