const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const path = require('path');

// Define o formato customizado de log
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Cria o logger com configurações para console e arquivo
const logger = createLogger({
  format: combine(
    colorize(), // Adiciona cores no console
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Adiciona timestamp
    logFormat // Usa o formato customizado
  ),
  transports: [
    new transports.Console(), // Exibe logs no console
    new transports.File({
      filename: path.join(__dirname, 'logs', 'app.log'), // Salva logs em um arquivo
      level: 'info', // Nível de log (info, error, etc.)
      maxsize: 5242880, // 5MB (tamanho máximo do arquivo)
      maxFiles: 5, // Mantém até 5 arquivos de log
      tailable: true, // Faz com que o log rotacione e mantenha o arquivo mais recente
    }),
    new transports.File({
      filename: path.join(__dirname, 'logs', 'error.log'),
      level: 'error', // Nível de log para erros
    }),
  ],
});

// Exporta o logger para ser utilizado em outros arquivos
module.exports = logger;
