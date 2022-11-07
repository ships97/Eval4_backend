const express = require("express");
const {connection} = require("./config/db");
const {UserModel} = require("./model/User.model");
const {TodoModel} = require("./model/Todo.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const authentication = require("./middleware/authentication");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to Home page");
});

app.get("/about", (req, res) => {
    res.send("About page");
});


const authentication = (req, res, next) => {
    const token = req.headers.authorization;
    try{
        const decoded = jwt.verify(token, "wxyz1234");
        req.body.email = decoded.email;
        next();
    }
    catch(err){
        res.send("Please login again");
    }
};

app.get("/todos", async (req, res) => {
    const ans = await TodoModel.find({});
    res.send(ans);
});

app.post("/todos/create", authentication, async (req, res) => {
    const {taskname, status, tag} = req.body;
    console.log(taskname, status, tag);
    const newTodo = new TodoModel({
        taskname,
        status,
        tag
        // userID
    });
    await newTodo.save();
    res.send({newTodo});
    res.send("created")
});

app.post("/signup", async (req, res) => {
    const {email, password} = req.body;
    bcrypt.hash(password, 5, async function(err, hashPassword){
        if(err){
            res.send("Something went wrong, signup again");
        }
        const new_user = new UserModel({
            email : email, 
            password : hashPassword
        })
        await new_user.save();
        res.send("Signup successfully");
    });
});

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const user = await UserModel.findOne({email});
    const hashPassword = user.password;
    bcrypt.compare(password, hashPassword, function(err, output){
        if(output){
            const token = jwt.sign({email: email}, "wxyz1234");
            res.send({"msg" : "Login successfully", "token" : token});  
        }
        else{
            res.send("Login failed");
        }
    });
});

app.listen(PORT, async () => {
    try{
        await connection;
        console.log("Connected to DB successfully");
    }
    catch(err){
        console.log("Error connecting to DB");
        console.log(err);
    }
    console.log(`Listening at PORT ${PORT}`);
});