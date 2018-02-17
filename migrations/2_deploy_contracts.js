var Adoption = artifacts.require("Adoption");
var PutUpOrShutUp = artifacts.require("PutUpOrShutUp");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(PutUpOrShutUp);
};
