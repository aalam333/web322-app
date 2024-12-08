const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const uri = "mongodb+srv://web322-app:mongoose@cluster0.al2uo.mongodb.net/web322?retryWrites=true&w=majority&appName=Cluster0";

let userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
    },
    password: String,
    loginHistory: [{
        dateTime: {
            type: Date,
        },
        userAgent: {
            type: String,
        }
    }]
})

let User; // to be defined on new connection (see initialize)

/** MODULES **/
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(uri);

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if(userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else {
            let newUser = new User(userData); 

            newUser.save().then(() => {
                resolve();
            }).catch((err) => {
                if(err.code === 11000){
                    reject("Username already taken");
                }
                else{
                    reject(`There was an error creating the user:  ${err}`);
                }
            })
        }
    });
}

module.exports.checkUser = function (userData){
    User.find({ userName: userData.userName })
    .then((users) => {
        if(users.length === 0){
            reject(`Unable to find user: ${userData.userName}`);
        }
        if(users[0].password !== userData.password){
            reject(`Incorrect Password for user: ${userData.userName}`);
        }
        else{
            users[0].loginHistory.push({
                dateTime: (new Date()).toString(),
                userAgent: userData.userAgent
            })

            User.updateOne(
                { userName: users[0].userName },
                { $set: {loginHistory : users[0].loginHistory}}
            ).exec()
            .then(() => {
                resolve(users[0])
            }).catch((err) => {
                reject(`There was an error verifying the user: ${userData.userName}`);
            })
        }
    }).catch((err) => {
        reject(`Unable to find user: ${userData.userName}`);
    })
}
