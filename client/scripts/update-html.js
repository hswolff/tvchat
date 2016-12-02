const path = require('path');
const fs = require('fs');

const htmlPath = path.resolve(__dirname, '../build/index.html');

const htmlFile = fs.readFileSync(htmlPath, 'utf8');

const replacements = [
  {
    key: 'GRAPHQL_URI',
    newValue: 'http://tv-server.hswolff.com/graphql',
  },
  {
    key: 'WS_URI',
    newValue: 'ws://tv-server.hswolff.com:8020/wschat',
  }
];

const newFile = replacements.reduce((newFile, replacement) => {
  return newFile.replace(
    new RegExp(`(${replacement.key}:")(.+?)(")`),
    `$1${replacement.newValue}$3`
  );
}, htmlFile);

fs.writeFileSync(htmlPath, newFile, 'utf8');
