const {invoke} = require("./method-call");
const {extendEnvironment} = require("hardhat/config");

class _ContractMethodPrompt {
    constructor(hre, methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec) {
        this._hre = hre;
        this._method = {type: methodType, name, onError, onSuccess};
        this._argumentsSpec = argumentsSpec || [];
        this._txOptionsSpec = txOptionsSpec || {};
    }

    async invokeOnContract(
        contract, givenArguments, givenTxOptions, nonInteractive
    ) {
        if (!contract)
        await invoke(
            this._hre, contract, this._method, this._argumentsSpec, givenArguments || [],
            this._txOptionsSpec, givenTxOptions || {}, nonInteractive || false
        );
    }

    async invokeOnDeployedContract(
        deploymentId, deploymentContractId, givenArguments, givenTxOptions, nonInteractive
    ) {
        // 1. Get the contract.
        let contract = null;
        try {
            contract = await this._hre.ignition.getDeployedContract(deploymentContractId, deploymentId);
        } catch(e) {}
        if (!contract) {
            console.log(`The ${deploymentContractId} seems to be not deployed in the current deployment`);
            return;
        }

        // 2. Use the contract.
        console.log(
            `Using deployed contract: ${deploymentContractId}` +
            (deploymentId ? ` (deployment id: ${deploymentId})` : "")
        );
        return await this.invokeOnContract(
            contract, givenArguments, givenTxOptions, nonInteractive
        );
    }
}

extendEnvironment((hre) => {
    class ContractMethodPrompt extends _ContractMethodPrompt {
        constructor(methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec) {
            super(hre, methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec);
        }
    }

    hre.methodPrompts = {ContractMethodPrompt}
})

module.exports = {};