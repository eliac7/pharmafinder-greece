import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

let transport: pino.TransportMultiOptions | pino.TransportSingleOptions | undefined;

if (isDevelopment) {
  try {
    require.resolve("pino-pretty");
    transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    };
  } catch {
    transport = undefined;
  }
}

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport,
});
