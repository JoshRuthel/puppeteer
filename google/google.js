const { Storage } = require('@google-cloud/storage');
// const path = require('path');

const storage = new Storage({
    projectId: "super-shopper",
    keyFilename: "google/service-account.json",
  });

const bucketName = 'rooth-picture-bucket';

module.exports = {
    storage,
    bucketName,
}