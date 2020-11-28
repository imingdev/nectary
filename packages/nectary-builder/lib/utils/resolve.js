const path = require('path');

exports.resolve = (...dir) => path.join(__dirname, '..', ...dir);

exports.resolveByProject = (...dir) => path.join(process.cwd(), ...dir);
