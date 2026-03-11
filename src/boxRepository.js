const { randomUUID } = require('crypto');
const db = require('./db');

/**
 * Create a new box record.
 * @param {{ width: number, height: number, depth: number, colour: string }} data
 * @returns {object} Created box
 */
function createBox(data) {
  const now = new Date().toISOString();
  const box = {
    id: randomUUID(),
    width: data.width,
    height: data.height,
    depth: data.depth,
    colour: data.colour,
    createdAt: now,
    updatedAt: now,
  };
  db.boxes.set(box.id, box);
  return box;
}

/**
 * Return all box records.
 * @returns {object[]}
 */
function getAllBoxes() {
  return Array.from(db.boxes.values());
}

/**
 * Return a single box by ID, or null if not found.
 * @param {string} id
 * @returns {object|null}
 */
function getBoxById(id) {
  return db.boxes.get(id) || null;
}

/**
 * Update an existing box. Returns the updated box or null if not found.
 * @param {string} id
 * @param {{ width?: number, height?: number, depth?: number, colour?: string }} data
 * @returns {object|null}
 */
function updateBox(id, data) {
  const box = db.boxes.get(id);
  if (!box) return null;

  const updated = {
    ...box,
    ...(data.width !== undefined && { width: data.width }),
    ...(data.height !== undefined && { height: data.height }),
    ...(data.depth !== undefined && { depth: data.depth }),
    ...(data.colour !== undefined && { colour: data.colour }),
    updatedAt: new Date().toISOString(),
  };
  db.boxes.set(id, updated);
  return updated;
}

/**
 * Delete a box by ID. Returns true if deleted, false if not found.
 * @param {string} id
 * @returns {boolean}
 */
function deleteBox(id) {
  return db.boxes.delete(id);
}

module.exports = { createBox, getAllBoxes, getBoxById, updateBox, deleteBox };
