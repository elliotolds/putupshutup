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
    bytes32 _hashOfBet) public returns (bool)
  {
    
    Bet b = new Bet(
      _p1Address,
      _p1AmountOwed,
      _p2Address,
      _p2AmountOwed,
      _arbAddress,
      _arbReward,
      _hashOfBet);

    bets[_hashOfBet] = b;

    betsForUser[_p1Address].push(_hashOfBet);
    betsForUser[_p2Address].push(_hashOfBet);
    betsForUser[_arbAddress].push(_hashOfBet);
    
    return true;
  }

  function getBet(bytes32 _hashOfBet) public view returns (Bet) {
    return bets[_hashOfBet];
  }

  function getBetsForUser(address _userAddress) public view returns (bytes32[]) {
    return betsForUser[_userAddress];
  }

  function getDemoBet() public returns (Bet) {

    Bet b = new Bet(
        0xf17f52151EbEF6C7334FAD080c5704D77216b732, 
        10, 
        0x627306090abaB3A6e1400e9345bC60c78a8BEf57, 
        10, 
        0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef,
        2,
        "fdksfhsdfdkasfjsdklaf"
        );

    return b;
  }
}

contract Bet {

  enum Resolution { None, P1Wins, P2Wins, Draw }

  address p1Address;
  uint p1AmountOwed;
  uint p1AmountPaid;
  address p2Address;
  uint p2AmountOwed;
  uint p2AmountPaid;
  address arbAddress;
  uint arbReward;
  bytes32 hashOfBet;

  bool arbitorAgreed; // Did arbiter say they're willing to judge the outcome?
  bool betLockedIn; // is the bet locked in? (people have paid, arbiter has agreed)

  Resolution p1Resolution;
  Resolution p2Resolution;
  Resolution arbiterResolution;
  Resolution officialResolution; // Derived from other resolutions. Used to control how funds are dispersed

  bool arbiterDidWork;

  function Bet(
    address _p1Address,
    uint _p1Owed,
    address _p2Address,
    uint _p2Owed,
    address _arbAddress,
    uint _arbReward,
    bytes32 _hashOfBet
  ) {

    require(_p1Owed > arbReward && p2Owed > arbReward);

    p1Address = _p1Address;
    p1AmountOwed = _p1Owed;
    p2Address = _p2Address;
    p2AmountOwed = _p2Owed;
    arbAddress = _arbAddress;
    arbReward = _arbReward;
    hashOfBet = _hashOfBet;
  }

  function depositFunds() public payable {
    if ( msg.sender == p1Address) {
      p1AmountPaid += msg.value;
    } else if (msg.sender == p2Address) {
      p2AmountPaid += msg.value;
    }

    if ( arbitorAgreed && p1AmountPaid >= p1AmountOwed && p2AmountPaid >= p2AmountOwed ) {
      betLockedIn = true;
    }
  }

  function agreeToArbitrate() public {
    if ( msg.sender == arbAddress ) {
      arbitorAgreed = true;
    }

    if ( arbitorAgreed && p1AmountPaid >= p1AmountOwed && p2AmountPaid >= p2AmountOwed ) {
      betLockedIn = true;
    }
  }

  function resolveBet( Resolution _res) public {
    require(betLockedIn && officialResolution == Resolution.None);

    bool senderIsArbiter = false;

    if (msg.sender == p1Address) {
      p1Resolution = _res;
    } else if (msg.sender == p2Address) {
      p2Resolution = _res;
    } else if (msg.sender == arbAddress) {
      arbiterResolution = _res;
      senderIsArbiter = true;
    }

    if (p1Resolution != Resolution.None && 
      (p1Resolution == p2Resolution || p1Resolution == arbiterResolution)) {
        // We have agreement on p1's view
        officialResolution = p1Resolution;
    } else if (p2Resolution != Resolution.None && p2Resolution == arbiterResolution) {
        // We have agreement on p2's view 
        // (and it must be with arbiter, otherwise we wouldn't be in this case)
        officialResolution = p2Resolution;
    }

    if (officialResolution != Resolution.None) {
      arbiterDidWork = arbiterResolution != Resolution.None; // Race condition?
    }
  }

  function withdrawBeforeBetLocked() public {
    require(!betLockedIn);

    if (msg.sender == p1Address) {
      p1Address.transfer(p1AmountPaid);
    } else if (msg.sender == p2Address) {
      p2Address.transfer(p2AmountPaid);
    }
  }

  function disperseAllFunds() public {
    require(officialResolution != Resolution.None);

    // First ensure arbiter is paid
    assert (this.balance >= arbReward); // Both parties each transferred enough for the full arbiter reward
    arbAddress.transfer(arbReward);
    
    // if there was a winner, disperse the rest of the funds to them
    if (officialResolution == Resolution.P1Wins) {
      p1Address.transfer(this.balance);
    } else if (officialResolution == Resolution.P2Wins) {
      p2Address.transfer(this.balance);
    } else {
      // It was a tie -- disperse funds in proportion to what they paid in

      if (p1AmountOwed == p2AmountOwed) {
        // Save ourseleves some expensive math calculations in the case that both owed the same amount
        p1Address.transfer(this.balance/2); 
        p2Address.transfer(this.balance);
      } else {
        // Return the fraction of the remaining funds to p1 corresponding to the fraction of the total they bet.
        // We need to subtrat the arbiter award because it isn't part of the bet and skews the bet ratio.
        uint p1BetAmount = p1AmountOwed - arbReward;
        uint p2BetAmount = p2AmountOwed - arbReward;
        p1Address.transfer((this.balance * uint256(p1BetAmount)) / (p1BetAmount + p2BetAmount));
        p2Address.transfer(this.balance);
      }
    }

  }

  function getBetInfo() public view returns (address, uint, uint, address, uint, uint, address, uint) {
    return (p1Address, p1AmountOwed, p1AmountPaid, p2Address, p2AmountOwed, p2AmountPaid, arbAddress, arbReward);
  }

}
