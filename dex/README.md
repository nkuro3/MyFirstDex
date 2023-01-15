# dex
🦄 Uniswap風のDexを作ろう！

## Outline
 - 〜イントロと環境構築〜【第0回】dApp開発編
   - 環境構築
 - 〜ERC20コントラクトの製作〜【第1回】dApp開発編
   - ERC20コントラクトを作ってみる。ただ、ERC20コントラクトの機能は同じなので  OpenZeppelinのコードをそのまま利用する。
   - https://github.com/OpenZeppelin/openzeppelin-contracts
 - 〜Truffle と Ganache〜【第3回】dApp開発編


### 〜ERC20コントラクトの製作〜【第1回】dApp開発編
1. compile
   ```
   truffle compile
   ```

### 〜Truffle と Ganache〜【第3回】dApp開発編
1. Lunch local blockchain.
    ```shell
    truffle develop
    ```
2. enter javascript in truffle command line.
    ```js
    > truffle(develop)> (enter javascript)
    > truffle(develop)> accounts[0]
    > truffle(develop)> let balance = await web3.eth.getBalence(accounts[0]);
      // web3.eth.getBalence returns Promise.
    > truffle(develop)> Number(balance)/10**18 // 100 ETH
    > truffle(develop)> web3.eth.sendTransaction({from: accounts[0], to: accounts[1], value: '100'});
    > truffle(develop)> web3.eth.getBalance(accounts[1]);
    ``` 
3. migrate
    ```js
    > truffle(develop)> migrate
    ...
    Error: Returned error: VM Exception while processing transaction:
    revert Insufficient balance -- Reason given: Insufficient balance.
    // at await dai.transfer(dex.address, toWei(10**10));
    ```
    Taht why I commentout transfer(), then run migrate again.
    ```
    > truffle(develop)> migrate
    ...
      -------------------------------------
      > Total cost:     0.009366910450858197 ETH

    Summary
    =======
    > Total deployments:   5
    > Final cost:          0.010204558450858197 ETH
    ```
4. initirize instance of deplyed contract.
    ```js
    truffle(develop)> const comp = await ERC20.deployed();
    undefined
    truffle(develop)> comp.name();
    '' // Strage!!!!! This should be 'Compound'.
    ```
    So it is not initialized correctlly.
    Check ERC20.sol.
    I missed to write constractor.
    ```js
    // lack writing below.
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
      name = _name;
      symbol = _symbol;
      totalSupply = _totalSupply;
      balances[msg.sender] = totalSupply;
    }
    ```
    again, I try to deploy and worked correctlly.
    ```js
    > truffle(develop)> migrate
    ```
5. execute transaction with deployed contract.
    ```js
    truffle(develop)> const comp = await ERC20.deployed();
      undefined
    truffle(develop)> comp.name();
      'Compound'
    truffle(develop)> const dex = await DEX.deployed();
      undefined
    truffle(develop)> let totalSupply = await comp.totalSupply();
      undefined
    truffle(develop)> totalSupply
      BN {
        negative: 0,
        words: [ 37748736, 3305132, 2220446, <1 empty item> ],
        length: 3,
        red: null
      }
    truffle(develop)> totalSupply.toString();
      '10000000000000000000000'
    truffle(develop)> totalSupply.toString() / 10**18;
    truffle(develop)> await dex.buyToken(comp.address, '100', '10000', {from: accounts[3], value: '100'});
    truffle(develop)> let compBalance = await comp.balanceOf(accounts[3]);
      undefined
    truffle(develop)> compBalance.toString();
      '10000'
    // I transfered 10000 COMP from dex to Compound contract wallet.
    ```
6. setup ganache
7. ganacheのコンソール（リモート接続）をを実行する
    ```
    // リモート環境
    $ truffle console --network <network-name>
    // ローカル環境
    $ truffle develop
    ```

### 〜コントラクトのテスト〜【第4回】dApp開発編
0.  fix code
    ```js
    /** To use ERC20 for every token is inconvenient. */
    module.exports = async (deployer) => {
    // Deploy tokens.
    await deployer.deploy(ERC20, "Dai", "DAI", toWei(10**10));
    await deployer.deploy(ERC20, "Chainlink", "LINK", toWei(10**6));
    ...
    ```
1. write code
   [github](https://github.com/BlockAcademyJP/dapp-kaihatuhen/tree/part4)
2. run test
   ```
   @ dex directory
   truffle test
   @ truffle console
   test 
   ```

   result should be all passed, but some are failed.
   Even if I try to run test by github code(MyFirstDex/dex/part4), the result is same.
   ```shell
   Contract: Dex test
    1) "before all" hook in "Contract: Dex test"

   Contract: ERC20 token test
    Basic token test
      ✔ Should return token names and symbols correctly (61ms)
    Supply and balance test
      ✔ Should have the correct total supply
      2) Should have correct initial balances
    > No events were emitted
    ...
   ```

### 〜フロントエンドの製作〜【第5回】dApp開発編
1. copy `client` folder to `MyFirstDex/dex/client`.

### 〜Web3.js ウォレット編〜【第6回】dApp開発編
1. deploy again.
   1. open ganache.
   2. migrate
      ```
      truffle console
      > migrate -reset
      ```
2. codeing app.js
   1. connect metamask
3. `Web3` is not defined
  This is due to not eisting `package.json`. I did not `npm init`...
  Then, program work!
  However, `truffle test` not still work...
4. CoinGecko Api

### 〜完成とまとめ〜【第8回】dApp開発編
1. unexpected alert happen.
  ```
  Cannot read properties of undefined (reading 'returnValues')
  ```
  It seems buy event won't emit.


### Reference
 - [🦄 Uniswap風のDexを作ろう！〜イントロと環境構築〜【第0回】dApp開発編](https://www.youtube.com/watch?v=4qvh9NWOOhE&list=PLCH4QeM_3zR7x0J7yB6MM_iRIx7wsw5Qk&index=2)
 - [Truffleチートシート](https://qiita.com/ttoori-ttoori/items/8de80a60bda04fe8a8d8#%E3%82%B3%E3%83%B3%E3%82%BD%E3%83%BC%E3%83%AB%E3%81%AE%E5%AE%9F%E8%A1%8C)
 - [継承](https://nawoo.hateblo.jp/entry/2021/09/26/094102)
 - [How to fix "No events were emitted"](https://ethereum.stackexchange.com/questions/60720/how-to-fix-no-events-were-emitted)
 - [jQueryの基本 - $(document).ready](https://qiita.com/8845musign/items/88a8c693c84ba63cea1d)
 - [Web3 Instance](https://web3js.readthedocs.io/en/v1.2.11/web3.html#web3-instance)
 - [setProvider](https://web3js.readthedocs.io/en/v1.2.11/web3.html#setprovider)
 - [jQueryのhtml()](https://www.sejuku.net/blog/38267)
 - [JavaScriptのFetch API について](https://qiita.com/sotasato/items/31be24d6776f3232c0c0)
 - [web3.eth.Contract](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#web3-eth-contract)
 - [inputイベントでフォーム入力値をリアルタイム取得できるよ。（あとjQuery例。）](https://ginpen.com/2018/01/30/realtime-form-values/)
 - []()