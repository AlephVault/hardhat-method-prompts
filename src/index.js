const {invoke} = require("./method-call");
const {extendEnvironment} = require("hardhat/config");

class _ContractMethodPrompt {
    constructor(hre, methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec) {
        this._hre = hre;
        this._method = {type: methodType, name, onError, onSuccess};
        this._argumentsSpec = argumentsSpec || [];
        this._txOptionsSpec = txOptionsSpec || {};
    }

    async invoke(
        deploymentId, deployedContractId, givenArguments, givenTxOptions, nonInteractive
    ) {
        const deploymentContractId = await new this._hre.enquirerPlus.Enquirer.GivenOrDeployedContractSelect({
            deploymentId, message: "Select one of your deployed contracts:", given: deployedContractId
        }).run();
        const contract = await this._hre.ignition.getDeployedContract(deploymentContractId, deploymentId);
        await invoke(
            this._hre, contract, this._method, this._argumentsSpec, givenArguments || [],
            this._txOptionsSpec, givenTxOptions || {}, nonInteractive || false
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