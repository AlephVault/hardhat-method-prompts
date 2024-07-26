# hardhat-method-prompts
A hardhat plugin offering the possibility to quickly implement prompt-powered method calls to contracts.

# Installation
Run this command to install it from NPM:

```shell
npm install --save-dev hardhat-common-tools@^1.5.0 hardhat-enquirer-plus@^1.4.2 hardhat-blueprints@^1.2.2 hardhat-method-prompts@^1.2.0
```

# Usage
You'll not typically make use of this package directly, save for developing your own sub-packages or tasks.

If that's the case, then this package allows you to create method calls (which can be static or transactional).

## Creating a contract method invocation
Let's say you want to create a `mint` call for an ERC-1155 contract. You can define your method like this:

```javascript
const method = new hre.methodPrompts.ContractMethodPrompt(
    "send", "mint", {
        onError: (e) => {
            console.error("There was an error while running this method");
            console.error(e);
        },
        onSuccess: (tx) => {
            console.log("The method ran successfully:", tx);
        }
    }, [{
        name: "to",
        description: "The target of the mint",
        message: "Who will receive the minted tokens?",
        argumentType: "smart-address"
    }, {
        name: "id",
        description: "The ID of the token",
        message: "What's the token you want to mint?",
        argumentType: "uint256"
    }, {
        name: "value",
        description: "The amount of that token",
        message: "What's the amount of the token?",
        argumentType: "uint256"
    }, {
        name: "data",
        description: "The data for the transaction",
        message: "Add some hexadecimal binary data:",
        argumentType: "bytes"
    }], {
        account: {onAbsent: "default"},
        gasPrice: {onAbsent: "prompt"}
    }
);
```

And then invoking it like this:

```javascript
await method.invoke(
    // In my case, this is a valid ignition Module#Contract id.
    // If you don't have a specific id, use undefined. It will
    // be prompted to you.
    //
    // Also, feel free to use undfined for deploymentId if you
    // are not interacting with a particular deployment. It will
    // default to `chain-{yourChainId}`.
    deploymentId, "MyOwnedERC1155Module#MyOwnedERC1155",
    {to, id, value: amount, data}, {account, gasPrice}, nonInteractive
);
```

View methods are simpler, since they do not involve transaction params:

```javascript
const method = new hre.methodPrompts.ContractMethodPrompt(
    "call", "balanceOf", {
        onError: (e) => {
            console.error("There was an error while running this method");
            console.error(e);
        },
        onSuccess: (value) => {
            console.log("Balance:", value);
        }
    }, [{
        name: "address",
        description: "The target of the mint",
        message: "Who will receive the minted tokens?",
        argumentType: "smart-address"
    }, {
        name: "id",
        description: "The ID of the token",
        message: "What's the token you want to mint?",
        argumentType: "uint256"
    }], {}
);
```

While the invocation would look like this:

```javascript
await method.invoke(
    // In my case, this is a valid ignition Module#Contract id.
    // If you don't have a specific id, use undefined. It will
    // be prompted to you.
    //
    // Also, feel free to use undfined for deploymentId if you
    // are not interacting with a particular deployment. It will
    // default to `chain-{yourChainId}`.
    deploymentId, deployedContractId,
    {address, id}, {}, nonInteractive
);
```

## Details about transaction options
The following options can be configured and provided as transaction options:

1. `eip155` can always be specified and must be a boolean.
2. `account` can be an account ("0" to "{N-1}", where N is the number of accounts).
3. `value` is the amount to pay (e.g. "100000000000000000000000" or "2.5 ether").
4. `gas` is an uint256 value with the gas (e.g. "1000000").
5. `gasPrice` is the amount to pay per gas unit (e.g. "400000000000" or "400 gwei").
6. `maxFeePerGas` the max EIP-1559 amount to pay per gas unit.
7. `maxPriorityFeePerGas` the priority EIP-1559 amount to pay per gas unit.

For each of these options (except `eip155`) each input is a string as received
from command line (this is suitable for _tasks_), but the configuration tolerates
`{onAbsent: "prompt"}`, `{onAbsent: "default"}` and `{onAbsent: "default", "default": someValue}`.

The meaning of each setting is as follows:

- The first one will prompt the user for a value if the value is not provided.
- The second one will not prompt the user: it will not be included among the final
  options and will be treated by default (e.g. gasPrice and gas will be estimated,
  EIP-1559 ones will not be used or estimated, value will be 0, and the account
  will be the 0th / first one).
- The third one works similar: it will not prompt on absence but will use the
  specified default value when determining the final transaction options.

## Creating a custom invocation

While the previous ones are calls that were designed for interacting with contracts,
you might want to create tasks that are not necessarily related to contracts but with
some general or low-level interaction (with a complex, yet single-transaction, set of
instructions).

