// expo-notifications' plugin is auto-applied and adds aps-environment, which a free Apple Personal Team cannot sign.
const { withEntitlementsPlist } = require("expo/config-plugins");
module.exports = (config) =>
  withEntitlementsPlist(config, (c) => {
    delete c.modResults["aps-environment"];
    return c;
  });
