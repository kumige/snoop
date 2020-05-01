const uniqueSlug = require("unique-slug");
const fs = require("fs");
const sharp = require("sharp");
const uploadURI = "D:/ServersideScriptCourse/Snoop/";

// Saves the image and returns the filename that will be saved to db
const saveImage = async (image) => {
  // Original image
  let fname = uniqueSlug() + ".png";
  const path = `${uploadURI}${fname}`;
  let stream = image.file.createReadStream();
  await stream.pipe(fs.createWriteStream(path));

  // Thumbnail
  const transformer = sharp().resize({
    width: 480,
    fit: sharp.fit.cover,
    position: sharp.strategy.entropy,
  });
  const tnFilename = `tn${fname}`;
  const tnPath = `${uploadURI}${tnFilename}`;
  const tnStream = image.file.createReadStream();
  tnStream.pipe(transformer).pipe(fs.createWriteStream(tnPath));

  return fname;
};

const deleteFile = (img) => {
  console.log(img);

  fs.unlink(`${uploadURI}${img}`, (err) => {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log("File deleted!");
  });
  fs.unlink(`${uploadURI}tn${img}`, (err) => {
    if (err) throw err;
    // if no error, file has been deleted successfully
    console.log("File thumbnail deleted!");
  });
};

module.exports = { saveImage, deleteFile };
