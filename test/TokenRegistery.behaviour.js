require('truffle-test-utils').init();
const BigNumber = web3.BigNumber;
const utils = require("../utils.js");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


const Wallet = artifacts.require("BaseWallet.sol");

module.exports = function shouldBehaveLikeTokenRegistery(accounts) {

	describe("Token Registery Behaviour", function(){
		beforeEach(async function() {
			this.wallet = await Wallet.new({from:accounts[0]})
		});

		it("only allows valid token types to be added", async function() {
			await utils.tryCatch(
				this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth", 9, true, {from:accounts[0]}), 
				utils.errTypes.revert,
			);
		});

		it("only allows the owner to add a token", async function() {
			var result = await this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth", 0, true, {from:accounts[0]});
			var args = {
				token_address: '0x0000000000000000000000000000000000000000',
				name: "Etherum",
				symbol:"eth"
			}
			utils.assertEvent(result, "TokenAdded", args)
			await utils.tryCatch(
				this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth2", 0, true, {from:accounts[1]}), 
				utils.errTypes.revert,
			);
			//await utils.assertEvent(this.wallet, {event:"TokenAdded"});
		});

		it("only allows a token to be added once based on symbol", async function() {
			var result = await this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth", 0, true, {from:accounts[0]});
			await utils.tryCatch(
				this.wallet.add_token('0x0000000000000000000000000000000000000000', "Etherum", "eth", 0, true, {from:accounts[0]}), 
				utils.errTypes.revert,
			);
		});
	})	
};