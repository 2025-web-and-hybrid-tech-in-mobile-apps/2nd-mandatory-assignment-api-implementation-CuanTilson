const mocha = require('mocha');
const chalk = require('chalk');

class CustomReporter extends mocha.reporters.Spec {
    constructor(runner) {
        super(runner);

        runner.on('start', () => {
            console.log(chalk.bold.green('\n🚀 Starting Tests...\n'));
        });


        runner.on('end', () => {
            console.log(chalk.bold.green('\n✅ All Tests Completed.\n'));
        });
    }
}

module.exports = CustomReporter;