The syntax to do that is similar, yet different in nature. For example, a task to do
a balance transfer of native token is not strictly related to a contract's method, but
instead a custom callback:

```javascript
const method2 = new hre.methodPrompts.CustomPrompt(
    function([address], txOpts) {
        return hre.common.transfer(address, txOpts);
    }, {
        onError: (e) => {
            console.error("There was an error while getting the balance");
            console.error(e);
        },
        onSuccess: (tx) => {
            console.log("The transfer ran successfully:", tx);
        }
    }, [{
        name: "address",
        description: "The address (or account index) to send native tokens to",
        message: "What's the address (or account index) to send native tokens to?",
        argumentType: "smart-address"
    }], {
        value: {onAbsent: "prompt"},
        account: {onAbsent: "default"},
        gasPrice: {onAbsent: "default"}
    }
);

// Let's assume address, value, account, gasPrice and nonInteractive literally
// exist and are exactly named like that.
await method2.invoke({address}, {value, account, gasPrice}, nonInteractive);
```

__PLEASE NOTE__: The regular arguments are an array that gets its values in
order from the specs in a one-to-one relation against the list of regular
arguments defined in the prompt. The transaction options are always an object
in the same way they're passed to the contract calls.

## Registering them as tasks

You can register hardhat tasks quickly, based on these prompt classes. For
example:

```javascript
method.asTask("balance-of", "Gets the native balance of an address");
```

will create the task: `npx hardhat invoke balance-of`. Use `--help` to get
the full details. You'll notice how all the arguments for the method are
converted into optional task arguments (and all the non-provided arguments
will be prompted to the user). Also, arguments for transaction options are
also defined there. Finally, the `--non-interactive` flag is also defined.

You can pass extra options as a third argument:

```javascript
method.asTask("balance-of", "Gets the native balance of an address", {
  scope: someHardhatScopeHere,
  onlyExplicitTxOptions: true
});
```

If you specify `null` into `someHardhatScopeHere`, then the defined task
will belong to no scope at all. If you don't specify a scope there, then
a default `invoke` scope will be used to define the task. Otherwise, the
specified scope will be used to define the task.

The `onlyExplicitTxOptions` flag, when set to True, only allows specifying
the explicitly defined transaction options for the task. Otherwise, the
options that are not specified are also not included as task arguments. This
one should be set to `true` for methods that would not make use of code that
invokes transactions (e.g. `balance-of`) and, under certain conditions, it
might be useful for certain transactional methods.

These options make sense bot for custom and regular method prompts.

The body of the task is not defined by the user: it will become a call to
the `.invoke` method properly (both for custom and regular methods).

### Already defined tasks

The following tasks are already defined. Check them with `--help` to have a
grasp on what they do:

```shell
# Tools:
npx hardhat invoke keccak256 --help
# Native:
npx hardhat invoke balance-of --help
npx hardhat invoke transfer --help
# ERC-20:
npx hardhat invoke erc20:approve --help
npx hardhat invoke erc20:allowance --help
npx hardhat invoke erc20:balance-of --help
npx hardhat invoke erc20:decimals --help
npx hardhat invoke erc20:name --help
npx hardhat invoke erc20:symbol --help
npx hardhat invoke erc20:total-supply --help
npx hardhat invoke erc20:transfer --help
npx hardhat invoke erc20:transfer-from --help
# ERC-721
npx hardhat invoke erc721:approve --help
npx hardhat invoke erc721:balance-of --help
npx hardhat invoke erc721:get-approved --help
npx hardhat invoke erc721:name --help
npx hardhat invoke erc721:owner-of --help
npx hardhat invoke erc721:safe-transfer-from --help
npx hardhat invoke erc721:safe-transfer-from-with-data --help
npx hardhat invoke erc721:set-approval-for-all --help
npx hardhat invoke erc721:symbol --help
npx hardhat invoke erc721:token-uri --help
npx hardhat invoke erc721:transfer-from --help
# ERC-1155
npx hardhat invoke erc1155:balance-of --help
npx hardhat invoke erc1155:balance-of-batch --help
npx hardhat invoke erc1155:set-approval-for-all --help
npx hardhat invoke erc1155:is-approved-for-all --help
npx hardhat invoke erc1155:safe-transfer-from --help
npx hardhat invoke erc1155:safe-batch-transfer-from --help
npx hardhat invoke erc1155:token-uri --help
```

An example of the invocations. These assume:

1. The futures' ids are valid on each --deployment-contract-id.
2. The ERC-20 contract starts with more than 1e18 token amount on address for account `[1]`.
3. The ERC-721 contract starts with token `1` for account `[1]`.
4. The ERC-1155 contract starts with more than 1e18 token amount of token `1` on address for account `[1]`.
5. The user executes the instructions _in strict order as presented_.
6. They can be executed without any argument (save for --network), but the commands will become interactive
   and prompt each argument to the user.

