pragma solidity ^0.5.2;

import "./BaseWallet.sol";
import 'openzeppelin-solidity/contracts/drafts/Counter.sol';

contract EscrowWallet is BaseWallet {
	using Counter for Counter.Counter;

	struct Escrow {
		//escrow id
		uint256 escrowID;
		//address of the initiator
		address initiator;
		//address of payer
		address payer;
		//address of payee
		address payee;
		//number of escrow agents
		uint numAgents;
		//current confirmations
		uint confirmations;
		//terms of this deal
		string terms;
		//token id
		uint256 tokenID;

	}

	struct escrowAgent {
		uint256 agentID;
		address account;
		string name;
		uint feedback;
		bool available;
	}

	Counter.Counter internal lastEscrowID;
	Counter.Counter internal lastAgentID;
	escrowAgent[] internal agents;
	//mapping from agent id to index
	mapping(uint256 => uint256) internal agentIDToIndex;
	Escrow[] internal escrows;
	//mapping from escrow id to index
	mapping(uint256 => uint256) internal escrowIDToIndex;
	//mappingfrom 


	constructor() BaseWallet() public {}

}