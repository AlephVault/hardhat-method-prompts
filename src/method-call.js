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
 * @returns {Promise<void>} Nothing (async function).
 */
async function invokeSend(
    hre, contract, method, argumentsSpec, givenArguments, txOptionsSpec, givenTxOptions, nonInteractive
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
        await onSuccess(hre.common.send(contract, name, processedArguments, processedTxOptions));
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
 * @returns {Promise<void>} Nothing (async function).
 * @param nonInteractive Whether to raise an error when this method is about
 * to become interactive.
 */
async function invokeCall(
    hre, contract, method, argumentsSpec, givenArguments, nonInteractive
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
        await onSuccess(hre.common.call(contract, name, processedArguments));
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
 * @returns {Promise<void>} Nothing (async function).
 */
async function invoke(
    hre, contract, method, argumentsSpec, givenArguments, txOptionsSpec, givenTxOptions, nonInteractive
) {
    method = method || {};
    const {type} = method;
    if (!type) {
        console.log("Unspecified method type");
    }

    switch(type) {
        case "call":
            await invokeCall(
                hre, contract, method, argumentsSpec, givenArguments, nonInteractive
            );
            break;
        case "send":
            await invokeSend(
                hre, contract, method, argumentsSpec, givenArguments, txOptionsSpec, givenTxOptions, nonInteractive
            );
            break;
        default:
            console.log(`Invalid method type: ${type} -- Expected 'send' or 'call'`);
    }
}

module.exports = {
    invoke
}