pragma solidity ^0.4.17;

contract PutUpOrShutUp {

  mapping(bytes32 => Bet) bets;
  mapping(address => bytes32[]) betsForUser;

  function startNewBet(
    address _p1Address,
    uint _p1AmountOwed,
    address _p2Address,
    uint _p2AmountOwed,
    address _arbAddress,
    uint _arbReward,
    bytes32 _hashOfBet) public returns (bool) {
    
    return true;
  }

  function getBet(bytes32 _hashOfBet) public view returns (Bet) {
    return bets[_hashOfBet];
  }

  function getBetsForUser(address _userAddress) public view returns (bytes32[]) {
    return betsForUser[_userAddress];
  }
}

contract Bet {

  function depositFunds() public payable {

  }

  function resolveBet() public {

  }

  function getBetInfo() public returns (address, uint, uint, address, uint, uint, address, uint) {

    return (0xf17f52151EbEF6C7334FAD080c5704D77216b732, 10, 0, 0x627306090abaB3A6e1400e9345bC60c78a8BEf57, 10, 0, 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef, 2);
  }

}
