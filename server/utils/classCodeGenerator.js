// A simple function to generate a 6-character alphanumeric code
const generateClassCode = () => {
    // Generate a random string of 6 uppercase letters and numbers
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

module.exports = generateClassCode;