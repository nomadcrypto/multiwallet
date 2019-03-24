const BigNumber = web3.BigNumber;
const utils = require("../utils.js");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


const Wallet = artifacts.require("BaseWallet.sol");
const MockERC721 = artifacts.require("MockERC721.sol");

module.exports = function shouldBehaveLikeERC721Wallet(accounts) {

	describe("ERC721 Wallet Behaviour", function(){
		beforeEach(async function() {
			this.wallet = await Wallet.new({from:accounts[0]});
			this.token = await MockERC721.new("TestToken", "ttn", {from:accounts[0]})
			await this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth", 0, true, {from:accounts[0]});
			await this.wallet.add_token(this.token.address, "TestToken", "ttn", 2, false, {from:accounts[0]});
			await this.token.mint(accounts[0]);
			await this.token.mint(accounts[0]);
			await this.token.mint(accounts[0]);
			await this.token.mint(accounts[0]);
		});

		it('can deposit an erc721 token', async function() {
			
			await this.token.approve(this.wallet.address, 1);
			let result = await this.wallet.deposit("ttn", 1, {from:accounts[0]});
			utils.assertEvent(result, "DepositedERC721");

		});

		it('can get the erc721 balance of an address', async function() {
			let amount = 1
			await this.token.approve(this.wallet.address, amount);
			await this.wallet.deposit("ttn", amount, {from:accounts[0]});
			let result = await this.wallet.balanceOf(accounts[0], "ttn");
			amount = new web3.utils.BN(amount);
			assert(amount.eq(result), "Balance was not equal")
		});

		it('can get withdraw an erc721 token', async function() {
			let tokenid = 1
			await this.token.approve(this.wallet.address, tokenid);
			await this.wallet.deposit("ttn", tokenid, {from:accounts[0]});
			wresult = await this.wallet.withdraw("ttn", tokenid, {from:accounts[0]})
			var result = await this.token.getApproved(tokenid);
			result.should.equal(accounts[0]);
			var balance = await this.wallet.balanceOf(accounts[0], "ttn");
			balance.toNumber().should.be.equal(0);
			utils.assertEvent(wresult, "WithdrewERC721");


		});

		it("will correctly remove the erc721 token from the available tokens", async function() {
			await this.token.approve(this.wallet.address, 2);
			await this.wallet.deposit("ttn", 2, {from:accounts[0]});
			await this.token.approve(this.wallet.address, 3);
			await this.wallet.deposit("ttn", 3, {from:accounts[0]});
			await this.wallet.withdraw("ttn", 2, {from:accounts[0]})
			var result = await this.token.getApproved(2);
			result.should.equal(accounts[0]);
			var balance = await this.wallet.balanceOf(accounts[0], "ttn");
			balance.toNumber().should.be.equal(1)
		});

		it("wont allow someone to withdraw a token they dont own", async function(){
			await this.token.approve(this.wallet.address, 1);
			await this.wallet.deposit("ttn", 1, {from:accounts[0]});
			await utils.tryCatch(
				this.wallet.withdraw("ttn", 1, {from:accounts[1]}), 
				utils.errTypes.revert,
			);
		});

		it("can transfer erc721 tokens", async function() {
			await this.token.approve(this.wallet.address, 1);
			await this.wallet.deposit("ttn", 1, {from:accounts[0]});
			let tx = await this.wallet.transfer(accounts[1], "ttn", 1);
			let balance = await this.wallet.balanceOf(accounts[1], "ttn");
			balance.toNumber().should.be.equal(1);
		});

		it("wont allow someone to transfer a token they dont own", async function(){
			await this.token.approve(this.wallet.address, 1);
			await this.wallet.deposit("ttn", 1, {from:accounts[0]});
			await utils.tryCatch(
				this.wallet.transfer(accounts[1], "ttn", 1, {from:accounts[1]}), 
				utils.errTypes.revert,
			);
		});
	});
	
}