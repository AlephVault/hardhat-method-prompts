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
 * @param options A {scope, onlyExplicitTxOptions, extra} object,
 * where `scope` is the scope for the task, `onlyExplicitTxOptions`
 * tells whether not to include all the 7 transaction options, but
 * only the explicitly defined ones, into the task declaration, and
 * `extra` stands for an array of extra arguments to collect, given
 * by their name and description. Each extra option is a pair like
 * [name, description] so new arguments will be created out of them.
 * @param callback The callback to execute.
 */
function asTask(
    name, description, argumentSpecs, txOptionsArgumentSpecs,
    options, callback
) {
    // 1. Parse the options and start the task.
    let {scope, onlyExplicitTxOptions, extra} = options || {};
    let task_ = scope ? scope.task(name, description) : task(name, description);

    // 2. Enumerate the options to use for transactions.
    let allTxOptions = Object.keys(!onlyExplicitTxOptions ? allTxOptionArgumentSpecs : txOptionsArgumentSpecs);
    let allTxOptionsMap = Object.fromEntries(allTxOptions.map((k) => [k, true]));
    if (allTxOptionsMap.nonInteractive) {
        throw new Error("nonInteractive is a reserved name when creating tasks.");
    }

    // 3. Enumerating the extra arguments.
    let extraOptions = extra || [];
    let extraOptionsMap = Object.fromEntries(extraOptions.map(([name, _]) => {
        if (allTxOptions[name])
            throw new Error(`The extra argument ${name} must not also be present among the transaction options`);
        return [name, true];
    }));
    if (extraOptionsMap.nonInteractive) {
        throw new Error("nonInteractive is a reserved name when creating tasks.");
    }

    // 4. Validating the argument spacs.
    validateArgumentNames(argumentSpecs, allTxOptionsMap, extraOptionsMap);

    // 5. Installing arguments.
    argumentSpecs.forEach(({name, description}) => {
        task_ = task_.addOptionalParam(name, description);
    });

    // 6. Installing transaction options.
    allTxOptions.forEach((name) => {
        task_ = txOptionTaskArgumentType[name] === "flag"
            ? task_.addFlag(name, allTxOptionArgumentSpecs[name].description)
            : task_.addOptionalParam(name, allTxOptionArgumentSpecs[name].description);
    });

    // 7. Installing the extra options.
    extraOptions.forEach(([name, description]) => {
        task_ = task_.addOptionalParam(name, description);
    });

    // 8. Installing nonInteractive.
    task_ = task_.addFlag(
        "nonInteractive", "Whether to throw an error because the task became interactive"
    );

    // Return it with the new action.
    return task_.setAction(async (args, hre, runSuper) => {
        const givenArguments = Object.fromEntries(argumentSpecs.map(({name}) => {
            return [name, args[name]];
        }));
        const givenTxOptions = Object.fromEntries(allTxOptions.map((name) => {
            return [name, args[name]];
        }));
        const givenExtraOptions = Object.fromEntries(extraOptions.map(([name]) => {
            return [name, args[name]];
        }));
        await callback(givenArguments, givenTxOptions, givenExtraOptions, args.nonInteractive);
    });
}

function validateArgumentNames(argumentSpecs, txOptionsMap, extraOptionsMap) {
    const collectedArgumentNames = {};
    argumentSpecs.forEach(({name}) => {
        name = name || "";
        if (!name) {
            throw new Error("Empty/unset names on arguments are not valid when creating tasks");
        }

        if (name === "nonInteractive") {
            throw new Error("nonInteractive is a reserved name when creating tasks.");
        }

        if (!/^[a-z][a-zA-Z0-9]+$/.test(name)) {
            throw new Error("Argument names must be camelCase when creating tasks");
        }

        if (collectedArgumentNames[name]) {
            throw new Error("Argument names must not repeat when creating tasks");
        }
        collectedArgumentNames[name] = true;

        if (txOptionsMap[name]) {
            throw new Error(`The argument name \`${name}\` is reserved for an allowed transaction option argument`);
        }

        if (extraOptionsMap[name]) {
            throw new Error(`The argument name \`${name}\` is already present among the extra options`);
        }
    });
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

    /**
     * Creates a hardhat task out of this
     * @param name The name of the task.
     * @param description The description of the task.
     * @param options A {scope, onlyExplicitTxOptions} object.
     * The scope is a hardhat scope to put this task into, while
     * the onlyExplicitTxOptions tells that, if true, only the
     * explicitly declared transaction options are allowed in
     * the task spec (otherwise, and by default, all of them are
     * added as arguments).
     * @returns {*} The task.
     */
    asTask(name, description, options) {
        return asTask(
            name, description, this._argumentsSpec, this._txOptionsSpec, {...options, extra: [
                ["deploymentId", "An optional ignition deployment id"],
                ["deployedContractId", "An optional ignition deployed contract id"],
            ]}, (args, txOpts, {deploymentId, deployedContractId}, nonInteractive) => this.invoke(
                deploymentId, deployedContractId, args, txOpts, nonInteractive
            )
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

    /**
     * Creates a hardhat task out of this
     * @param name The name of the task.
     * @param description The description of the task.
     * @param options A {scope, onlyExplicitTxOptions} object.
     * The scope is a hardhat scope to put this task into, while
     * the onlyExplicitTxOptions tells that, if true, only the
     * explicitly declared transaction options are allowed in
     * the task spec (otherwise, and by default, all of them are
     * added as arguments).
     * @returns {*} The task.
     */
    asTask(name, description, options) {
        return asTask(
            name, description, this._argumentsSpec, this._txOptionsSpec, options,
            (args, txOpts, _, nonInteractive) => this.invoke(args, txOpts, nonInteractive)
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