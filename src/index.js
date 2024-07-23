const {invoke} = require("./method-call");
const {extendEnvironment, task} = require("hardhat/config");
const {ContractMethodPrompt_, CustomPrompt_} = require("./core");

extendEnvironment((hre) => {
    if (!hre.ignition) {
        throw new Error(
            "The hardhat-ignition-deploy-everything module requires @nomicfoundation/hardhat-ignition " +
            "to be installed as a plug-in, along with the plug-in " + (
                hre.viem ? "@nomicfoundation/hardhat-ignition/viem" : "@nomicfoundation/hardhat-ignition-ethers"
            )
        );
    }

    // The contract method call.
    class ContractMethodPrompt extends ContractMethodPrompt_ {
        constructor(methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec) {
            super(hre, methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec);
        }
    }

    class CustomPrompt extends CustomPrompt_ {
        constructor(body, {onError, onSuccess}, argumentsSpec, txOptionsSpec) {
            super(hre, body, {onError, onSuccess}, argumentsSpec, txOptionsSpec);
        }
    }

    // Registering the methodPrompts namespace.
    hre.methodPrompts = {ContractMethodPrompt, CustomPrompt};
})

module.exports = {};