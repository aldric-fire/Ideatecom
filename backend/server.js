// Convenience entry point so you can run `node backend/server.js` after changing
// into the repository root. It simply loads the actual server implementation
// located in the volunteer-mgmt-mvp workspace.

const path = require('path');

const actualServerPath = path.join(__dirname, '..', 'volunteer-mgmt-mvp', 'backend', 'server');

require(actualServerPath);
