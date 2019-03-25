# multiwallet
This is a solidity based multi-user wallet that supports ETH, ERC20 and ERC721 tokens. It is intended to be used as part of a larger project. Example use cases include a application specific wallet(escrow, exchange, etc), a simple multi-token wallet for a contract, etc.

## Testing
simply run
```bash
npm test
  Contract: BaseWallet
    Token Registery Behaviour
      ✓ only allows valid token types to be added (300ms)
      ✓ only allows the owner to add a token (346ms)
      ✓ only allows a token to be added once based on symbol (354ms)
    Registered Token Behaviour
      ✓ can get a token id by token symbol (149ms)
      ✓ can get a token id by index (191ms)
      ✓ can get a token index by id (99ms)
    Eth Wallet Behaviour
      ✓ can deposit eth (119ms)
      ✓ can get the balance of an address (232ms)
      ✓ can withdraw eth (270ms)
      ✓ wont withdraw more eth than an account has (253ms)
      ✓ can transfer eth (321ms)
    ERC20 Wallet Behaviour
      ✓ can deposit an erc20 token (314ms)
      ✓ can get the erc20 balance of an address (326ms)
      ✓ will not update erc20 balance when transfer fails (303ms)
      ✓ can withdraw erc20 tokens (440ms)
      ✓ wont allow more erc20 tokens to be withdrawn than an account has (392ms)
      ✓ can transfer erc20 tokens (449ms)
      ✓ wont allow more erc20 tokens to be transfered than an account has (367ms)
    ERC721 Wallet Behaviour
      ✓ can deposit an erc721 token (256ms)
      ✓ can get the erc721 balance of an address (377ms)
      ✓ can get withdraw an erc721 token (507ms)
      ✓ will correctly remove the erc721 token from the available tokens (899ms)
      ✓ wont allow someone to withdraw a token they dont own (394ms)
      ✓ can transfer erc721 tokens (489ms)
      ✓ wont allow someone to transfer a token they dont own (413ms)

```

## Code coverage
you can run the coverage report like this:
```bash 
./coverage.sh
-------------------|----------|----------|----------|----------|----------------|
File               |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------------|----------|----------|----------|----------|----------------|
 contracts/        |      100 |    94.74 |    96.55 |      100 |                |
  BaseWallet.sol   |      100 |    97.22 |      100 |      100 |                |
  MockERC20.sol    |      100 |      100 |      100 |      100 |                |
  MockERC721.sol   |      100 |       50 |      100 |      100 |                |
-------------------|----------|----------|----------|----------|----------------|
All files          |      100 |    94.74 |    96.55 |      100 |                |
-------------------|----------|----------|----------|----------|----------------|

```
