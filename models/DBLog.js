const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DBLogSchema = new Schema(
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

        fileName: {
            type: String,
            required: true
        },

    },
    { timestamps: true }
)


module.exports = mongoose.model('DBLog', DBLogSchema);