const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Avi:ncKybIC1OqZRMT7n@mycluster.22sxvvv.mongodb.net/paytm");


const userSchema = new mongoose.Schema({
    username: {
       type: String,
       required: true,
       unique: true,
       trim: true,
       lowercase: true,
       minLength: 3,
       maxLength: 30,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 30,
            },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 30,
    },
    password: {
        type: String,
        require: true,
        minLength: 6,
    }
});

//bank related schema
const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' ,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
});

const Account = mongoose.model('Account',accountSchema);
const User = mongoose.model('User',userSchema);

module.exports = {
    User,
    Account,
};
