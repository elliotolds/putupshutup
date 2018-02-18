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

    $.getJSON('PutUpOrShutUp.json', function(data) {

      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PutUpOrShutUpArtifact = data;
      App.contracts.PutUpOrShutUp = TruffleContract(PutUpOrShutUpArtifact);
    
      // Set the provider for our contract
      App.contracts.PutUpOrShutUp.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.testPutUpOrShutUp();
    });

    $.getJSON('Bet.json', function(data) {

      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var BetArtifact = data;
      window.BetArtifact = BetArtifact;
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
    // let a = new Bet(App.contracts, App.ipfs)
    // a.getFundingStatus()
    App.getBetForHash()
  },
  

  testPutUpOrShutUp: function() {
    console.log("testPutUpOrShutUp");  

    var betInstance;


    App.contracts.PutUpOrShutUp.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.startNewBet(
        "0xf17f52151EbEF6C7334FAD080c5704D77216b732", 
        10, 
        "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", 
        10, 
        "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
        2,
        "fdksfhsdfdkasfjsdklaf");
    }).then(function(response) {
      
      console.log("-----")
      console.log(response);
      console.log("-----")

    }).catch(function(err) {
      console.log(err.message);
    });

  },

  getBetsForUser: function() {
    console.log("getBetsForUser");  

    var putUpShutUpInstance;


    App.contracts.PutUpOrShutUp.deployed().then(function(instance) {
      putUpShutUpInstance = instance;
    
      return putUpShutUpInstance.getBetsForUser.call(web3.eth.defaultAccount);
    }).then(function(response) {
      
      console.log("getBetsForUser");
      console.log(response);
  

    }).catch(function(err) {
      console.log(err.message);
    });

  },

  getBetForHash: function() {
    console.log("getBetForHash");  

    var putUpShutUpInstance;


    App.contracts.PutUpOrShutUp.deployed().then(function(instance) {
      putUpShutUpInstance = instance;
    
      return putUpShutUpInstance.getBetsForUser.call();
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");

      var betInstance2 = App.contracts.Bet.at(response);
      console.log("==========");
      console.log(betInstance2);
      console.log("==========");
  

    }).catch(function(err) {
      console.log(err.message);
    });

  },

  
  getAllDataForHash: function() {
    console.log("getAllDataForHash");  

    var putUpShutUpInstance;
    var betInstance;
    var betData = {};

    App.contracts.PutUpOrShutUp.deployed().then(function(instance) {
      putUpShutUpInstance = instance;
    
      return putUpShutUpInstance.getBet.call("fdksfhsdfdkasfjsdklaf");
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");

      betInstance = App.contracts.Bet.at(response);
      console.log("==========");
      console.log(betInstance);
      console.log("==========");

      return betInstance.getBetInfo();
    }).then(function(response) {
      
      console.log("getBetInfo");
      console.log(response);

      betData.p1Address = response[0];
      betData.p1Owes = web3.fromWei(response[1].toNumber(), "ether");
      betData.p1Paid = web3.fromWei(response[2].toNumber(), "ether");
      betData.p2Address = response[3];
      betData.p2Owes = web3.fromWei(response[4].toNumber(), "ether");
      betData.p2Paid = web3.fromWei(response[5].toNumber(), "ether");
      betData.arbAddress = response[6];
      betData.arbReward = web3.fromWei(response[7].toNumber(), "ether");
      betData.betLockedIn = response[8];
      betData.arbitorAgreed = response[9];
      betData.arbiterDidWork = response[10];
      
      return betInstance.getBetResolutionInfo();
      
    }).then(function(response) {
      
      console.log("getBetResolutionInfo");
      console.log(response);
      betData.p1Resolution = response[0].toNumber();
      betData.p2Resolution = response[1].toNumber();
      betData.arbiterResolution = response[2].toNumber();
      betData.officialResolution = response[3].toNumber();

      console.log(betData);

    }).catch(function(err) {
      console.log(err.message);
    });

  },

  depositMoney: function() {
    console.log("depositMoney");  

    var betInstance;


    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.depositFunds({value: 1000000000000000000});
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");
  

    }).catch(function(err) {
      console.log(err.message);
    });

  },

  whoAmI: function() {
    console.log("whoAmI");  
    console.log(web3.eth.defaultAccount);

  },

  agreeToArbitrate: function() {
    console.log("agreeToArbitrate");  

    var betInstance;


    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.agreeToArbitrate();
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");
  
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  
  resolveBet: function() {
    console.log("resolveBet");  

    var betInstance;


    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.resolveBet(1);
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");
  
    }).catch(function(err) {
      console.log(err.message);
    });

  },
  
  
  withdrawBeforeBetLocked: function() {
    console.log("withdrawBeforeBetLocked");  

    var betInstance;


    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.withdrawBeforeBetLocked();
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");
  
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  agreeToArbitrate: function() {
    console.log("agreeToArbitrate");  

    var betInstance;


    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.agreeToArbitrate();
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");
  
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  
  disperseAllFunds: function() {
    console.log("disperseAllFunds");  

    var betInstance;


    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
    
      return betInstance.disperseAllFunds();
    }).then(function(response) {
      
      console.log("+++++")
      console.log(response);
      console.log("+++++");
  
    }).catch(function(err) {
      console.log(err.message);
    });

  },
  

  testBet: function() {
    console.log("testBet");  

    var betInstance;

    var betInstance2 = App.contracts.Bet.at("0xbbe595df857805ab3734f15be990f9a30cbb89f3");
    console.log("==========");
    console.log(betInstance2);
    console.log("==========");

    App.contracts.Bet.deployed().then(function(instance) {
      betInstance = instance;
      console.log(instance.address);

    
      return betInstance.getBetInfo();
    }).then(function(response) {
      
      console.log("getBetInfo");
      console.log(response);

      var p1Address = response[0];
      var p1Owes = response[1];
      var p1Paid = response[2];
      var p2Address = response[3];
      var p2Owes = response[4];
      var p2Paid = response[5];
      var arbAddress = response[6];
      var arbReward = response[7];
      var boola = response[8];
      var bool = response[9];
      var bool = response[10];
      

      return betInstance.getBetResolutionInfo();
      
    }).then(function(response) {
      
      console.log("getBetResolutionInfo");
      console.log(response);

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
