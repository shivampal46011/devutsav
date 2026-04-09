import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 1. Standard Logger for general API application logs
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    }),
    new winston.transports.File({ filename: path.join(logsDir, 'api.log') })
  ]
});

// 2. DevPunya Specific Logger: For detailed payloads & status codes
// We use a custom format so we can dump full object metadata cleanly to the file
export const devpunyaLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      // Dump full metadata JSON if it exists
      const meta = Object.assign({}, info);
      delete meta.level;
      delete meta.message;
      delete meta.timestamp;
      
      const hasMeta = Object.keys(meta).length > 0;
      const metaString = hasMeta ? `\nDetails: ${JSON.stringify(meta, null, 2)}` : '';
      
      return `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}${metaString}\n----------------------------------------`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'devpunya.log') }),
    new winston.transports.File({ filename: path.join(logsDir, 'api.log') })
  ]
});

// 3. LLM Response Logger: Full request inputs + raw LLM outputs
export const llmLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const meta = Object.assign({}, info);
      delete meta.level; delete meta.message; delete meta.timestamp;
      const hasMeta = Object.keys(meta).length > 0;
      const metaString = hasMeta ? `\n${JSON.stringify(meta, null, 2)}` : '';
      return `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}${metaString}\n${'─'.repeat(80)}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'llm.log') })
  ]
});
