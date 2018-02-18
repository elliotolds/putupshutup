var Adoption = artifacts.require("Adoption");
var PutUpOrShutUp = artifacts.require("PutUpOrShutUp");
var Bet = artifacts.require("Bet");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(PutUpOrShutUp);
  deployer.deploy(Bet, "0xf17f52151EbEF6C7334FAD080c5704D77216b732", 
    10, 
    "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", 
    10, 
    "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
    2,
    "fdksfhsdfdkasfjsdklaf",{gas: 4700000});

};
