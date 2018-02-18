"use strict";

class BetDescription {
    constructor(ipfs) {
        this.ipfs = ipfs
        this.ipfsAddress = ""
        this.description = ""
    }

    setAddress(addr) {
        if (addr && addr != "") {
            this.ipfsAddress = addr
            this.description = ""
            //load desctiption from ipfs
        }
    }

    setText(text) {
        this.description = text
        this.ipfsAddress = ""
    }

    getAddress() {
        if (this.addr == "" && this.description != "") {
            //save to ipfs
            //this.ipfsAddress = 
        }
        this.ipfsAddress = "hashhashhash3"//TEST
        return this.ipfsAddress
    }

    getText() {
        if (this.description == "" && this.ipfsAddress != "") {
            //load from ipfs
            //this.description = 
        }
        return this.description
    }

}

class Bet {
    constructor(contracts, ipfs, initial) {
        initial = initial || {}
        if (contracts == null || ipfs == null) {
            throw "invalid params"
        }
        this.contracts = contracts
        this.ipfs = ipfs

        this.loadedFromContract = false

        this.betId = initial.betId || ""
        if(this.betId != "") {
            // this.load() //now or later
        }

        this.description = new BetDescription(this.ipfs)
        let descriptionText = initial.descriptionText || ""
        let descriptionAddress = initial.descriptionAddress || ""
        this.description.setText(descriptionText)        
        this.description.setAddress(descriptionAddress)


        this.title = initial.title || ""
        this.instigatorAddress = initial.instigatorAddress || ""
        this.targetAddress = initial.targetAddress || ""
        this.instigatorBetAmount = initial.instigatorBetAmount || 0
        this.targetBetAmount = initial.targetBetAmount || 0
        this.arbiterAddress = initial.arbiterAddress || ""
        this.arbiterFee = initial.arbiterFee || 0

        this.descriptionText = initial.descriptionText || ""
        this.instigatorHandle = initial.instigatorHandle || ""
        this.targetHandle = initial.targetHandle || ""
        this.arbiterSigned = initial.arbiterSigned || ""
    }

    create() {
        //ipfs description
        let ipft_addr = this.description.getAddress()
        //validate
        if(ipft_addr == "") {
            throw "you need to write a bet you dummy!" 
        }
        //web3 create contract

        this.contracts.PutUpOrShutUp.deployed().then(instance => {
            return instance.startNewBet(this.instigatorAddress, this.instigatorBetAmount, this.targetAddress, this.targetBetAmount, this.arbiterAddress, this.arbiterFee, ipft_addr)
          }).then(function(){
            window.location.href = `/bet.html?id=${ipft_addr}`
          }).catch(function(err) {
            console.log(err.message);
          });
    }

    async load(ipfs_hash) {
        if(ipfs_hash && ipfs_hash != "") { //optional
            this.description.setAddress(ipfs_hash)
        } else {
            ipfs_hash = this.description.getAddress()
        }

        if(ipfs_hash == "") {
            throw "need a hash"
        }

        //load contract info from web3
        try {
            let pusu = await this.contracts.PutUpOrShutUp.deployed()
            let bet_response = await pusu.getBet.call(ipfs_hash)
            let bet_address = this.contracts.Bet.at(bet_response).address
            console.log(bet_address)
            let bet_instance = this.contracts.Bet.at(bet_address)
            let bet_info = await bet_instance.getBetInfo()
            let bet_resolution_info = await bet_instance.getBetResolutionInfo()

            let betData = {}
            //info
            betData.p1Address = bet_info[0]
            betData.p1Owes = web3.fromWei(bet_info[1].toNumber(), "ether")
            betData.p1Paid = web3.fromWei(bet_info[2].toNumber(), "ether")
            betData.p2Address = bet_info[3]
            betData.p2Owes = web3.fromWei(bet_info[4].toNumber(), "ether")
            betData.p2Paid = web3.fromWei(bet_info[5].toNumber(), "ether")
            betData.arbAddress = bet_info[6]
            betData.arbReward = web3.fromWei(bet_info[7].toNumber(), "ether")
            betData.betLockedIn = bet_info[8]
            betData.arbitorAgreed = bet_info[9]
            betData.arbiterDidWork = bet_info[10]

            //resolution info
            betData.p1Resolution = bet_resolution_info[0].toNumber()
            betData.p2Resolution = bet_resolution_info[1].toNumber()
            betData.arbiterResolution = bet_resolution_info[2].toNumber()
            betData.officialResolution = bet_resolution_info[3].toNumber()

            console.log(betData)

            this.instigatorAddress = betData.p1Address
            this.targetAddress = betData.p2Address
            this.instigatorBetAmount = betData.p1Owes
            this.targetBetAmount = betData.p2Owes
            this.arbiterAddress = betData.arbAddress
            this.arbiterFee = betData.arbReward

            this.betData = betData
            this.loadedFromContract = true
        } catch(e) {
            console.log(e.message)
        }

        return this
}

    resolve(resolution) {
        //'instigator', 'target', 'draw'
        //web3 update contract
    }

    status() {
        // if(this.betId == "") {
        //     return "uninitilized"
        // }
        //web3 check
        // return 'open', 'accepted', 'closed' ?
        let responses = ['uninitilized', 'open', 'accepted', 'closed'] //TEST
        return responses[Math.floor(Math.random()*responses.length)] //TEST
    }

    fundInFull() {
        //web3 check amnt due and send it
    }

    getFundingStatus() {
        if (this.betId == "") {
            throw "bet not initialized"
        }

        //web3 grab funding status
    }

    wonBet() {
        let responses = [true, false] //TEST
        return responses[Math.floor(Math.random()*responses.length)] //TEST
        return false //TODO
    }
 }

 function getAllMyBets(contracts, ipfs) {
     let dummyData = {
        arbiterAddress: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
        arbiterFee: "0.01",
        betId: "ABCDE",
        descriptionText: "bet @TheOnion is not completly accurate.",
        instigatorAddress: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
        instigatorBetAmount: "1.00",
        loadedFromContract: true,
        targetAddress: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
        targetBetAmount: "1.55",
        title: "Someone was wrong on the Interwebs!"
     }

     let builder = () => betBuilder(contracts, ipfs)(dummyData)
     let a = builder({title: "title 1"})
     let b = builder({title: "the king"})
     let c = builder({title: "kaboom"})
     return [a,b,c, builder(dummyData), builder(), builder(), builder(), builder(), builder(), builder(), builder(), builder()]
 }

 function betBuilder(contracts, ipfs) {
     return function(initial) {
         return new Bet(contracts, ipfs, initial)
     }
 }