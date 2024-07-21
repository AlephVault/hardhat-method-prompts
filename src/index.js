const {invoke} = require("./method-call");
const {extendEnvironment, task} = require("hardhat/config");
const {argumentSpecs: txOptionArgumentSpecs} = require("./tx-options");

// There are ALL the tx options' arguments.
const allTxOptionArgumentSpecs = {
    ...txOptionArgumentSpecs,
    "eip155": {
        description: "Whether to use an eip155 signature for the transaction",
        argumentType: "boolean"
    }
}

// These mapping tells which of the options' arguments
// are named arguments and which are flags.
const txOptionTaskArgumentType = Object.fromEntries([
    ...Object.keys(txOptionArgumentSpecs).map((k) => [k, "argument"]),
    ["eip155", "flag"]
]);

/**
 * Makes a task out of a set of specs.
 * @param name The task
 * @param description The task description.
 * @param argumentSpecs The specs for the regular arguments.
 * @param txOptionsArgumentSpecs The specs for the transaction
 * options' arguments.
 * @param options A {scope, onlyExplicitTxOptions} object,
 * where `scope` is the scope for the task and
 * `onlyExplicitTxOptions` tells whether not to include
 * all the 7 options, but only the explicitly defined ones,
 * into the task declaration.
 */
function asTask(name, description, argumentSpecs, txOptionsArgumentSpecs, options) {
    // 1. Parse the options.
    let {scope, onlyExplicitTxOptions} = options || {};
    let task_ = scope ? scope.task(name, description) : task(name, description);

    // 2. Enumerate the options to use for transactions.
    let txOptions = Object.keys(!onlyExplicitTxOptions ? allTxOptionArgumentSpecs : txOptionsArgumentSpecs);
    let txOptionsMap = Object.fromEntries(txOptions.map((k) => [k, true]));

    // 3. Enumerating all the options (including nonInteractive).
    let allDefaultOptions = [...txOptions, "nonInteractive"];

    // 4. Validating the argument spacs.
    validateArgumentNames(argumentSpecs, txOptionsMap);
}

function validateArgumentNames(argumentSpecs, txOptionsMap) {
    const collectedArgumentNames = {};
    argumentSpecs.forEach(({name}) => {
        name = name || "";
        if (!name) {
            throw new Error("Empty/unset names on arguments are not valid when creating tasks");
        }

        if (name === "nonInteractive") {
            throw new Error("nonInteractive is a reserved name when creating tasks.");
        }

        if (!/^[a-z][a-zA-Z0-9]$/.test(name)) {
            throw new Error("Argument names must be camelCase when creating tasks");
        }

        if (collectedArgumentNames[name]) {
            throw new Error("Argument names must not repeat when creating tasks");
        }
        collectedArgumentNames[name] = true;

        if (txOptionsMap[name]) {
            throw new Error(`The argument name \`${name}\` is reserved for an allowed transaction option argument`);
        }
    })
}

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