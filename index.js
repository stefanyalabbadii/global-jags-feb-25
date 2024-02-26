// Imports
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const sharp = require('sharp');

// Entry point function
exports.generateThumbdata = async (file, context) => {
    const gcsFile = file;
    const storage = new Storage();
    const sourceBucket = storage.bucket(gcsFile.bucket);

    // Log the Cloud Function Version
    const version = process.env.K_REVISION;
    console.log(`Running Cloud Function Version ${version}`);

    console.log(`File Name: ${gcsFile.name}`);
    console.log(`Generation Number: ${gcsFile.generation}`);
    console.log(`Content type: ${gcsFile.contentType}`);

    // Create a working directory on the VM that runs our Cloud Function to download the original file
    const workingDir = path.join(os.tmpdir(), 'files');
    const tempFilePath = path.join(workingDir, gcsFile.name);

    // Ensure the working directory exists
    await fs.ensureDir(workingDir);

    // Download the original file to the local VM
    await sourceBucket.file(gcsFile.name).download({
        destination: tempFilePath
    });

    console.log(`Downloaded ${gcsFile.name} to ${tempFilePath}`);

    // For V1, we'll just log that we've downloaded the file and not do any further processing
    // Future versions might resize the image, upload it elsewhere, etc.

    // Delete the local copy of the file to clean up
    await fs.remove(tempFilePath);
    console.log(`Deleted local file ${tempFilePath}`);
};

