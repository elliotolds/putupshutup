App = {
  web3Provider: null,
  contracts: {},
  ipfs: null,

  init: function() {
    App.ipfs = new IPFS();
    App.ipfs.setProvider({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    // const hash = "QmQtwERJbXkS34fdQbk4HLyyW9sc4TXZ4XvAMUZwzCXPWD";
    // App.ipfs.cat(hash, (err, data) => {
    //   if (err) {
    //     return console.log(err);
    //   }
    //   console.log("DATA:", data);
    // });

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
        return App.loadBets();
      });
      
    });

    return App.bindEvents();
  },

  loadBets: async function() {
    App.bets = await getAllMyBets(App.contracts, App.ipfs)
    return this.displayBets()
  },

  bindEvents: function() {
  },

  displayBets: function() {
    let betWithStatus = this.bets.map(bet => {
      return {bet: bet, status: bet.status()}
    })
    let a = groupBy(betWithStatus, "status")

    let closedList = $('#closed-bets-list')
    let acceptedList = $('#accepted-bets-list')
    let proposedList = $('#proposed-bets-list')
    
    a['closed'] = a['closed'] || []
    a['open'] = a['open'] || []
    a['accepted'] = a['accepted'] || []

    a['closed'].forEach(elm => {
      let bet = elm.bet
      closedList.append(closedBetView(bet.title, bet.wonBet()))
    });

    a['open'].forEach(elm => {
      let bet = elm.bet
      proposedList.append(proposedBetView(bet))
    });

    a['accepted'].forEach(elm => {
      let bet = elm.bet
      acceptedList.append(acceptedBetView(bet))
    });
    // .append(closedBetView("@@@Lorem ipsum dolor sit amet, consectetur adipiscing elit", true))
    
    // closedList.append(closedBetView("@@@wahhh", true))
    // closedList.append(closedBetView("@@@Ladipiscing elit", true))
    // closedList.append(closedBetView("YEYAE", false))

    // acceptedList.append(acceptedBetView("I BET agains @Matthewgard1"))
    // acceptedList.append(acceptedBetView())

    // proposedList.append(proposedBetView())
    // proposedList.append(proposedBetView("I BET against @_Kevin_Pham for lots of $$$"))
    // proposedList.append(proposedBetView())


    // Object.keys(a).map(x=> a[x] = a[x].length)
    //   console.log(a)
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

function closedBetView(title, isWinner) {
  let winnerTag = '<span class="float-right badge badge-danger badge-pill font-weight-normal green">won</span>'
  let loserTag = '<span class="float-right badge badge-danger badge-pill font-weight-normal">lost</span>'
  return `<a href="#" class="list-group-item"><p class="list-group-item-text m-0 d-inline">${title}</p>${isWinner ? winnerTag : loserTag}</a>`
}

//https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png
//https://twitter.com/CryptoKitties/profile_image?size=original
function findAProfilePic(description) {
  let img = "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"

  if (description) {
    let handle = /@(\w+)/.exec(description)
    if(handle) {
      img = `https://twitter.com/${handle[1]}/profile_image?size=original`
    }
  }
  return img

}

function acceptedBetView(bet) {
  return `<li class="list-group-item d-block">
  <div class="row">
      <div class="col-12 col-sm-6 col-md-2">
          <img src="${findAProfilePic(bet.description.getText())}" alt="" class="img-fluid rounded-circle mx-auto d-block">
      </div>
      <div class="col-12 col-sm-6 col-md-10 text-center text-sm-left">
          <span class="fa fa-mobile fa-2x text-success float-right pulse" title="online now"></span>
          <label class="name">${bet.title}</label>
          <br> 
          <a href="#">${bet.instigatorAddress}</a> <span class="text-muted">bets</span> <a href="#">${bet.targetAddress}</a>
          <br>
          ${bet.instigatorBetAmount} vs ${bet.targetBetAmount} eth <span class="text-muted small"> <!--on </span> 2.18.2018-->
          <br>
          <a href="bet.html?id=${bet.betId}" class="link small text-truncate">View Bet</a>
      </div>
  </div>
</li>`
}

function proposedBetView(bet) {
  return `<li class="list-group-item d-block">
  <div class="row">
      <div class="col-12 col-sm-6 col-md-2">
          <img src="${findAProfilePic(bet.description.getText())}" alt="" class="img-fluid rounded-circle mx-auto d-block">
      </div>
      <div class="col-12 col-sm-6 col-md-10 text-center text-sm-left">
          <span class="fa fa-mobile fa-2x text-success float-right pulse" title="online now"></span>
          <label class="name">${bet.title}</label>
          <br> 
          <a href="#">${bet.instigatorAddress}</a> <span class="text-muted">bets</span> <a href="#">${bet.targetAddress}</a>
          <br>
          ${bet.instigatorBetAmount} vs ${bet.targetBetAmount} eth <span class="text-muted small"><!-- on </span> 2.18.2018-->
          <br>
          <a href="bet.html?id=${bet.betId}" class="link small text-truncate">View Bet</a>
      </div>
  </div>
</li>`
}