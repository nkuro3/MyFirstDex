// compiled contract.
const Dai = artifacts.require("Dai");
const Link = artifacts.require("Link");
const Comp = artifacts.require("Comp");
const Dex = artifacts.require("Dex");

const toWei = (num) => web3.utils.toWei(web3.utils.toBN(num), 'ether'); // 'ether' <= 10**18

module.exports = async (deployer) => {
  // Deploy tokens.
  await deployer.deploy(Dai, "Dai", "DAI", toWei(10**10)); // name, symbol, supply
  const dai = await Dai.deployed(); // get instance of token that deployed lastly.
  await deployer.deploy(Link, "Chainlink", "LINK", toWei(10**6));
  const link = await Link.deployed(); // same command can be used.
  await deployer.deploy(Comp, "Compound", "COMP", toWei(10**4));
  const comp = await Comp.deployed(); // comp: ERC20

  // Deploy Dex
  await deployer.deploy(Dex, [dai.address, link.address, comp.address]);
  const dex = await Dex.deployed();

  // transfer to dex wallet.
  // from address is defined to msg.sender at initiarization by ERC20 constractor.
  await dai.transfer(dex.address, toWei(10**10));
  await link.transfer(dex.address, toWei(10**6));
  await comp.transfer(dex.address, toWei(10**4));
};
