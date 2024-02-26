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

    // Delete the local copy of the file to clean up
    await fs.remove(tempFilePath);
    console.log(`Deleted local file ${tempFilePath}`);
};

exports.processUpload = async (event, context) => {
    const storage = new Storage();
    const file = storage.bucket(event.bucket).file(event.name);
  
    // Download and check content type
    const [metadata] = await file.getMetadata();
    if (!['image/jpeg', 'image/png'].includes(metadata.contentType)) {
      console.log('File is not a valid image.');
      await file.delete();
      return;
    }
  
    // Process image and generate thumbnail
    const tempFilePath = path.join(os.tmpdir(), path.basename(file.name));
    await file.download({destination: tempFilePath});
  
    // Thumbnail generation
    const thumbFilePath = path.join(os.tmpdir(), `thumb_${path.basename(file.name)}`);
    await sharp(tempFilePath)
      .resize({width: 64})
      .toFile(thumbFilePath);
  
    // Upload thumbnail and original file to respective buckets
    await storage.bucket('sp24-41200-sfalabba-gj-thumbnails').upload(thumbFilePath);
    await storage.bucket('sp24-41200-sfalabba-gj-finals').upload(tempFilePath);
  
    // Clean up
    await fs.remove(tempFilePath);
    await fs.remove(thumbFilePath);
    await file.delete();
};
