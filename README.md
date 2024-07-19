# hardhat-method-prompts
A hardhat plugin offering the possibility to quickly implement prompt-powered method calls to contracts.

# Installation
Run this command to install it from NPM:

```shell
npm install --save-dev hardhat-common-tools@^1.4.0 hardhat-enquirer-plus@^1.4.2 hardhat-blueprints@^1.2.2 hardhat-method-prompts@^1.0.0
```

# Usage
You'll not typically make use of this package directly, save for developing your own sub-packages or tasks.

If that's the case, then this package allows you to create method calls (which can be static or transactional).

## Creating a method invocation
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