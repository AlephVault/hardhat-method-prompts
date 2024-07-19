const {processArguments} = require("./arguments");
const {processTxOptions} = require("./tx-options");

/**
 * Executes a "send" (transaction) method.
 * @param hre The hardhat runtime environment.
 * @param contract A contract instance.
 * @param method The method to call, as described.
 * @param argumentsSpec The expected arguments (an array).
 * @param givenArguments The given arguments (an array).
 * @param txOptionsSpec The expected transaction options (an object with fixed, optional, keys).
 * @param givenTxOptions The given transaction options (an object with fixed, optional, keys).
 * @param nonInteractive Whether to raise an error when this method is about
 * to become interactive.
 * @param verbose Whether to show logs or not.
 * @returns {Promise<void>} Nothing (async function).
 */
async function invokeSend(
    hre, contract, method, argumentsSpec, givenArguments, txOptionsSpec, givenTxOptions,
    nonInteractive, verbose
) {
    let {name, onError, onSuccess} = method;
    onError = onError || (async (e) => {
        console.error(e.message);
    })
    onSuccess = onSuccess || (async (r) => {
        // Nothing here.
    });

    try {
        const processedArguments = await processArguments(hre, argumentsSpec, givenArguments, nonInteractive);
        const processedTxOptions = await processTxOptions(hre, txOptionsSpec, givenTxOptions, nonInteractive);
        if (verbose) {
            const contractAddress = await hre.common.getContractAddress(contract);
            console.log(`Invoking SEND method: ${method.name} on contract: ${contractAddress}`);
            console.log("- args:", processedArguments);
            console.log("- tx. options:", processedTxOptions);
        }
        await onSuccess(await hre.common.send(contract, name, processedArguments, processedTxOptions));
    } catch(e) {
        await onError(e);
    }
}

/**
 * Executes a "call" (static) method.
 * @param hre The hardhat runtime environment.
 * @param contract A contract instance.
 * @param method The method to call, as described.
 * @param argumentsSpec The expected arguments (an array).
 * @param givenArguments The given arguments (an array).
 * @param nonInteractive Whether to raise an error when this method is about
 * to become interactive.
 * @param verbose Whether to show logs or not.
 * @returns {Promise<void>} Nothing (async function).
 */
async function invokeCall(
    hre, contract, method, argumentsSpec, givenArguments, nonInteractive, verbose
) {
    let {name, onError, onSuccess} = method;
    onError = onError || (async (e) => {
        console.error(e.message);
    })
    onSuccess = onSuccess || (async (r) => {
        // Nothing here.
    });

    try {
        const processedArguments = await processArguments(hre, argumentsSpec, givenArguments, nonInteractive);
        if (verbose) {
            const contractAddress = await hre.common.getContractAddress(contract);
            console.log(`Invoking CALL method: ${method.name} on contract: ${contractAddress}`);
            console.log("- args:", processedArguments);
        }
        await onSuccess(await hre.common.call(contract, name, processedArguments));
    } catch(e) {
        await onError(e);
    }
}

/**
 * Invokes a method, perhaps prompting, from a contract. The prompt will provide
 * all the data that was not provided beforehand.
 *
 * The method is a special object. It will look like this:
 *
 *     {
 *         // The name of the method (or signature, for any
 *         // required disambiguation).
 *         name: "mint" | "mint(uint256,uint256),
 *         // Method type. Use "send" for transactional ones
 *         // and "call" for static ones.
 *         type: "send" | "call",
 *         // A handler for any eventual error.
 *         onError: {Some async(e) => {...} function}.
 *         // A handler for the result (Either a tx reference,
 *         // for "send", or result data, for "call").
 *         onSuccess: {Some async(tx|result) => {...}}
 *     }
 *
 * @param hre The hardhat runtime environment.
 * @param contract A contract instance.
 * @param method The method to call, as described.
 * @param argumentsSpec The expected arguments (an array).
 * @param givenArguments The given arguments (an array).
 * @param txOptionsSpec The expected transaction options (an object with fixed, optional, keys).
 * @param givenTxOptions The given transaction options (an object with fixed, optional, keys).
 * @param nonInteractive Whether to raise an error when this method is about
 * to become interactive.
 * @param verbose Whether to show logs or not.
 * @returns {Promise<void>} Nothing (async function).
 */
async function invoke(
    hre, contract, method, argumentsSpec, givenArguments, txOptionsSpec, givenTxOptions, nonInteractive, verbose
) {
    method = method || {};
    const {type} = method;
    if (!type) {
        console.log("Unspecified method type");
    }

    switch(type) {
        case "call":
            await invokeCall(
                hre, contract, method, argumentsSpec, givenArguments, nonInteractive, verbose
            );
            break;
        case "send":
            await invokeSend(
                hre, contract, method, argumentsSpec, givenArguments, txOptionsSpec, givenTxOptions,
                nonInteractive, verbose
            );
            break;
        default:
            console.log(`Invalid method type: ${type} -- Expected 'send' or 'call'`);
    }
}

module.exports = {
    invoke
}