require("@nomicfoundation/hardhat-toolbox");
require("hardhat-common-tools");
require("hardhat-enquirer-plus");
require("hardhat-blueprints");
require("hardhat-openzeppelin-common-blueprints");
require("..");

const {task} = require("hardhat/config");

task("sample-mint", "Invokes an ERC1155 mint")
    .addOptionalParam("to", "The receiver of the token(s)")
    .addOptionalParam("id", "The id of the token")
    .addOptionalParam("amount", "The amount of the token")
    .addOptionalParam("data", "The data")
    .addOptionalParam("account", "The account to use (the first, by default)")
    .addOptionalParam("gasPrice", "The gas price to use")
    .addOptionalParam("deploymentId", "An optional ignition deployment id")
    .addOptionalParam("deployedContractId", "An optional ignition deployed contract id")
    .addFlag("nonInteractive", "Whether to throw an error when becoming interactively")
    .setAction(async ({deploymentId, deployedContractId, to, id, amount, data, account, gasPrice, nonInteractive}, hre, runSuper) => {
        const method = new hre.methodPrompts.ContractMethodPrompt(
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
                name: "value",
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
                gasPrice: {onAbsent: "prompt"}
            }
        );
        await method.invoke(
            deploymentId, deployedContractId,
            {to, id, value: amount, data}, {account, gasPrice}, nonInteractive
        );
    });

task("sample-balance-of", "Invokes an ERC1155 balanceOf")
    .addOptionalParam("address", "The receiver of the token(s)")
    .addOptionalParam("id", "The id of the token")
    .addOptionalParam("deploymentId", "An optional ignition deployment id")
    .addOptionalParam("deployedContractId", "An optional ignition deployed contract id")
    .addFlag("nonInteractive", "Whether to throw an error when becoming interactively")
    .setAction(async ({deploymentId, deployedContractId, address, id, nonInteractive}, hre, runSuper) => {
        const method = new hre.methodPrompts.ContractMethodPrompt(
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
        );
        await method.invoke(
            deploymentId, deployedContractId,
            {address, id}, {}, nonInteractive
        );
    });

task("balance-of", "Gets the native balance of for an account")
    .addPositionalParam("address", "The address (or index of account)")
    .addFlag("nonInteractive", "Whether to throw an error when becoming interactively")
    .setAction(async ({address, nonInteractive}, hre, runSuper) => {
        const method = new hre.methodPrompts.CustomPrompt(
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
        );
        await method.invoke({address}, {}, nonInteractive);
    });

task("transfer", "Transfers native balance to another account")
    .addPositionalParam("address", "The target address")
    .addPositionalParam("amount", "The amount of native tokens to send")
    .addOptionalParam("account", "The account to use (the first, by default)")
    .addOptionalParam("gasPrice", "The gas price to use")
    .addFlag("nonInteractive", "Whether to throw an error when becoming interactively")
    .setAction(async ({address, amount, nonInteractive, account, gasPrice}, hre, runSuper) => {
        const method = new hre.methodPrompts.CustomPrompt(
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
        );
        await method.invoke({address}, {account, gasPrice, value: amount}, nonInteractive);
    });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24"
};
