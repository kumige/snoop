const uniqueSlug = require("unique-slug");
const fs = require("fs");
const sharp = require("sharp");
const uploadURI = "C:/Users/Mikko/Desktop/snoop/uploads/";

// Saves the image and returns the filename that will be saved to db
const saveImage = async (image) => {
    // Original image
    let fname = uniqueSlug() + ".png";
    const path = `${uploadURI}${fname}`;
    let stream = image.file.createReadStream();
    await stream.pipe(fs.createWriteStream(path));
  
    // Thumbnail
    const transformer = sharp()
    .resize({
      width: 480,
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy
    });
    const tnFilename = `tn${fname}`;
    const tnPath = `${uploadURI}${tnFilename}`
    const tnStream = image.file.createReadStream();
    tnStream.pipe(transformer).pipe(fs.createWriteStream(tnPath))
  
    return fname;
  };

module.exports = { saveImage }