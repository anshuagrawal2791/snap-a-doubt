'use strict';
const fs = require('fs');

module.exports.delete = (path, callback) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + '/' + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    callback('deleted uploads from directory');
  } else {
    	console.log('noo');
  }
};
