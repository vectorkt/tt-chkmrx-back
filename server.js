require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
app.use(express.json())
const mongoose = require('mongoose');
const DBLog = require('./models/DBLog')


const { restart } = require('nodemon');
const { parseLogs, aggregateLogs, summarizeLogs, Log, serveLogs } = require('./logTools/logTools');


var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

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
            // console.log(user)

            req.user = user;
            next()
        })
}


const fetchLogs = async () => {
    console.log("FETHCING")
    const results = await DBLog.find()
    return results.map(result => JSON.parse(JSON.stringify(result)));

}



async function main() {

    dbURI = `mongodb+srv://admin:${process.env.DB_PASSWORD}@footprint.skf3hpj.mongodb.net/?retryWrites=true&w=majority`
    await mongoose.connect(dbURI)




    /*
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

    app.post('/testtokengeneration',
        (req, res) => {

            const username = req.body.username;
            console.log(username)
            const user = { name: username }

            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.json({ accessToken: accessToken })
        })

    app.post('/testtoken', authenticateToken,
        (req, res) => {
            console.log(req.user)
            res.json('token verified')
        })
    /* */


    //require('crypto').randomBytes(64).toString('hex')






    //KITTENS
    // const mycat = new Kitten({ name: 'Silence' });
    // mycat.save()

    // const results = await Kitten.find()
    // console.log(results)

    //{...parsedLogs[0]}


    //SERVERLOGS

    // parsedLogs.forEach((parsedLog) => {
    //     const servedLog = new DBLog({ ...parsedLog });
    //     servedLog.save();
    // })

    var logsInDB = await fetchLogs();
    console.log("FETHCED")

    const alreadyParsedFiles = logsInDB.map(log => log.fileName)
    
    console.log(logsInDB[0])
    console.log(alreadyParsedFiles)
    
    const newParsedLogs = parseLogs(alreadyParsedFiles);
    console.log("HERE")


    console.log("parsedLogs")
    console.log(newParsedLogs)

    if (newParsedLogs) {
        newParsedLogs.forEach((parsedLog) => {
            const servedLog = new DBLog({ ...parsedLog });
            servedLog.save();
        })
        logsInDB = await fetchLogs();
    }
    

    //
    //var returned = JSON.parse(JSON.stringify(results[0]));
    //console.log(returned);
    //console.log(returned._id);
    //const { updatedAt, ...newObject } = results[0];
    //console.log(newObject);





    const aggregatedLogs = aggregateLogs(logsInDB);
    const latestLogs = summarizeLogs(aggregatedLogs);

    const projectTitles = Object.keys(aggregatedLogs)

    app.post('/logs', authenticateToken,
        (req, res) => {

            if (req.body.project == "all") {
                res.json(parsedLogs)
            }
            else if (req.body.project && req.body.project in aggregatedLogs) {
                res.json(aggregatedLogs[req.body.project]);
            }
            else {
                res.json(latestLogs);
            }
        })

    app.post('/projecttitles', authenticateToken,

        (req, res) => {

            res.json(projectTitles);

        })



    app.post('/login', (req, res) => {

        // console.log(req.body)
        // console.log(req.body.user)

        if (req.body.user) {

            const storedUser = "admin";
            const storedPassword = process.env.ADMIN_PASSWORD;

            if (req.body.user.user == storedUser && req.body.user.password == storedPassword) {
                const accessToken = jwt.sign(req.body.user, process.env.ACCESS_TOKEN_SECRET);
                res.json({
                    success: true,
                    accessToken: accessToken
                })
            }
            else {
                res.json({
                    success: false
                })
            }

        }
        else {
            res.json("error");
        }

    })

    app.post('/test', (req, res) => {


        res.json("test");

    })

    app.listen(4000)
    console.log("listening")

}

main()