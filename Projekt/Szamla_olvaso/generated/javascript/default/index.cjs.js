const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'Szamla_olvaso',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

