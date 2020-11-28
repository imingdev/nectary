const fs = require('fs');

// 检查文件是否存在,存在返回当前路径
exports.checkFileExists = (file, suffixList = ['js', 'jsx']) => {
  const fileList = Array.isArray(file) ? file : [file];
  for (let i = 0; i < fileList.length; i++) {
    const _file = fileList[i];
    for (let j = 0; j < suffixList.length; j++) {
      const _suffix = suffixList[j];
      const currentFile = `${_file}.${_suffix}`;
      if (fs.existsSync(currentFile)) return currentFile;
    }
  }
  return false
}
