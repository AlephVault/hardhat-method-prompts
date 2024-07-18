const {invoke} = require("./method-call");
const {extendEnvironment} = require("hardhat/config");
const {ArrayPluginPrompt: ArrayPluginPrompt_} = require("./argumentTypes/arrays");
const {TuplePluginPrompt: TuplePluginPrompt_} = require("./argumentTypes/tuples");
const {registerScalarTypes} = require("./argumentTypes/scalar");
const {registerCompoundTypes} = require("./argumentTypes/compound");

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
    if (!hre.ignition) {
        throw new Error(
            "The hardhat-ignition-deploy-everything module requires @nomicfoundation/hardhat-ignition " +
            "to be installed as a plug-in, along with the plug-in " + (
                hre.viem ? "@nomicfoundation/hardhat-ignition/viem" : "@nomicfoundation/hardhat-ignition-ethers"
            )
        );
    }

    // Scalar types: uint*, int*, bytes*.
    registerScalarTypes(hre);

    // Compound types: tuple, array.
    registerCompoundTypes(hre);

    // The contract method call.
    class ContractMethodPrompt extends ContractMethodPrompt_ {
        constructor(methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec) {
            super(hre, methodType, name, {onError, onSuccess}, argumentsSpec, txOptionsSpec);
        }
    }

    // Registering the methodPrompts namespace.
    hre.methodPrompts = {ContractMethodPrompt};
})

module.exports = {};