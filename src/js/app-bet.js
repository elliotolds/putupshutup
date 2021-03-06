App = {
  web3Provider: null,
  contracts: {},
  ipfs: null,

  init: function() {
    App.ipfs = new IPFS();
    App.ipfs.setProvider({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    const hash = "QmQtwERJbXkS34fdQbk4HLyyW9sc4TXZ4XvAMUZwzCXPWD";
    App.ipfs.cat(hash, (err, data) => {
      if (err) {
        return console.log(err);
      }
      console.log("DATA:", data);
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    App.web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Bet.json', function(data) {

      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var BetArtifact = data;
      App.contracts.Bet = TruffleContract(BetArtifact);
    
      // Set the provider for our contract
      App.contracts.Bet.setProvider(App.web3Provider);

      $.getJSON('PutUpOrShutUp.json', function(data) {

        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var PutUpOrShutUpArtifact = data;
        App.contracts.PutUpOrShutUp = TruffleContract(PutUpOrShutUpArtifact);
      
        // Set the provider for our contract
        App.contracts.PutUpOrShutUp.setProvider(App.web3Provider);
        return App.bindEvents();
      });
    });   

  },

  getCurrentAccount: function() {
    App.currentAccount = App.web3.eth.defaultAccount;
    App.showCurrentAccountButtons();
  },

  showCurrentAccountButtons: function() {
    if (App.currentAccount == App.bet.instigatorAddress.toLowerCase()) {
      $('#bettor-funds-btn').removeClass('hidden');
    } else if (App.currentAccount == App.bet.targetAddress.toLowerCase()) {
      $('#taker-funds-btn').removeClass('hidden');
    } else if (App.currentAccount == App.bet.arbiterAddress.toLowerCase()) {
      if (App.bet.arbiterSigned) {
        $('#arbiter-agree-confirmation').removeClass('hidden');
      } else {
        $('#arbiter-agree-prompt').removeClass('hidden');
      }
    }
  },

  bindEvents: function() {
    $('#create-bet-btn').click(App.betButton);
    $('#bettor-wins-btn').click({winner: "bettor"}, App.voteWinner);
    $('#bettor-funds-btn').click({funder: "bettor"}, App.fundBet);
    $('#taker-wins-btn').click({winner: "taker"}, App.voteWinner);
    $('#taker-funds-btn').click({funder: "taker"}, App.fundBet);
    $('#tie-btn').click({winner: "tie"}, App.voteWinner);

    return App.loadBet();
  },

  voteWinner: function(e) {
    e.preventDefault();
    
    var entityNumber = 0;
    var betInstance;

    if (e.data.winner == "bettor") {
      entityNumber = 1;
    } else if (e.data.winner == "taker") {
      entityNumber = 2;
    } else if (e.data.winner == "tie") {
      entityNumber = 3;
    }

    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.resolveBet(entityNumber);
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");
  
    }).catch(function(err) {
      console.log(err.message);
    });

    console.log(e.data.winner + " received vote for winner");
  },

  fundBet: function(e) {
    e.preventDefault();
    var betInstance;
    var amount;
    
    var hashAddress = App.bet.description.getAddress();
    var contractAddress = App.bet.betId;

    if (e.data.funder == "bettor") {
      amount = App.bet.instigatorBetAmount;
    } else {
      amount = App.bet.targetBetAmount;
    }
    amount = App.web3.toWei(amount);

    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.depositFunds({value: amount});
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");
  

    }).catch(function(err) {
      console.log(err.message);
    });
    



    // make a call to smart contract
    console.log(e.data.funder + " funded bet");
  },

  agreeArbitrate: function(e) {
    e.preventDefault();

    console.log("Arbiter agreed to arbitrate");
  },

  loadBet: function() {
    let bet = new Bet(App.contracts, App.ipfs);

    var url_string = window.location.href
    var url = new URL(url_string);
    var ipfs_hash = url.searchParams.get("id");
    console.log(ipfs_hash);    

    return bet.load(ipfs_hash).then(x=> {

      console.log("loaded bet: ", bet);
      
      App.bet = bet;
      App.updateBetUI(bet);
  
      App.getCurrentAccount();

    })
  },

  dummyData: function() {
    var betData = {};
    betData.arbiterAddress = "0x089E216791A8cD9A9f281D95346CBF5B25059E0D"
    betData.arbiterFee = "0.0005",
    betData.arbiterSigned = false,
    betData.arbiterHandle = "@impartial_judge"
    betData.descriptionText = "Donec erat velit, ullamcorper vel libero sit amet, porta lobortis velit. Vestibulum varius eros at pulvinar consequat. Sed mi lorem, scelerisque nec odio sed, laoreet laoreet purus. Vestibulum laoreet consectetur arcu, vel vehicula odio pellentesque id. Fusce interdum, eros eu egestas sollicitudin, massa neque molestie lectus, non placerat est ante a urna."
    betData.instigatorAddress = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57"
    betData.instigatorBetAmount = "0.005"
    betData.instigatorHandle = "@rational_talker"
    betData.targetHandle = "@mean_guy"
    betData.targetAddress = "0x36fa562926C17328AA93e02CA33a423a0636142B"
    betData.targetBetAmount = "0.005"
    betData.title = "Lorem ipsum dolor sit amet, consectetur adipiscing elit"

    return betData;
  },

  updateBetUI: function(bet) {
    document.getElementById('bet-title').innerHTML = bet.title;
    document.getElementById('bet-description').innerHTML = bet.descriptionText;
    document.getElementById('bettor-twitter').value = bet.instigatorHandle;
    document.getElementById('bettor-wallet').value = bet.instigatorAddress;
    document.getElementById('bettor-amount').value = bet.instigatorBetAmount;
    document.getElementById('bettor-paid').value = bet.betData.p1Paid;
    document.getElementById('taker-twitter').value = bet.targetHandle;
    document.getElementById('taker-wallet').value = bet.targetAddress;
    document.getElementById('taker-amount').value = bet.targetBetAmount;
    document.getElementById('taker-paid').value = bet.betData.p2Paid;

    document.getElementById('metamask-id').innerHTML = "something";

    console.log("updated ui with bet detail");
    return;
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});