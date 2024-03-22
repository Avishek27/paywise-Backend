const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');
const mongoose = require('mongoose');
const router = express.Router();
const app = express();


//Route 1 => User to get their balance
router.get("/balance", authMiddleware, async (req, res) => {
    
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});

//Route 2 => User to transfer money
router.post('/transfer',authMiddleware,async (req,res)=>{

    //start a session

    const session = await mongoose.startSession();

    //start a transaction
    session.startTransaction();

    //LOGIC
    const { amount, to } = req.body;
    const account = await Account.findOne({
        userId: req.userId,
    }).session(session);

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance",
        });
    }

    const toAccount = await Account.findOne({
        userId: to,
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid Account",
        });
    }

    await Account.updateOne({
        userId: req.userId
    },
    {
        $inc: {
            balance: -amount
        }
    }).session(session);
    
    await Account.updateOne({
        userId: to,
    },
    {
        $inc: {
            balance: amount
        }
    }).session(session);


    //commit the transaction
    await session.commitTransaction();
    
    res.status(200).json({
        message: "Transfer Successful",
    });
});



module.exports = router;

