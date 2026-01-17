// Load environment variables from .env file
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const config = require("./config");
const swaggerSpec = require("./config/swagger");
const dbManager = require("./services/dbPoolManager");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// --- Initialize Express App ---
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// --- Swagger API Documentation ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'QueryCompass API Docs',
}));

// --- MOUNT ROUTES ---
app.use('/api', require('./routes/agent'));
app.use('/api/agent/suggestions', require('./routes/suggestions'));
app.use('/api/saved-queries', require('./routes/savedQueries'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/databases', require('./routes/databases'));
app.use('/api/schema', require('./routes/schema'));
app.use('/api/conversations', require('./routes/conversations'));

// --- ERROR HANDLING MIDDLEWARE (must be last) ---
app.use(errorHandler);

// =================================================================
// --- Server Startup ---
// =================================================================
(async () => {
  await dbManager.connectToMongo();
  app.listen(config.port, () => {
    logger.info(`Backend server is listening on http://localhost:${config.port}`);
  });
})();
