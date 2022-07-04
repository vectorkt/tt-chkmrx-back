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
const { hour } = require('./utils/timeConstants');


var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

/**
 * Authentication function for jwt.
 * Contains a parser for the data retrieved from the logs.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.sendStatus(401)
    }


    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,
        (err, user) => {
            if (err) {

                console.log("ERROR")
                console.log(err)

                return res.sendStatus(403)
            }

            req.user = user;
            next()
        })
}

/**
 * Function to fetch the logs from the database.
 */
const fetchLogsInDB = async () => {

    const results = await DBLog.find()
    return results.map(result => JSON.parse(JSON.stringify(result)));

}

/**
 * Function which parses new log files and updates the database.
 * It then returns the logs.
 */
const updateLogsInDBfromFiles = async () => {

    var logsInDB = await fetchLogsInDB()

    const filesToIgnore = logsInDB.map(log => log.fileName);
    const newParsedLogs = parseLogs(filesToIgnore);

    if (newParsedLogs) {

        newParsedLogs.forEach((parsedLog) => {
            const servedLog = new DBLog({ ...parsedLog });
            servedLog.save();
        })

        logsInDB = await fetchLogsInDB()

        return logsInDB;
    }
    else {
        return logsInDB;
    }
}



async function main() {

    //CONNECT TO DB
    dbURI = `mongodb+srv://admin:${process.env.DB_PASSWORD}@footprint.skf3hpj.mongodb.net/?retryWrites=true&w=majority`
    await mongoose.connect(dbURI)

    //LOAD FILES FROM DB AND PARSE LOG FILES
    var logsInDB = await updateLogsInDBfromFiles(logsInDB);

    const aggregatedLogs = aggregateLogs(logsInDB);
    const latestLogs = summarizeLogs(aggregatedLogs);
    const projectTitles = Object.keys(aggregatedLogs);


    //UPDATE SERVER AND DB FROM LOGS EVERY 24 HOURS 
    setInterval(async () => {

        logsInDB = await updateLogsInDBfromFiles(logsInDB);

        const aggregatedLogs = aggregateLogs(logsInDB);
        const latestLogs = summarizeLogs(aggregatedLogs);
        const projectTitles = Object.keys(aggregatedLogs);

    }, 24 * hour);




    //REST METHODS
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

    app.listen(4000)
    console.log("Listening...")

}

main()