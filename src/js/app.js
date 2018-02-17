App = {
  web3Provider: null,
  contracts: {},
  ipfs: null,

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

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
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    $.getJSON('Bet.json', function(data) {

      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var BetArtifact = data;
      App.contracts.Bet = TruffleContract(BetArtifact);
    
      // Set the provider for our contract
      App.contracts.Bet.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.testBet();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $('#test-btn').click(App.betButton)
  },

  betButton: function() {
    console.log("-----")
    let a = new Bet(App.contracts, App.ipfs)
    a.getFundingStatus()
  },

  testBet: function() {
    console.log("Hello world!");  

    var betInstance;

    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.resolveBet.call();
    }).catch(function(err) {
      console.log(err.message);
    });

    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.getBetInfo.call();
    }).then(function(p1Address, p1AmountOwed, p1AmountPaid, p2Address, p2AmountOwed, p2AmountPaid, arbAddress, arbReward) {
      
      console.log(p1Address);
      console.log(p2Address);
      console.log(arbAddress);

    }).catch(function(err) {
      console.log(err.message);
    });

  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });    
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });    
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
