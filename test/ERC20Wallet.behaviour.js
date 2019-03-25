require('truffle-test-utils').init();
const BigNumber = web3.BigNumber;
const utils = require("../utils.js");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


const Wallet = artifacts.require("BaseWallet.sol");
const MockERC20 = artifacts.require("MockERC20.sol");

module.exports = function shouldBehaveLikeERC20Wallet(accounts) {

    describe("ERC20 Wallet Behaviour", function(){
        beforeEach(async function() {
            this.wallet = await Wallet.new({from:accounts[0]});
            this.token = await MockERC20.new("TestToken", "ttn", 18, {from:accounts[0]})
            await this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth", 0, true, {from:accounts[0]});
            await this.wallet.add_token(this.token.address, "TestToken", "ttn", 1, true, {from:accounts[0]});
            await this.token.mint(accounts[0], web3.utils.toWei('100', "ether"));
        });

        it('can deposit an erc20 token', async function() {
            let amount = web3.utils.toWei('1', "ether");
            await this.token.approve(this.wallet.address, amount);
            let result = await this.wallet.deposit("ttn", amount, {from:accounts[0]});
            utils.assertEvent(result, "DepositedERC20");

        });

        it('can get the erc20 balance of an address', async function() {
            let amount = web3.utils.toWei('1', "ether");
            await this.token.approve(this.wallet.address, amount);
            await this.wallet.deposit("ttn", amount, {from:accounts[0]});
            let result = await this.wallet.balanceOf(accounts[0], "ttn");
            amount = new web3.utils.BN(amount);
            assert(amount.eq(result), "Balance was not equal")
        });

        it('will not update erc20 balance when transfer fails', async function() {
            let amount = web3.utils.toWei('1', "ether");
            await utils.tryCatch(
                this.wallet.deposit("ttn", amount, {from:accounts[1]}), 
                utils.errTypes.revert,
            );

            let balance = await this.wallet.balanceOf(accounts[1], "ttn");
            zero = new web3.utils.BN("0");
            assert(balance.eq(zero), "balance was not zero");
        });

        it('can withdraw erc20 tokens', async function() {
            let amount = web3.utils.toWei('1', "ether");
            await this.token.approve(this.wallet.address, amount);
            await this.wallet.deposit("ttn", amount, {from:accounts[0]});
            let result = await this.wallet.withdraw("ttn", amount, {from:accounts[0]});
            let allowance = await this.token.allowance(this.wallet.address, accounts[0]);
            allowance.toString().should.be.equal(new web3.utils.BN(amount).toString())

            utils.assertEvent(result, "WithdrewERC20");

        });

        it('wont allow more erc20 tokens to be withdrawn than an account has', async function() {
            let amount = web3.utils.toWei('1', "ether");
            let amount2 = web3.utils.toWei('1.5', "ether");
            await this.token.approve(this.wallet.address, amount);
            await this.wallet.deposit("ttn", amount, {from:accounts[0]});
            await utils.tryCatch(
                this.wallet.withdraw("ttn", amount2, {from:accounts[0]}), 
                utils.errTypes.revert,
            );
        });

        it('can transfer erc20 tokens', async function(){
            let amount = web3.utils.toWei('1', "ether");
            await this.token.approve(this.wallet.address, amount);
            await this.wallet.deposit("ttn", amount, {from:accounts[0]});
            let tx = await this.wallet.transfer(accounts[1], "ttn", amount, {from:accounts[0]});
            utils.assertEvent(tx, "Transfer");
            let balance = await this.wallet.balanceOf(accounts[1], "ttn");
            balance.toString().should.be.equal(amount.toString())
        });

        it('wont allow more erc20 tokens to be transfered than an account has', async function() {
            let amount = web3.utils.toWei('1', "ether");
            let amount2 = web3.utils.toWei('1.5', "ether");
            await this.token.approve(this.wallet.address, amount);
            await this.wallet.deposit("ttn", amount, {from:accounts[0]});
            await utils.tryCatch(
                this.wallet.transfer(accounts[1], "ttn", amount2, {from:accounts[0]}), 
                utils.errTypes.revert,
            );
        });
    });
    
}