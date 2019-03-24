pragma solidity ^0.5.2;
import 'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/IERC721.sol';


/**
* @title Wallet
* @dev a simple multi-user wallet
*
*/

/*
overview:

	The wallet will have 3 main types of assets(eth, erc20 token, or erc721 token)

Variables needed for the wallet.
mapping from address to array of 
*/
contract BaseWallet {

	//token added event
	event TokenAdded(address token_address, string name, string symbol, uint token_type, uint256 id, uint256 index);
	//event TotalBalanceChanged
	event TotalBalanceChanged(string symbol, uint256 amount, bool credited, uint256 prebalance, uint256 postbalance);
	//event TotalBalanceChanged
	event AccountBalanceChanged(address account, string symbol, uint256 amount, bool credited, uint256 prebalance, uint256 postbalance);
	//deposited eth event
	event DepositedETH(address account, uint256 amount);
	//deposited erc20 event
	event DepositedERC20(address account, string symbol, uint256 amount);
	//deposited erc271 event
	event DepositedERC721(address account, string symbol, uint256 token_id);
	//withdrew eth event
	event WithdrewETH(address account, uint256 amount);
	//withdrew erc20 event
	event WithdrewERC20(address account, string symbol, uint256 amount);
	//withdrew erc721 event
	event WithdrewERC721(address account, string symbol, uint256 amount);
	//trasfer event
	event Transfer(address from, address to, string symbol, uint256 amount_or_id);



	enum TokenType {ETH, ERC20, ERC721}

	address internal owner;

	struct Token {
		//token address
		address token_address;
		//token name
		string name;
		//token symbol
		string symbol;
		//token type
		uint token_type;
		//token id
		uint256 token_id;
		//fungible
		bool fungible;

	}

	//array of tokens
	Token[] internal tokens;
	//last token id
	uint256 internal lastTokenID;
	//mapping from tokenid to token index
	mapping(uint256 => uint256) internal tokenIDToIndex;
	//mapping from token index to token id
	mapping(uint256 => uint256) internal tokenIndexToID;
	//mapping from token symbol to token id
	mapping(string => uint256) internal tokenSymbolToID;
	//mapping from token symbol to bool for easy checking if registered
	mapping(string => bool) internal tokenSymbolRegistered; 


	//mapping from token id to total balance
	mapping(uint256=>uint256) internal totalBalance;



	//mapping from address to token id to balance
	mapping(address => mapping(uint256 => uint256)) internal balance;
	//mapping from address to token id to array of non_fungible token ids
	mapping(address => mapping(uint256 => uint256[])) internal nonfungibleTokens;
	//mapping from address to
	mapping(address => mapping(uint256 => mapping(uint256 => uint256))) internal nonfungibleTokenIDToIndex;
	//mapping from address to
	mapping(address => mapping(uint256 => mapping(uint256 => uint256))) internal nonfungibleTokenIndexToID;
	//mapping from address to token id to external token id to bool
	mapping(address => mapping(uint256 => mapping(uint256 => bool))) internal nonfungibleTokenRegistered;



	/*
	* @dev
	*/

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}

	/*
	* @dev
	*/

	modifier onlyValidTokenType(uint token_type) {
		require(token_type == uint(TokenType.ETH) || token_type == uint(TokenType.ERC20) || token_type == uint(TokenType.ERC721), "Invalid token type");
		_;
	}

	/*
	* @dev
	*/

	modifier onlyRegsteredToken(string memory symbol) {
		require(tokenSymbolRegistered[symbol] == true, "Token is not registered");
		_;
	}

	/*
	* @dev
	*/

	modifier onlyUnRegisteredToken(string memory symbol) {
		require(tokenSymbolRegistered[symbol] == false, "Token already registered");
		_;
	}
	
	constructor() public {
		owner = msg.sender;
	}

	/*
	* @dev add the token
	* @param token_address the address of the token or 0x in the case of eth
	* @param name the name of the token, e.g. Etherum, SimpleToken, CryptoKitties, etc
	* @param symbol the symbol of the token, e.g. eth, eos, etc. 
	* @param token_type 0 for eth, 1 for erc20 and 2 for erc721
	* @param fungible if the token is fungible - may remove later
	*/
	function add_token(address token_address, string memory name, string memory _symbol, uint token_type, bool fungible) 
	onlyOwner 
	onlyUnRegisteredToken(_symbol)
	onlyValidTokenType(token_type) 
	public {
		lastTokenID++;
		uint256 id = lastTokenID;
		uint256 index = tokens.length;

		Token memory token;
		token.token_address = token_address;
		token.name = name;
		token.symbol = _symbol;
		token.token_type = token_type;
		token.fungible = fungible;
		token.token_id = lastTokenID;
		tokens.push(token);

		tokenSymbolRegistered[_symbol] = true;
		tokenSymbolToID[_symbol] = id;
		tokenIDToIndex[id] = index;
		tokenIndexToID[index] = id;
		emit TokenAdded(token.token_address, token.name, token.symbol, token.token_type, id, index);

	}

	/*
	* @dev gets the token id by the given symbol
	* @param symbol the symbol, e.g. eth, eos, etc
	* @return A uint256 token id for the given symbol
	*/

	function getTokenIDBySymbol(string memory symbol) onlyRegsteredToken(symbol) public view returns (uint256) {
		return tokenSymbolToID[symbol];
	}

	/*
	* @dev gets the token id by index
	* @param index the index of the symbol, e.g. 0,1, etc. useful for UIs
	* @return A uint256 token id for the given index
	*/

	function getTokenIDByIndex(uint256 index) public view returns (uint256) {
		require(index < tokens.length);
		return tokenIndexToID[index];
	}

	/*
	* @dev gets the token index by id
	* @param id the token id for the given token
	* @return A uint256 index for the given token id
	*/

	function getTokenIndexByID(uint256 id) public view returns (uint256) {
		return tokenIDToIndex[id];
	}


	function _updateBalance(uint256 tokenid, uint256 index, uint256 amount, bool credited) internal {
		uint256 totalBalancePre = totalBalance[tokenid];
		uint256 accountBalance = balance[msg.sender][tokenid];
		if(credited) {
			totalBalance[tokenid] += amount;
			balance[msg.sender][tokenid] += amount;
		} else {
			totalBalance[tokenid] -= amount;
			balance[msg.sender][tokenid] -= amount;
		}
		
		emit TotalBalanceChanged(tokens[index].symbol, amount, credited, totalBalancePre, totalBalance[tokenid]);
		emit AccountBalanceChanged(msg.sender, tokens[index].symbol, amount, credited, totalBalancePre, totalBalance[tokenid]);

	}

	function _addNonFungible(address account, uint256 tokenid, uint256 index, uint256 external_id) internal {
		uint256 tindex = nonfungibleTokens[account][tokenid].length;
		nonfungibleTokens[account][tokenid].push(external_id);
		nonfungibleTokenIDToIndex[account][tokenid][external_id] = tindex;
		nonfungibleTokenIndexToID[account][tokenid][tindex] = external_id;
		nonfungibleTokenRegistered[account][tokenid][external_id] = true;
	}

	function _depositNonFungible(uint256 tokenid, uint256 index, uint256 external_id) internal {
		_updateBalance(tokenid, index, 1, true);
		_addNonFungible(msg.sender, tokenid, index, external_id);

	}

	function _removeNonFungible(address account, uint256 tokenid, uint256 index, uint256 external_id) internal {
		nonfungibleTokenRegistered[account][tokenid][external_id] = false;
		if(nonfungibleTokens[account][tokenid].length == 1) {
			nonfungibleTokens[account][tokenid].length--;
			delete nonfungibleTokenIndexToID[account][tokenid][index];
			delete nonfungibleTokenIDToIndex[account][tokenid][external_id];
		} else {
			uint256 lastIndex = nonfungibleTokens[account][tokenid].length-1;
			uint256 lastID = nonfungibleTokenIndexToID[account][tokenid][lastIndex];

			//move the last item in the array to the current index
			nonfungibleTokens[account][tokenid][index] = lastID;
			nonfungibleTokenIDToIndex[account][tokenid][lastID] = index;
			nonfungibleTokenIndexToID[account][tokenid][index] = lastID;
			//set the token to not registered
			nonfungibleTokenRegistered[account][tokenid][external_id] = false;
			nonfungibleTokens[account][tokenid].length--;
			delete nonfungibleTokenIDToIndex[account][tokenid][external_id];
		}


	}


	function _depositEth(string memory symbol, uint256 tokenid, uint256 index, uint256 amount) internal {
		_updateBalance(tokenid, index, amount, true);
		emit DepositedETH(msg.sender, amount);
	}

	function _depositERC20(string memory symbol, uint256 tokenid, uint256 index, uint256 amount) internal {
		//here we access the given erc20 token and transfer the amount previously alotted to us. only if that succeeds 
		//then we deposit the fungible token and update balances accordingly
		IERC20 c = IERC20(tokens[index].token_address);

		if(c.transferFrom(msg.sender, address(this), amount)) {
			_updateBalance(tokenid,index, amount, true);
			emit DepositedERC20(msg.sender, symbol, amount);
		}
	}

	function _depositERC721(string memory symbol, uint256 tokenid, uint256 index, uint256 external_id) internal {	
		//here we access the given erc271 token and transfer the given external id to us. only if that succeeds 
		//then we update the overall balance for that token as well as add it to the nonfungible tokens in the accounts
		//associated balance.
		IERC721 c = IERC721(tokens[index].token_address);
		c.transferFrom(msg.sender, address(this), external_id);
		_depositNonFungible(tokenid,index, external_id);
		emit DepositedERC721(msg.sender, symbol, external_id);

	}

	function deposit(string memory symbol, uint256 amount) onlyRegsteredToken(symbol) public payable {
		uint256 tokenid = tokenSymbolToID[symbol];
		uint256 index = tokenIDToIndex[tokenid];
		uint token_type = tokens[index].token_type;
		if(token_type == uint(TokenType.ETH)) {
			_depositEth(symbol,tokenid, index, msg.value);
		} else if (token_type == uint(TokenType.ERC20)) {
			_depositERC20(symbol,tokenid, index, amount);
		} else {
			_depositERC721(symbol,tokenid, index, amount);
		}

	}

	function balanceOf(address _address, string memory symbol) onlyRegsteredToken(symbol) public view returns (uint256) {
		uint256 tokenid = tokenSymbolToID[symbol];
		return balance[_address][tokenid];
	}

	function _withdrawEth(string memory symbol, uint256 tokenid, uint256 index, uint256 amount) internal {
		require(balance[msg.sender][tokenid] >= amount);
		_updateBalance(tokenid, index, amount, false);
		msg.sender.transfer(amount);
		emit WithdrewETH(msg.sender, amount);

	}

	function _withdrawERC20(string memory symbol, uint256 tokenid, uint256 index, uint256 amount) internal {
		require(balance[msg.sender][tokenid] >= amount);
		IERC20 c = IERC20(tokens[index].token_address);
		_updateBalance(tokenid, index, amount, false);
		c.approve(msg.sender, amount);
		emit WithdrewERC20(msg.sender, symbol, amount);
	}

	function _withdrawERC721(string memory symbol, uint256 tokenid, uint256 index, uint256 external_id) internal {
		require(nonfungibleTokenRegistered[msg.sender][tokenid][external_id] == true);
		IERC721 c = IERC721(tokens[index].token_address);
		_updateBalance(tokenid, index, 1, false);
		_removeNonFungible(msg.sender,tokenid, index, external_id);
		c.approve(msg.sender, external_id);
		emit WithdrewERC721(msg.sender, symbol, external_id);
	}

	function withdraw(string memory symbol, uint256 amount) onlyRegsteredToken(symbol) public {
		uint256 tokenid = tokenSymbolToID[symbol];
		uint256 index = tokenIDToIndex[tokenid];
		uint token_type = tokens[index].token_type;
		if(token_type == uint(TokenType.ETH)) {
			_withdrawEth(symbol,tokenid, index, amount);
		} else if (token_type == uint(TokenType.ERC20)) {
			_withdrawERC20(symbol,tokenid, index, amount);
		} else {
			_withdrawERC721(symbol,tokenid, index, amount);
		}
	}

	function _transferFungible(address from, address to, uint256 tokenid, uint256 amount) internal {
		require(balance[from][tokenid] >= amount);
		balance[from][tokenid] -= amount;
		balance[to][tokenid] += amount;
	}

	function _transferNonFungible(address from, address to, uint256 tokenid, uint256 external_id) internal {
		require(nonfungibleTokenRegistered[msg.sender][tokenid][external_id] == true);
		uint256 index = tokenIDToIndex[tokenid];
		_removeNonFungible(from, tokenid, index, external_id);
		_addNonFungible(to, tokenid, index, external_id);
		balance[from][tokenid] -= 1;
		balance[to][tokenid] += 1;
	}

	function transfer(address account, string memory symbol, uint256 amount) public {
		uint256 tokenid = tokenSymbolToID[symbol];
		if(tokens[tokenIDToIndex[tokenid]].fungible){
			_transferFungible(msg.sender, account, tokenid, amount);
		} else {
			_transferNonFungible(msg.sender, account, tokenid, amount);
		}
		emit Transfer(msg.sender, account, symbol, amount);
	}


}