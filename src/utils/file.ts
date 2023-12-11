import fs from 'fs';

const FileUtils = {
  /**
   * 判断文件夹是否存在
   * @param path
   * @returns
   */
  isDirectoryExists(path: string): boolean {
    try {
      // 使用 fs.existsSync 判断路径是否存在
      if (fs.existsSync(path)) {
        // 使用 fs.statSync 获取路径的状态信息
        const stats = fs.statSync(path);

        // 判断是否是一个目录
        return stats.isDirectory();
      }
      // 路径不存在
      return false;
    } catch (error) {
      // 发生错误，路径不存在或者不是一个目录
      return false;
    }
  },
};

export default FileUtils;
