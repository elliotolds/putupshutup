pragma solidity ^0.4.17;

contract PutUpOrShutUp {

  mapping(bytes32 => Bet) bets;
  mapping(address => bytes32[]) betsForUser;

  function startNewBet(
    address _p1Address,
    uint p1AmountOwed,
    address _p2Address,
    uint p2AmountOwed,
    address _arbAddress,
    uint arbReward,
    bytes32 _hashOfBet) public returns (bool) {

      Bet b = new Bet(
        _p1Address,
        p1AmountOwed,
        _p2Address,
        p2AmountOwed,
        _arbAddress,
        arbReward,
        _hashOfBet);

    bets[_hashOfBet] = b;

    // TODO: poopulate betsForUser
    //betsForUser[_p1Address]
    
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
    address _p1Addrress,
    uint _p1Owed,
    address _p2Address,
    uint _p2Owed,
    address _arbAddress,
    uint _arbReward,
    bytes32 _hashOfBet
  ) {
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
    } else if (msg.sender == p2.Address) {
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
  }

  function resolveBet( Resolution _res) public {
    require(officialResolution == Resolution.None);

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
    if (msg.sender == p1Address) {
      p1Address.transfer(p1AmountPaid);
    } else if (msg.sender == p2Address) {
      p2Address.transfer(p2AmountPaid);
    }
  }

  function disperseAllFunds() public {
    require(officialResolution != Resolution.None);

    // First ensure arbiter is paid
    if (this.balance < arbReward) {
      arbAddress.transfer(this.balance);
      return;
    } else {
      arbAddress.transfer(arbReward);
    }
    
    // if there was a winner, disperse the rest of the funds to them
    if (officialResolution == Resolution.P1Wins) {
      p1Address.transfer(balance);
    } else if (officialResolution == Resolution.P2Wins) {
      p2address.transfer(balance);
    } else {
      // It was a tie -- disperse funds in proportion to what they paid in
      // TODO: fix this... it's currently broken
      p1Address.transfer(balance/2); // WRONG
      p2Address.transfer(balance);  
    }

  }

  function getBetInfo() public returns (address, uint, address, uint, address, uint) {

    return (0xf17f52151EbEF6C7334FAD080c5704D77216b732, 10, 0x627306090abaB3A6e1400e9345bC60c78a8BEf57, 10, 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef, 2);
  }
}
