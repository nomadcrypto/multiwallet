pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/drafts/Counter.sol';


contract MockERC721 is ERC721Full {
	using Counter for Counter.Counter;
	Counter.Counter private tokenid;
	address private owner;
	event TokenMinted(address account, uint256 tokenid);

	constructor(string memory name, string memory symbol)
	ERC721Full(name, symbol)
	public {
		owner = msg.sender;
	}

	function mint(address account) public {
		require(msg.sender == owner);
		uint256 tid = tokenid.next();
		_mint(account, tid);
		emit TokenMinted(account, tid);
	}


}