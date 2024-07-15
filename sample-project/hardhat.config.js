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
    .addOptionalParam("account", "The deployment id")
    .addOptionalParam("gasPrice", "The deployment id")
    .addOptionalParam("nonInteractive", "Whether to throw an error when running")
    .setAction(async ({deploymentId, to, id, amount, data, account, gasPrice, nonInteractive}, hre, runSuper) => {
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
                argumentType: "bigint"
            }, {
                name: "value",
                description: "The amount of that token",
                message: "What's the amount of the token?",
                argumentType: "bigint"
            }, {
                name: "data",
                description: "The data for the transaction",
                message: "Add some hexadecimal binary data:",
                argumentType: {
                    "type": "plus:given-or-valid-input",
                    "makeInvalidInputMessage": (v) => `Invalid hex data: ${v}`,
                    "onInvalidGiven": (v) => console.log(`Invalid given hex data: ${v}`),
                    "validate": /^0x([a-fA-F0-9]{2})*$/
                }
            }], {
                account: {onAbsent: "default"},
                gasPrice: {onAbsent: "prompt"}
            }
        );
        await method.invoke(
            deploymentId, "MyOwnedERC1155Module#MyOwnedERC1155",
            {to, id, amount, data}, {gasPrice, account}, nonInteractive
        );
    });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24"
};
