import * as IM from 'imagemagick';
import * as path from 'path';

IM.identify(path.join(__dirname, '../images/dog.jpg'), function (err, metadata) {
  if (err) {
    // return console.error(err);
  }
  // console.log(metadata);
});

IM.resize({
  srcPath: path.join(__dirname, '../images/dog.jpg'),
  dstPath: path.join(__dirname, '../images/dog-small.jpg'),
  width: 256
}, function (err, stdout, stderr) {
  console.log('err', err);
  console.log('stdout', stdout);
  console.log('stderr', stderr);
});
