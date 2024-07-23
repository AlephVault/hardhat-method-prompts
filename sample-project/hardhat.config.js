require("@nomicfoundation/hardhat-toolbox");
require("hardhat-common-tools");
require("hardhat-enquirer-plus");
require("hardhat-blueprints");
require("hardhat-openzeppelin-common-blueprints");
require("..");

const {task, extendEnvironment} = require("hardhat/config");

extendEnvironment((hre) => {
    new hre.methodPrompts.ContractMethodPrompt(
        "send", "mint", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("The method ran successfully:", tx);
            }
        }, [{
            name: "to",
            description: "The target of the mint",
            message: "Who will receive the minted tokens?",
            argumentType: "smart-address"
        }, {
            name: "id",
            description: "The ID of the token",
            message: "What's the token you want to mint?",
            argumentType: "uint256"
        }, {
            name: "amount",
            description: "The amount of that token",
            message: "What's the amount of the token?",
            argumentType: "uint256"
        }, {
            name: "data",
            description: "The data for the transaction",
            message: "Add some hexadecimal binary data:",
            argumentType: "bytes"
        }], {
            account: {onAbsent: "default"},
            gasPrice: {onAbsent: "default"}
        }
    ).asTask("sample-mint", "Invokes a sample mint");

    new hre.methodPrompts.ContractMethodPrompt(
        "call", "balanceOf", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (value) => {
                console.log("Balance:", value);
            }
        }, [{
            name: "address",
            description: "The target of the mint",
            message: "Who will receive the minted tokens?",
            argumentType: "smart-address"
        }, {
            name: "id",
            description: "The ID of the token",
            message: "What's the token you want to mint?",
            argumentType: "uint256"
        }], {}
    ).asTask("sample-balance-of", "Invokes an ERC1155 balanceOf", {onlyExplicitTxOptions: true});
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24"
};
