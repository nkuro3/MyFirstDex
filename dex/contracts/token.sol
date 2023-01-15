// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './ERC20.sol';

// https://nawoo.hateblo.jp/entry/2021/09/26/094102
// 親のコンストラクタの引数を指定する方法
// contract A {
//     constructor (uint a) {} // Aのコンストラクタは引数が必要
// }

// // コンストラクタで指定
// contract B is A {
//     constructor() A(1) {}
// }
// // または is で指定
// contract B is A(1) {
// }

contract Dai is ERC20 {
  constructor(string memory _name, string memory _symbol, uint256 _totalSupply)
  ERC20(_name, _symbol, _totalSupply){

  }
}

contract Link is ERC20 {
  constructor(string memory _name, string memory _symbol, uint256 _totalSupply)
  ERC20(_name, _symbol, _totalSupply){

  }
}

contract Comp is ERC20 {
  constructor(string memory _name, string memory _symbol, uint256 _totalSupply)
  ERC20(_name, _symbol, _totalSupply){

  }
}
