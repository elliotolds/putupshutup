var Adoption = artifacts.require("Adoption");
var PutUpOrShutUp = artifacts.require("PutUpOrShutUp");
var Bet = artifacts.require("Bet");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(PutUpOrShutUp);
  deployer.deploy(Bet);
};
