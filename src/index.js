const {invoke} = require("./method-call");
const {extendEnvironment} = require("hardhat/config");

/**
 * This class is a helper to execute a method over a deployed
 * contract (via hardhat-ignition).
 */
class ContractMethodPrompt_ {
    constructor(hre, methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec) {
        this._hre = hre;
        this._method = {type: methodType, name, onError, onSuccess};
        this._argumentsSpec = argumentsSpec || [];
        this._txOptionsSpec = txOptionsSpec || {};
    }

    /**
     * Invokes the send or call method on the given contract.
     * @param deploymentId The deployment id.
     * @param deployedContractId The deployed contract id (e.g. MyModule#MyContract).
     * @param givenArguments The given arguments (an object).
     * @param givenTxOptions The given transaction options (an object with fixed, optional, keys).
     * @param nonInteractive Whether to raise an error when this method is about
     * to become interactive.
     * @returns {Promise<void>} The result (async function).
     */
    async invoke(
        deploymentId, deployedContractId, givenArguments, givenTxOptions, nonInteractive
    ) {
        deploymentId = deploymentId || `chain-${(await this._hre.ethers.provider.getNetwork()).chainId}`;
        const deploymentContractId = await new this._hre.enquirerPlus.Enquirer.GivenOrDeployedContractSelect({
            deploymentId, message: "Select one of your deployed contracts:", given: deployedContractId
        }).run();
        const contract = await this._hre.ignition.getDeployedContract(deploymentContractId, deploymentId);
        await invoke(
            this._hre, contract, this._method, this._argumentsSpec, givenArguments || {},
            this._txOptionsSpec, givenTxOptions || {}, nonInteractive || false
        );
    }
}

/**
 * This class is a helper to execute a custom action which
 * also involves reading custom arguments (and perhaps some
 * transaction options) and typically at most one operation
 * (transactional / state-changing).
 */
class CustomPrompt_ {
    constructor(hre, body, {onError, onSuccess}, argumentsSpec, txOptionsSpec) {
        this._hre = hre;
        this._method = {type: "custom", body, onError, onSuccess};
        this._argumentsSpec = argumentsSpec || [];
        this._txOptionsSpec = txOptionsSpec || {};
    }

    /**
     * Invokes the custom action.
     * @param givenArguments The given arguments (an object).
     * @param givenTxOptions The given transaction options (an object with fixed, optional, keys).
     * @param nonInteractive Whether to raise an error when this action is about
     * to become interactive.
     * @returns {Promise<void>}
     */
    invoke(givenArguments, givenTxOptions, nonInteractive) {
        return invoke(
            this._hre, null, this._method, this._argumentsSpec, givenArguments || {},
            this._txOptionsSpec, givenTxOptions || {}, nonInteractive || false
        );
    }
}

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