import { LCDClient, Coin, MnemonicKey, MsgSend } from '@terra-money/terra.js';

// connect to testnet
const terra = new LCDClient({
  URL: 'https://bombay-lcd.terra.dev',
  chainID: 'bombay-12',
});
/*
// connect to mainnet
const terra = new LCDClient({
  URL: 'https://lcd.terra.dev',
  chainID: 'columbus-5',
});
*/
console.log("...\nConnected to Terra\n...");

//get the current exchange rates for UST vs Luna
const token1 = new Coin('uusd', '100000');
terra.market.swapRate(token1, 'uluna').then(d => {
  console.log(`Exchange rate (native denom): ${token1.toString()} is currently worth ${d.toString()}\n...`);
});

//get the current exchange rates for Luna vs UST
const token2 = new Coin('uusd', '100000');
terra.market.swapRate(token2, 'uluna').then(c => {
  //To get the dollar value, divide by 100000 before converting to string
  console.log(`Exchange rate (converted): ${token2.div(100000).toString()} is currently worth ${c.div(100000).toString()}\n...`);
});

// creating a new terra wallet.
const mk = new MnemonicKey({
  mnemonic:
    'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius',
});
const wallet = terra.wallet(mk);
console.log('Wallet created. Address: '+ await wallet.key.accAddress+'\n...');


// transfer money (10 luna, 1.23 krw and 1.3 usd to) from the new wallet to another address 
const send = new MsgSend(
  wallet.key.accAddress,
  'terra17lmam6zguazs5q5u6z5mmx76uj63gldnse2pdp',
  { uluna: 1000000, ukrw: 1230201, uusd: 1312029 }
);
wallet
  .createAndSignTx({
    msgs: [send],
    memo: 'test YFD transaction',
  })
  .then(tx => terra.tx.broadcast(tx))
  .then(result => {
    console.log(`Money transfered - TX hash: ${result.txhash}`+'\n...');
  });


console.log('Account balance: '+terra.bank.balances(wallet.key.accAddress)+'\n');