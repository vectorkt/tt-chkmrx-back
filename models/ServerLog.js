const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServerLogSchema = new Schema(
    {
        project: {
            type: String,
            required: true
        },

        language: {
            type: String,
            required: true
        },

        version: {
            type: String,
            required: true
        },

        scanCoverage: {
            type: String,
            required: true
        },

        scanCoverageLOC: {
            type: String,
            required: true
        },

        totalFiles: {
            type: String,
            required: true
        },

        goodFiles: {
            type: String,
            required: true
        },


        partiallyGoodFiles: {
            type: String,
            required: true
        },

        badFiles: {
            type: String,
            required: true
        },

        logName: {
            type: String,
            required: true
        },

    },
    { timestamps: true }
)


module.exports = mongoose.model('ServerLog', ServerLogSchema);