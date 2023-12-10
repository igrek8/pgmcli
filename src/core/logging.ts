export enum LogLevel {
  DEBUG = "DEBUG",
  LOG = "LOG",
  INFO = "INFO",
  NOTICE = "NOTICE",
  WARNING = "WARNING",
  ERROR = "ERROR",
}

export enum ServerSeverity {
  DEBUG = "DEBUG",
  LOG = "LOG",
  INFO = "INFO",
  NOTICE = "NOTICE",
  WARNING = "WARNING",
  EXCEPTION = "EXCEPTION",
}

export function getConsoleLevel(severity?: string): "debug" | "log" | "info" | "warn" | "error" {
  switch (severity) {
    case ServerSeverity.EXCEPTION:
      return "error";
    case ServerSeverity.WARNING:
      return "warn";
    case ServerSeverity.INFO:
      return "info";
    case ServerSeverity.DEBUG:
      return "debug";
    default:
      return "log";
  }
}

export function toServerSeverity(logLevel: LogLevel): ServerSeverity {
  switch (logLevel) {
    case LogLevel.DEBUG:
      return ServerSeverity.DEBUG;
    case LogLevel.LOG:
      return ServerSeverity.LOG;
    case LogLevel.INFO:
      return ServerSeverity.INFO;
    case LogLevel.NOTICE:
      return ServerSeverity.NOTICE;
    case LogLevel.WARNING:
      return ServerSeverity.WARNING;
    case LogLevel.ERROR:
      return ServerSeverity.EXCEPTION;
    default:
      return ServerSeverity.LOG;
  }
}
