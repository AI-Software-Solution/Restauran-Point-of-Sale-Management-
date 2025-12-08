/**
 * Validate if the given id is a valid integer ID
 * Replaces mongoose.Types.ObjectId.isValid()
 * @param {string|number} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidId = (id) => {
    const parsed = parseInt(id, 10);
    return !isNaN(parsed) && parsed > 0 && Number.isInteger(parsed);
};

module.exports = { isValidId };
