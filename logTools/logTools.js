//READING FILES
class Log {

    constructor(fileName = null, dataString = null) {

        var self = this;

        self.initialize();

        if (fileName) {
            self.parseFileName(fileName);
        }

        if (dataString) {
            self.parseData(dataString);
        }
    }

    initialize() {
        this.project = null;
        this.language = null;
        this.version = null;

        this.scanCoverage = null;
        this.scanCoverageLOC = null;

        this.totalFiles = null;
        this.goodFiles = null;

        this.partiallyGoodFiles = null;
        this.badFiles = null;

        this.fileName = null;
    }

    parseFileName(fileName) {

        const [project, language, version] = fileName.split("_");

        this.fileName = fileName;

        this.project = project;
        this.language = language;
        this.version = version;
    }

    parseData(dataString) {

        try {

            let initialPosition = dataString.search(/Total files/);
            dataString = dataString.slice(initialPosition);

            let finalPosition = dataString.search(/ \r\n/);
            dataString = dataString.slice(0, finalPosition);

            let dataStrings = dataString.split(/\r\n/);
            dataStrings.map(
                datum => {

                    if (datum.includes("Scan coverage:")) {
                        this.scanCoverage = datum.split(/\t/)[1].replace('%', '');;
                    }

                    if (datum.includes("Scan coverage LOC:")) {
                        this.scanCoverageLOC = datum.split(/\t/)[1].replace('%', '');;
                    }

                    if (datum.includes("Total files")) {
                        this.totalFiles = datum.split(/\t/)[1];
                    }

                    if (datum.includes("Good files")) {
                        this.goodFiles = datum.split(/\t/)[1];
                    }

                    if (datum.includes("Partially good files")) {
                        this.partiallyGoodFiles = datum.split(/\t/)[1];
                    }

                    if (datum.includes("Bad files")) {
                        this.badFiles = datum.split(/\t/)[1];
                    }


                }
            )


        }
        catch (err) {
            console.log(error)
        }


    }

}



const parseLogs = (filesToIgnore) => {
    try {
        const logsFolder = './Logs/';
        const fs = require('fs');

        var fileNames = fs.readdirSync(logsFolder);
        fileNames = fileNames.filter(file => !filesToIgnore.includes(file));        

        const parsedLogs = fileNames.map(file => {
            const data = fs.readFileSync(`${logsFolder}/${file}`, 'utf8');
            return new Log(file, data);
        })

        return parsedLogs;

    }
    catch (err) {
        console.log(err)
    }

}


const aggregateLogs = (parsedLogs) => {
    try {

        var aggregatedLogs = {};


        parsedLogs.forEach(log => {

            if (log.project in aggregatedLogs) {
                aggregatedLogs[log.project].push(log);
            }
            else {
                aggregatedLogs[log.project] = [log];
            }


        })



        for (var key in aggregatedLogs) {
            aggregatedLogs[key].sort((a, b) => a.version.localeCompare(b.version));
        }

        return aggregatedLogs;

    }
    catch (err) {
        console.log(err)
    }
}


const summarizeLogs = (aggregatedLogs) => {

    var summarizedLogs = [];

    for (var key in aggregatedLogs) {
        var aggregation = aggregatedLogs[key];
        summarizedLogs.push(aggregation[0]);
    }

    return summarizedLogs;
}





module.exports = {  parseLogs, aggregateLogs, summarizeLogs, }
