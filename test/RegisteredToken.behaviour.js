require('truffle-test-utils').init();
const BigNumber = web3.BigNumber;
const utils = require("../utils.js");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


const Wallet = artifacts.require("BaseWallet.sol");

module.exports = function shouldBehaveLikeRegisteredToken(accounts) {

	describe("Registered Token Behaviour", function(){
		beforeEach(async function() {
			this.wallet = await Wallet.new({from:accounts[0]})
			await this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth", 0, true, {from:accounts[0]});
			await this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth2", 0, true, {from:accounts[0]});
			await this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth3", 0, true, {from:accounts[0]});
		});

		it('can get a token id by token symbol', async function() {
			let result = await this.wallet.getTokenIDBySymbol("eth3");
			result.toNumber().should.be.equal(3);
			await utils.tryCatch(
				this.wallet.getTokenIDBySymbol("eth99"), 
				utils.errTypes.revert,
			);
		});

		it('can get a token id by index', async function() {
			let result = await this.wallet.getTokenIDByIndex(0);
			result.toNumber().should.be.equal(1);
			await utils.tryCatch(
				this.wallet.getTokenIDByIndex(5), 
				utils.errTypes.revert,
			);
		});

		it('can get a token index by id', async function() {
			let result = await this.wallet.getTokenIndexByID(1)
			result.toNumber().should.be.equal(0)
		});
	})	
};