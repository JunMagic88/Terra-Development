/*==============================================================================================\

Luna <> bLuna Arbitrage Bot by JunMagic 

PRE-REQUISITES:
  1. Install node.js: https://nodejs.org/en/download/
  2. Save this .js file to  a local folder that only YOU can access
  3. Create an empty 'bLuna.txt' file in the same folder for logging
  4. Create a new terrastation wallet & note seed phrase (NEVER run bots with your main wallet): 
    https://docs.terra.money/docs/learn/terra-station/download/terra-station-desktop.html
  5. Transer some UST (for gas) and Luna to the test wallet

SETUP & RUN:
  1. Replace 'xxxx xxxx xxxx' with your test wallet 'seed phases' - NEVER SHOW THIS TO ANYONE! */
  const mk = new MnemonicKey({
    mnemonic: 'xxxx xxxx xxxx',
  });
  //2. Change to 1 to use mainnet or leave as 0 to use test net
  let mainnet = 0; 
  //3. Set the bLuna prices below and above which you want to swap from & to Luna 
  let toBlunaPrice = 0.98
  let toLunaPrice = 0.99
 
  //4. Open folder in Terminal (Mac) or Command Prompt (Windows) and run 'node bLunaArbie.js'
  //5. Check 'bLuna.txt' and you should see a log entry 
  //6. To set this to run regularly, use Task Scheduler (Windows) or crontab (Mac / Linux):
  //https://www.windowscentral.com/how-create-automated-task-using-task-scheduler-windows-10
  //https://betterprogramming.pub/https-medium-com-ratik96-scheduling-jobs-with-crontab-on-macos-add5a8b26c30
  //note: crontab needs full disk permission for MacOS (under Security & Privacy settings)

//==============================================================================================

var currentdate = new Date(); 
var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
import {
  MsgExecuteContract,
  MnemonicKey,
  Coins,
  LCDClient
} from "@terra-money/terra.js";
import * as fs from 'fs';

if(mainnet){
  const lcd = new LCDClient({ 
    URL: 'https://lcd.terra.dev', 
    chainID: 'columbus-5',
    gasPrices: {uusd: 0.25} 
  });
  //Luna <> bLuna pool on mainnet
  const pool = "terra1jxazgm67et0ce260kvrpfv50acuushpjsz2y0p"; 
  //bLuna smart contract on mainnet
  const bluna = "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp" 
} else {
  const lcd = new LCDClient({ 
    URL: 'https://bombay-lcd.terra.dev', 
    chainID:'bombay-12',
    gasPrices: {uusd: 0.25} 
  });
  //Luna <> bLuna pool on testnet
  const pool = "terra13e4jmcjnwrauvl2fnjdwex0exuzd8zrh5xk29v" 
  //bLuna smart contract on testnet
  const bluna = "terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x" 
}

const wallet = lcd.wallet(mk);
console.log('Wallet created. Address: '+ await wallet.key.accAddress+'\n...');

// Fetch the number of each asset in the pool.
const { assets } = await lcd.wasm.contractQuery(pool, { pool: {} });

// Calculate belief price using pool balances.
const beliefPrice = (assets[1].amount / assets[0].amount).toFixed(18);
console.log('asset 1: '+assets[0].amount+'\n'+'asset 2: '+assets[1].amount+'\n'+'belief price = '+beliefPrice);

let log = datetime+" Did nothing. Belief Price = "+beliefPrice+"\n";

// Check in-wallet bLuna balance
const bLunaQuery = await lcd.wasm.contractQuery(bluna, {
  balance: {
    address: wallet.key.accAddress,
  }, 
});
const blunaBal = bLunaQuery['balance'].toString();
// Check in-wallet Luna balance
const lunaQuery = await lcd.bank.balance(wallet.key.accAddress); // get balances of native tokens
let lunaBalance =""
if (lunaQuery[0].get('uluna')!==undefined){
  lunaBalance = lunaQuery[0].get('uluna').amount.toString();
} else {
  lunaBalance = "0";
}

console.log("Luna Balance: "+lunaBalance+"; bLuna Balance: "+blunaBal+"\n");

if (beliefPrice < toBlunaPrice){
  if (lunaBalance > blunaBal) {
    const terraSwap = new MsgExecuteContract(
      wallet.key.accAddress,
      pool, 
      {
        swap: {
          max_spread: "0.025",
          offer_asset: {
            info: {
              native_token: {
                denom: "uluna",
              },
            },
            amount: lunaBalance
          },
          belief_price: beliefPrice,
        },
      },
      new Coins({ uluna: lunaBalance}),
    ); 
    const tx = await wallet.createAndSignTx({ msgs: [terraSwap] });
    const result = await lcd.tx.broadcast(tx);
    log = datetime+ "Swapped Luna to bLuna @"+beliefPrice+"; "+" Tx hash: "+result.txhash+"; trans fee: $"+result.gas_wanted*0.15*1.66667/1000000+"\n";  
  }
}
if(beliefPrice > toLunaPrice){
  if(blunaBal>lunaBalance){
      const swapMsg = {
        swap: {
            max_spread: "0.025"
        },
      };
      const base64SwapMsg = Buffer.from(JSON.stringify(swapMsg)).toString("base64");
      
      const swapHandleMessage = {
        send: {
          amount: blunaBal,
          contract: pool,
          msg: base64SwapMsg,
        },
      };
      const executeSwap = new MsgExecuteContract(
        wallet.key.accAddress,
        bluna,
        swapHandleMessage
      );
      
      const transaction = await wallet.createAndSignTx({
        msgs: [executeSwap],
      });
      const result = await lcd.tx.broadcast(transaction);
      log = datetime+ "Swapped bLuna to Luna @"+beliefPrice+"; "+" Tx hash: "+result.txhash+"; trans fee: $"+result.gas_wanted*0.15*1.66667/1000000+"\n";
      
  }
}

fs.appendFile('bLuna.txt', log, function (err) {
  if (err) throw err;
  console.log('Saved!');
});