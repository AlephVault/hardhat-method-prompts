require("@nomicfoundation/hardhat-toolbox");
require("hardhat-common-tools");
require("hardhat-enquirer-plus");
require("hardhat-blueprints");
require("hardhat-openzeppelin-common-blueprints");
require("..");
const {task} = require("hardhat/config");

task("sample-mint", "Invokes")
    .setAction((args, hre, runSuper) => {

    });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24"
};
