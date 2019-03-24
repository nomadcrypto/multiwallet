require('truffle-test-utils').init();
const BigNumber = web3.BigNumber;
const utils = require("../utils.js");

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


const Wallet = artifacts.require("BaseWallet.sol");

const shouldBehaveLikeTokenRegistery = require("./TokenRegistery.behaviour.js");
const shouldBehaveLikeRegisteredToken = require("./RegisteredToken.behaviour.js");
const shouldBehaveLikeEthWallet = require("./ETHWallet.behaviour.js");
const shouldBehaveLikeERC20Wallet = require("./ERC20Wallet.behaviour.js");
const shouldBehaveLikeERC721Wallet = require("./ERC721Wallet.behaviour.js");
contract("BaseWallet", function(accounts) {
	shouldBehaveLikeTokenRegistery(accounts);
	shouldBehaveLikeRegisteredToken(accounts);
	shouldBehaveLikeEthWallet(accounts)
	shouldBehaveLikeERC20Wallet(accounts);
	shouldBehaveLikeERC721Wallet(accounts);

});