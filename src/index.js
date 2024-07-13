const {invoke} = require("./method-call");

class ContractMethodCall {
    construct(methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec) {
        this._method = {type: methodType, name, onError, onSuccess};
        this._argumentsSpec = argumentsSpec || [];
        this._txOptionsSpec = txOptionsSpec || {};
    }

    async invokeOnContract(
        hre, contract, givenArguments, givenTxOptions, nonInteractive
    ) {
        await invoke(
            hre, contract, this._method, this._argumentsSpec, givenArguments,
            this._txOptionsSpec, givenTxOptions, nonInteractive
        );
    }

    async invokeOnDeployedContract(
        hre, deploymentId, deploymentContractId, givenArguments, givenTxOptions, nonInteractive
    ) {
        const contract = await hre.common.getDeployedContract(deploymentContractId, deploymentId);
        return await this.invokeOnContract(
            hre, contract, givenArguments, givenTxOptions, nonInteractive
        );
    }
}

module.exports = {};