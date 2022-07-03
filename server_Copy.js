require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
app.use(express.json())

const { restart } = require('nodemon');


var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

app.get('/test', (req, res) => {
    res.json('Kyle')
})

const data = [
    {
        username: 'Kyle',
        title: 'Post 1'
    },
    {
        username: 'Jim',
        title: 'Post 2'
    },
]

app.get('/tests', (req, res) => {
    res.json(data)
})


//require('crypto').randomBytes(64).toString('hex')

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.sendStatus(401) 
    }
    // console.log(process.env.ACCESS_TOKEN_SECRET)
    // console.log(token)
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,
        (err, user) => {
            if (err) {
                
                console.log("ERROR")
                console.log(err)

                return res.sendStatus(403)
            }
            // console.log(req)
            console.log(user)

            req.user = user;
            next()
        })
}


app.post('/testtokengeneration',
(req,res)=>{
    
    const username = req.body.username;
    console.log(username)
    const user = {name:username}

   const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET);
   res.json({accessToken:accessToken})
})

app.post('/testtoken', authenticateToken,
 (req, res) => {
    console.log(req.user)
    res.json('token verified')
})
/* */




app.listen(4000)