const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const cloudinary = require('cloudinary');
const _ = require('lodash');
const Feedback = require('../lib/Feedback');

//-- configure cloudinary only in production
if (process.env.NODE_ENV === 'production') {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });
}
function extname(fileName) {
  return fileName.slice(fileName.indexOf('.') + 1);
}

function filter(error, fileName, filters) {
  let extension = extname(fileName);

  if (!filters.includes(extension)) error.fileType = 'File type not allowed';
}

module.exports = (options = { filters: [], uploadDir: '' }) => {
  return (req, res, next) => {
    let form = formidable.IncomingForm(); // The incoming form
    let filters = options.filters || [
      'jpg',
      'jpeg',
      'png',
      'mp3',
      'mp4',
      'mkv',
    ];
    let uploadDir =
      path.join(__dirname, options.uploadDir) ||
      path.join(__dirname, '/../../public/uploads');
    let errors = {};

    form.parse(req, (err, fields, files) => {
      let fileToUpload = files.fileToUpload || files.mediaUrl;

      if (fileToUpload) {
        let fileName = fileToUpload.name;
        let tempPath = fileToUpload.path;
        //-- filter this file
        filter(errors, fileName, filters);

        //-- an error occured
        if (!_.isEmpty(errors)) {
          req.uploadStatus = new Feedback(errors, false, 'upload failed');
          return next();
        }

        let newFileName = `xb_${Date.now()}.${extname(fileName)}`;

        let uploadStatus = new Feedback({ fields: fields }, false, '');

        //-- check node ennvironment
        if (process.env.NODE_ENV === 'production') {
          //-- on production use cloudinary
          cloudinary.uploader.upload(tempPath, (result) => {
            if (!result.error) {
              uploadStatus.result['uploadURL'] = result.secure_url;
              uploadStatus.result['environment'] = process.env.NODE_ENV;
              uploadStatus.success = true;
              uploadStatus.message = 'success';

              req.uploadStatus = uploadStatus;
              next();
            } else {
              uploadStatus.message = 'Failed to upload file';
              uploadStatus.success = false;
              req.uploadStatus = uploadStatus;
              return next();
            }
          });
        } else {
          //-- on development use local storage

          //-- check if uploadDir exists
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
          }

          //-- read the file been uploaded
          fs.readFile(tempPath, (err, data) => {
            if (err) throw err;

            uploadDir = path.join(uploadDir, newFileName);
            fs.writeFile(uploadDir, data, (err) => {
              if (err) throw err;

              uploadStatus.result['uploadURL'] = uploadDir;
              uploadStatus.result['fileName'] = newFileName;
              uploadStatus.success = true;
              uploadStatus.message = 'success';
              req.uploadStatus = uploadStatus;
              next();
            });
          });
        }
      } else {
        req.uploadStatus = new Feedback(
          null,
          false,
          'Please provide a valid file, file must be in the following format ' +
            filters.join(', ')
        );
        return next();
      }
    });
  };
};
