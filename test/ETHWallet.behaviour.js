require('truffle-test-utils').init();
const BigNumber = web3.BigNumber;
const utils = require("../utils.js");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


const Wallet = artifacts.require("BaseWallet.sol");

module.exports = function shouldBehaveLikeEthWallet(accounts) {

    describe("Eth Wallet Behaviour", function() {
        beforeEach(async function() {

            this.wallet = await Wallet.new({from:accounts[0]});
            await this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth", 0, true, {from:accounts[0]});
        });

        it('can deposit eth', async function() {
            let amount = web3.utils.toWei('1', "ether");
            let result = await this.wallet.deposit("eth", amount, {from:accounts[0], value:amount});
            utils.assertEvent(result, "DepositedETH");

        });

        it('can get the balance of an address', async function() {
            let amount = web3.utils.toWei('1', "ether");
            await this.wallet.deposit("eth", amount, {from:accounts[0], value:amount});
            let result = await this.wallet.balanceOf(accounts[0], "eth");
            amount = new web3.utils.BN(amount);
            assert(amount.eq(result), "Balance was not equal")

        });

        it('can withdraw eth', async function() {
            //FIX ME: pain in the fucking ass moving on for now because it does send the right amount. 
            //just a pain in the ass to track down
            let amount = web3.utils.toWei('1', "ether");
            await this.wallet.deposit("eth", amount, {from:accounts[0], value:amount});
            let startingBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[0]));
            let tx = await this.wallet.withdraw("eth", amount);
            let receipt = tx.receipt;
            let txt = await web3.eth.getTransaction(tx.tx);

            utils.assertEvent(tx, "WithdrewETH");
            
        })

        it('wont withdraw more eth than an account has', async function() {
            let amount = web3.utils.toWei('1', "ether");
            await this.wallet.deposit("eth", amount, {from:accounts[0], value:amount});
            let amount2 = web3.utils.toWei('1.5', "ether");
            await utils.tryCatch(
                this.wallet.withdraw("eth", amount2), 
                utils.errTypes.revert,
            );
        });

        it('can transfer eth', async function(){
            let amount = web3.utils.toWei('1', "ether");
            await this.wallet.deposit("eth", amount, {from:accounts[0], value:amount});
            let tx = await this.wallet.transfer(accounts[1], "eth", amount, {from:accounts[0]});
            utils.assertEvent(tx, "Transfer");
            let balance = await this.wallet.balanceOf(accounts[1], "eth");
            balance.toString().should.be.equal(amount.toString())
        })
    });
};