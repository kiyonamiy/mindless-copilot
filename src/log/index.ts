import chalk from 'chalk';

const LogLevelEnum = {
  ['DEBUG']: {
    prefix: 'DEBUG',
    color: '#f4f5f4',
    level: 0,
  },
  ['INFO']: {
    prefix: 'INFO',
    color: '#abc8fb',
    level: 1,
  },
  ['SUCCESS']: {
    prefix: 'SUCCESS',
    color: '#72c240',
    level: 2,
  },
  ['WARN']: {
    prefix: 'WARN',
    color: '#efb041',
    level: 3,
  },
  ['ERROR']: {
    prefix: 'ERROR',
    color: '#ec5b56',
    level: 4,
  },
} as const;

export default class Logger {
  static debug(message: string) {
    Logger.printLog('DEBUG', message);
  }

  static info(message: string) {
    Logger.printLog('INFO', message);
  }

  static success(message: string) {
    Logger.printLog('SUCCESS', message);
  }

  static warn(message: string) {
    Logger.printLog('WARN', message);
  }

  static error(message: string) {
    Logger.printLog('ERROR', message);
  }

  static printLog(logLevel: keyof typeof LogLevelEnum, message: string) {
    const currentLogLevel = parseInt(process.env.LOG_LEVEL || '0');

    if (LogLevelEnum[logLevel].level >= currentLogLevel) {
      const { color, prefix } = LogLevelEnum[logLevel];
      console.log(
        `${chalk.bgHex(color)(`[${prefix}]`)} ${chalk.hex(color)(message)}`,
      );
    }
  }
}
