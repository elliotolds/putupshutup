"use strict";

class BetDescription {
    constructor(ipfs) {
        this.ipfs = ipfs
        this.ipfsAddress = ""
        this.description = ""
    }

    setAddress(addr) {
        this.ipfsAddress = addr
        this.description = ""
        //load desctiption from ipfs
    }

    setText(text) {
        this.description = text
        this.ipfsAddress = ""
    }

    getAddress() {
        if (this.addr == "" && this.description != "") {
            //save to ipfs
            //this.ipfsAddress = 
            return this.ipfsAddress
        }
    }

    getText() {
        if (this.description = "" && this.ipfsAddress != "") {
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

        this.loadedFromContract = false

        this.betId = initial.betId || ""
        if(this.betId != "") {
            //this.load() //now or later
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
    }

    create() {
        //validate
        //ipfs description
        let ipft_addr = this.description.getAddress()
        //web3 create contract
        //this.betId = 
    }

    load(betId) {
        if(betId) { //optional
            this.betId = betId
        }

        //load contract info from web3
        this.loadedFromContract = true
    }

    resolve(resolution) {
        //'instigator', 'target', 'draw'
        //web3 update contract
    }

    status() {
        if(this.betId == "") {
            return "uninitilized"
        }
        //web3 check
        // return 'open', 'accepted', 'closed' ?
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
 }

 function getAllMyBets() {
     return []
 }

 function betBuilder(contracts, ipfs) {
     return function(initial) {
         return new Bet(contracts, ipfs, initial)
     }
 }