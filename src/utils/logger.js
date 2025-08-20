import chalk from "chalk";

export const log={
    info:(...args)=>console.log(chalk.cyan("i"), ...args),
    step:(...args)=>console.log(chalk.blue("->"), ...args),
    success:(...args)=>console.log(chalk.green("✓"), ...args),
    warn:(...args)=>console.log(chalk.yellow("!"), ...args),
    error:(...args)=>console.log(chalk.red("✗"), ...args)
}