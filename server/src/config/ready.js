const connectDatabase = require("./db");
const seedCatalog = require("./seedCatalog");

let ready;

const ensureReady = () => {
  if (!ready) {
    ready = connectDatabase()
      .then(() => seedCatalog())
      .catch((error) => {
        ready = undefined;
        throw error;
      });
  }

  return ready;
};

module.exports = ensureReady;
