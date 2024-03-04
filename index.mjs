import chalk from "chalk";
import inquirer from "inquirer";

import fs, { existsSync, mkdir } from 'fs';

operation()

function operation() {
    inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Select an option:',
            choices: [
                'Create account',
                'Check balance',
                'Deposit',
                'Withdraw',
                'Transfer',
                'Exit'
            ]
        }])
        .then((answer) => {
            const action = answer['action']

            if (action === 'Create account') {
                createAccount()
            } else if (action === 'Check balance') {
                getAccountBalance()
            } else if (action === 'Deposit') {
                deposit()
            } else if (action === 'Withdraw') {
                withdraw()
            } else if (action == 'Transfer') {
                transfer()
            } else if (action === 'Exit') {
                console.log(chalk.bgBlue.black('Thank you for using IGBank.'))
                process.exit()
            }

        })
        .catch(err => console.log(err))
}

//Create an Account
function createAccount() {
    console.log(chalk.bgGreen.black('Congratulations on creating your account!'))
    console.log(chalk.green('Define the options of your account below:'))

    buildAccount()
}

function buildAccount() {
    inquirer.prompt([{
            'name': 'accountName',
            'message': 'Inform the name of your account:'
        }])
        .then((answer) => {
            const accountName = answer['accountName']

            console.info(accountName)

            if (!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts')
            }

            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(chalk.bgRed.black('This account already exists. Please choose another name.'))

                buildAccount()
                return
            }

            fs.writeFileSync(`accounts/${accountName}.json`,
                '{"balance": 0}',
                function(err) {
                    console.log(err)
                },
            )

            console.log(chalk.green('Congratulations, your account has been created!'))

            operation()
        })
        .catch(err => console.log(err))

}

// Add an amount to user account
function deposit() {
    inquirer.prompt([{
            name: 'accountName',
            message: 'Please provide the name of the account:',
        }])
        .then((answer) => {
            const accountName = answer['accountName']

            // Verify if account exists
            if (!checkAccount(accountName)) {
                return deposit()
            }

            inquirer.prompt([{
                    name: 'amount',
                    message: 'How much would you like to deposit?'
                }])
                .then((answer) => {
                    const amount = answer['amount']

                    // add an amount
                    addAmount(accountName, amount)
                    console.log(chalk.green(`The amount of R$${amount} has been deposited into your account.`))
                    operation()
                })
                .catch(err => console.log(err))
        })
        .catch((err) => console.log(err))
}

function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('This account does not exist. Please enter a valid name.'))
        return false
    }
    return true
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('An error occurred. Please try again later.'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        }
    )

}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })
    return JSON.parse(accountJSON)
}

// Show account balance
function getAccountBalance() {
    inquirer.prompt([{
            name: 'accountName',
            message: 'Please provide the name of your account:'
        }])
        .then((answer) => {
            const accountName = answer['accountName']

            // Verify if account existy
            if (!checkAccount(accountName)) {
                return getAccountBalance()
            }

            const accountData = getAccount(accountName)

            console.log(chalk.bgBlue.black(`Your account balance is R$${accountData.balance}.`))
            operation()
        })
        .catch(err => console.log(err))
}

// withdraw an amount from user account
function withdraw() {
    inquirer.prompt([{
            name: 'accountName',
            message: 'Please provide the name of your account:'
        }])
        .then((answer) => {
            const accountName = answer['accountName']

            if (!checkAccount(accountName)) {
                return withdraw()
            }

            inquirer.prompt([{
                    name: 'amount',
                    message: 'Please provide the withdrawal amount:'
                }])
                .then((answer) => {
                    const amount = answer['amount']

                    removeAmount(accountName, amount)
                    console.log(chalk.green(`A withdrawal of R$${amount} has been made from your account.`))
                    operation()
                })
                .catch(err => console.log(err))

        })
        .catch(err => console.log(err))
}

function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('An error occurred. Please try again later.'))
        return withdraw()
    }


    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Unavailable value!'))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        }
    )

}

function transfer() {
    inquirer.prompt([{
            name: 'accountName',
            message: 'Please provide your account:'
        }])
        .then((answer) => {
            const accountName = answer['accountName']

            if (!checkAccount(accountName)) {
                return transfer()
            }

            inquirer.prompt([{
                    name: 'recipientaccount',
                    message: 'Please provide the account that will receive the transfer:'
                }])
                .then((answer) => {
                    const recipientaccount = answer['recipientaccount']

                    if (!checkAccount(recipientaccount)) {
                        return transfer()
                    }

                    inquirer.prompt([{
                            name: 'amount',
                            message: 'Transfer amount:'
                        }])
                        .then((answer) => {
                            const amount = answer['amount']

                            if (!amount) {
                                console.log(chalk.bgRed.black('An error occurred. Please try again later.'))
                                return transfer()
                            }

                            addAmount(recipientaccount, amount)
                            removeAmount(accountName, amount)

                            console.log(chalk.bgBlue.black(`Transfer in the amount of R$${amount} successfully completed.`))
                            operation()
                        })
                        .catch(err => console.log(err))

                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))

}