The instructions are:

```shell
// Tools:
npx hardhat invoke keccak256 --text "Hello World"
// Native:
npx hardhat invoke balance-of --address 0 --network localhost --non-interactive
npx hardhat invoke transfer --account 0 --address 1 --value "1 ether" --network localhost --non-interactive
// ERC-20:
npx hardhat invoke erc20:approve --owner 1 --allowed 0 --amount 1000000000000000000 --network localhost --deployed-contract-id "MyOwnedERC20Module#MyOwnedERC20" --non-interactive
npx hardhat invoke erc20:allowance --owner 1 --allowed 0 --network localhost --deployed-contract-id "MyOwnedERC20Module#MyOwnedERC20" --non-interactive
npx hardhat invoke erc20:balance-of --address 1 --network localhost --deployed-contract-id "MyOwnedERC20Module#MyOwnedERC20" --non-interactive
npx hardhat invoke erc20:decimals --network localhost --deployed-contract-id "MyOwnedERC20Module#MyOwnedERC20" --non-interactive
npx hardhat invoke erc20:name --network localhost --deployed-contract-id "MyOwnedERC20Module#MyOwnedERC20" --non-interactive
npx hardhat invoke erc20:symbol --network localhost --deployed-contract-id "MyOwnedERC20Module#MyOwnedERC20" --non-interactive
npx hardhat invoke erc20:total-supply --network localhost --deployed-contract-id "MyOwnedERC20Module#MyOwnedERC20" --non-interactive
npx hardhat invoke erc20:transfer --to 0 --amount 1000000000000000000 --network localhost --deployed-contract-id "MyOwnedERC20Module#MyOwnedERC20" --account 1 --non-interactive
npx hardhat invoke erc20:transfer-from --from 1 --to 0 --amount 1000000000000000000 --network localhost --deployed-contract-id "MyOwnedERC20Module#MyOwnedERC20" --account 0 --non-interactive
// ERC-721
npx hardhat invoke erc721:approve --to 0 --token-id 1 --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --network localhost --account 1 --non-interactive
npx hardhat invoke erc721:balance-of --address 1 --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --network localhost --non-interactive
npx hardhat invoke erc721:get-approved --token-id 1 --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --network localhost --non-interactive
npx hardhat invoke erc721:name --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --network localhost --non-interactive
npx hardhat invoke erc721:owner-of --token-id 1 --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --network localhost --non-interactive
npx hardhat invoke erc721:safe-transfer-from --from 1 --to 0 --token-id 1 --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --network localhost --account 1 --non-interactive
npx hardhat invoke erc721:safe-transfer-from-with-data --from 0 --to 1 --data "0x" --token-id 1 --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --network localhost --account 0 --non-interactive
npx hardhat invoke erc721:set-approval-for-all --address 0 --set true --network localhost --account 1 --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --non-interactive
npx hardhat invoke erc721:symbol --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --network localhost --non-interactive
npx hardhat invoke erc721:token-uri --token-id 1 --network localhost --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --non-interactive
npx hardhat invoke erc721:transfer-from --from 1 --to 0 --token-id 1 --deployed-contract-id "MyOwnedERC721Module#MyOwnedERC721" --network localhost --account 1 --non-interactive
// ERC-1155
npx hardhat invoke erc1155:balance-of --address 1 --token-id 1 --network localhost --deployed-contract-id "MyOwnedERC1155Module#MyOwnedERC1155" --non-interactive
npx hardhat invoke erc1155:balance-of-batch --addresses "[1]" --token-ids "[1]" --network localhost --deployed-contract-id "MyOwnedERC1155Module#MyOwnedERC1155" --non-interactive
npx hardhat invoke erc1155:set-approval-for-all --address 1 --approve y --network localhost --deployed-contract-id "MyOwnedERC1155Module#MyOwnedERC1155" --non-interactive
npx hardhat invoke erc1155:is-approved-for-all --operator 1 --owner 0 --network localhost --deployed-contract-id "MyOwnedERC1155Module#MyOwnedERC1155" --non-interactive
npx hardhat invoke erc1155:safe-transfer-from --from 1 --to 0 --token-id 1 --amount 1000000000000000000 --data 0x --network localhost --deployed-contract-id "MyOwnedERC1155Module#MyOwnedERC1155" --account 1 --non-interactive
npx hardhat invoke erc1155:safe-batch-transfer-from --from 1 --to 0 --token-ids "[1]" --amounts "[1000000000000000000]" --data 0x --network localhost --deployed-contract-id "MyOwnedERC1155Module#MyOwnedERC1155" --account 1 --non-interactive
npx hardhat invoke erc1155:token-uri --token-id 1 --network localhost --deployed-contract-id "MyOwnedERC1155Module#MyOwnedERC1155" --non-interactive
```