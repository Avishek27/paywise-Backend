const express = require("express");

const router = express.Router();
const zod = require('zod');
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

//SIGNUP ROUTE
//zod validation schema
const signupSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
});

router.post("/signup", async (req,res) =>{
    //zod validation input check
    
   const { success } = signupSchema.safeParse(req.body);
   if(!success){
    return res.status(411).json({
        message: "Incorrect inputs",
    });
   }

   //check if the user is present in db
   const existingUser = await User.findOne({
    username: req.body.username,
   });
   //if present then send failure message
   if(existingUser){
    return res.status(411).json({
        message: "Email already taken",
    });
   }
   //else create a new user with the credentials
   const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
   });
   //get the id
   const userId = user._id;

   //create a new account and give a random balance 
   await Account.create({
    userId,
    balance: 1 + Math.random()*1000
   });
   
   //generate the jwt token with the id
   const token = jwt.sign({
    userId
   }, JWT_SECRET);
   //send the token to the user
   res.status(200).json({
    message: "User created successfully",
    token: token,
   })
});

//SIGNIN Route

//zod schema for signin 
const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
});

router.post("/signin",async (req,res)=>{
    //zod schema validation
    const { success } = signinSchema.safeParse(req.body); 
    if(!success){
      return res.status(411).json({
        message: "Email already taken / Incorrect inputs",
      });
    }
    
    //checking if the user exists
    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    //if user not exists
    if(!user){
        return res.status(411).json({
            message: "Error while logging in",
        });
    }

    //if user exists
    const token = jwt.sign({
        userId: user._id
    }, JWT_SECRET);

    res.status(200).json({
       token: token,
    });
});


//UPDATE ROUTE
//Zod validation of the incoming updates
const updateSchema = zod.object({
     password: zod.string().optional(),
     firstName: zod.string().optional(),
     lastName: zod.string().optional(),
});

router.put("/",authMiddleware,async (req,res)=>{
  const { success } = updateSchema.safeParse(req.body);
  if(!success){
    return res.status(411).json({
        message: "Error while updating information",
    });
  }

  await User.updateOne( req.body,
    { 
        _id: req.userId
    });
  res.json({
    message: "Updated Successfully",
  })
});


//GET ROUTE TO GET THE USERS REQUIRED
router.get("/bulk", async (req,res)=>{
     const filter = req.query.filter || "";
     const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        },{
            lastName: {
                "$regex": filter
            }
        }]
     }).exec();

     res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
     })
});

module.exports = router;

