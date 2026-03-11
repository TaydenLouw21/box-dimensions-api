/**
 * In-memory store for box records.
 * Exported as a plain object so tests can reset state easily.
 */
const db = {
  boxes: new Map(),
};

module.exports = db;
