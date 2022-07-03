require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
app.use(express.json())
const mongoose = require('mongoose');
const DBLog = require('./models/DBLog')
const { restart } = require('nodemon');
const { parseLogs, aggregateLogs, summarizeLogs } = require('./logTools/logTools');


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


const fetchLogsInDB = async () => {

    const results = await DBLog.find()
    return results.map(result => JSON.parse(JSON.stringify(result)));

}


const updateLogsInDBfromFiles = async (logsInDB) => {

    const filesToIgnore = logsInDB.map(log => log.fileName);
    const newParsedLogs = parseLogs(filesToIgnore);

    // console.log("newParsedLogs")
    // console.log(newParsedLogs)

    if (newParsedLogs) {

        newParsedLogs.forEach((parsedLog) => {
            const servedLog = new DBLog({ ...parsedLog });
            servedLog.save();
        })

        return await fetchLogsInDB();
    }
    else {
        return logsInDB;
    }
}



async function main() {

    dbURI = `mongodb+srv://admin:${process.env.DB_PASSWORD}@footprint.skf3hpj.mongodb.net/?retryWrites=true&w=majority`
    await mongoose.connect(dbURI)


    var logsInDB = await fetchLogsInDB();

    logsInDB = await updateLogsInDBfromFiles(logsInDB);

    const aggregatedLogs = aggregateLogs(logsInDB);
    const latestLogs = summarizeLogs(aggregatedLogs);
    const projectTitles = Object.keys(aggregatedLogs);

    // const second = 1000;
    // const minute = 60 * second;
    // const hour = 60 * minute
    // setInterval(() => { console.log("interval") }, second);





    app.post('/logs', authenticateToken,
        (req, res) => {

            if (req.body.project == "all") {
                res.json(logsInDB)
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
        // console.log(req.body.password)

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