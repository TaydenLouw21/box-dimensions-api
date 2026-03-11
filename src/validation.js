/**
 * Validates box input fields.
 * @param {{ width, height, depth, colour }} body
 * @param {boolean} requireAll - true for POST (all fields required), false for PUT (partial OK)
 * @returns {{ valid: boolean, errors: { field: string, message: string }[] }}
 */
function validateBoxInput(body, requireAll = true) {
  const errors = [];
  const numericFields = ['width', 'height', 'depth'];

  if (requireAll) {
    for (const field of numericFields) {
      if (body[field] === undefined || body[field] === null) {
        errors.push({ field, message: `${field} is required` });
      }
    }
    if (body.colour === undefined || body.colour === null) {
      errors.push({ field: 'colour', message: 'colour is required' });
    }
  }

  for (const field of numericFields) {
    if (body[field] !== undefined && body[field] !== null) {
      const val = Number(body[field]);
      if (isNaN(val) || val <= 0) {
        errors.push({ field, message: `${field} must be a positive number` });
      }
    }
  }

  if (body.colour !== undefined && body.colour !== null) {
    if (typeof body.colour !== 'string' || body.colour.trim() === '') {
      errors.push({ field: 'colour', message: 'colour must be a non-empty string' });
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateBoxInput };
