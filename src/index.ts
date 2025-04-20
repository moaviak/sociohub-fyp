import dotenv from "dotenv";

import { httpServer } from "./app";
import logger from "./logger/winston.logger";

dotenv.config();

const startServer = () => {
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    logger.info("⚙️  Server is running on port: " + PORT);
  });
};

startServer();
