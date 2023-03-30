// Import the "crudController" module from a local file
const methods = require("./crudController");

// Export the result of calling "crudController" with the argument "Client"
module.exports = methods.crudController("Client");
