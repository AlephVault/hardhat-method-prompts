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

    new hre.methodPrompts.CustomPrompt(
        function([address]) {
            return hre.common.getBalance(address);
        }, {
            onError: (e) => {
                console.error("There was an error while getting the balance");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("The method ran successfully:", tx);
            }
        }, [{
            name: "address",
            description: "The address (or account index) to query the balance for",
            message: "What's the address (or account index) you want to query the balance for?",
            argumentType: "smart-address"
        }], {}
    ).asTask("balance-of", "Gets the native balance of for an account", {onlyExplicitTxOptions: true});

    new hre.methodPrompts.CustomPrompt(
        function([address], txOpts) {
            console.log("tx opts:", txOpts);
            return hre.common.transfer(address, txOpts);
        }, {
            onError: (e) => {
                console.error("There was an error while getting the balance");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("The method ran successfully:", tx);
            }
        }, [{
            name: "address",
            description: "The address (or account index) to send native tokens to",
            message: "What's the address (or account index) to send native tokens to?",
            argumentType: "smart-address"
        }], {
            value: {onAbsent: "prompt"},
            account: {onAbsent: "default"},
            gasPrice: {onAbsent: "default"}
        }
    ).asTask("transfer", "Transfers native balance to another account");
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24"
};
