//Basic interaction with Anchor

import { LCDClient, Wallet, MnemonicKey, Fee} from '@terra-money/terra.js';
import {fabricateMarketRedeemStable, fabricateMarketDepositStableCoin} from '@anchor-protocol/anchor.js';
import {AddressProviderFromJson} from "@anchor-protocol/anchor.js"; 

//Connect to testnet / mainnet
const anchor = new LCDClient({ URL: 'https://bombay-lcd.terra.dev', chainID:'bombay-12' });
//const anchor = new LCDClient({ URL: 'https://lcd.terra.dev', chainID: 'columbus-5',});

//create a new test wallet. swap the mneonic words around to create a unique wallet for testing
const owner = new MnemonicKey({ mnemonic: 'notice oak limit worry wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius'});
const wallet = new Wallet(anchor, owner);
console.log('Anchor test wallet address: '+ wallet.key.accAddress);

//Set up anchor contract addresses (testnet Bombay-12)
const addressMap = {
  bLunaHub: 'terra1fflas6wv4snv8lsda9knvq2w0cyt493r8puh2e',
  bLunaToken: 'terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x',
  bLunaReward: 'terra1ac24j6pdxh53czqyrkr6ygphdeftg7u3958tl2',
  bLunaAirdrop: 'terra1334h20c9ewxguw9p9vdxzmr8994qj4qu77ux6q',
  bLunaValidatorsRegistry: 'terra10wt548y4y3xeqfrqsgqlqh424lll8fqxp6dyed',
  bEthReward: 'terra1ja3snkedk4t0zp7z3ljd064hcln8dsv5x004na',
  bEthToken: 'terra19mkj9nec6e3y5754tlnuz4vem7lzh4n0lc2s3l',
  mmInterestModel: 'terra1m25aqupscdw2kw4tnq5ql6hexgr34mr76azh5x',
  mmOracle: 'terra1p4gg3p2ue6qy2qfuxtrmgv2ec3f4jmgqtazum8',
  mmMarket: 'terra15dwd5mj8v59wpj0wvt233mf5efdff808c5tkal',
  mmOverseer: 'terra1qljxd0y3j3gk97025qvl3lgq8ygup4gsksvaxv',
  mmCustody: 'terra1ltnkx0mv7lf2rca9f8w740ashu93ujughy4s7p',
  mmCustodyBEth: 'terra1j6fey5tl70k9fvrv7mea7ahfr8u2yv7l23w5e6',
  mmLiquidation: 'terra16vc4v9hhntswzkuunqhncs9yy30mqql3gxlqfe',
  mmLiquidationQueue: 'terra18j0wd0f62afcugw2rx5y8e6j5qjxd7d6qsc87r',
  mmDistributionModel: 'terra1u64cezah94sq3ye8y0ung28x3pxc37tv8fth7h',
  aTerra: 'terra1ajt556dpzvjwl0kl5tzku3fc3p3knkg9mkv8jl',
  bLunaLunaPair: 'terra1esle9h9cjeavul53dqqws047fpwdhj6tynj5u4',
  bLunaLunaLPToken: 'terra14e7z2ll6eweq6cxe6qkvl28hatapmw2uflxcyt',
  ancUstPair: 'terra13r3vngakfw457dwhw9ef36mc8w6agggefe70d9',
  ancUstLPToken: 'terra1agu2qllktlmf0jdkuhcheqtchnkppzrl4759y6',
  gov: 'terra16ckeuu7c6ggu52a8se005mg5c0kd2kmuun63cu',
  distributor: 'terra1z7nxemcnm8kp7fs33cs7ge4wfuld307v80gypj',
  collector: 'terra1hlctcrrhcl2azxzcsns467le876cfuzam6jty4',
  community: 'terra17g577z0pqt6tejhceh06y3lyeudfs3v90mzduy',
  staking: 'terra1q68gyyxqnlh58jacz5r6rxfmxqpmmjv583fzqq',
  ANC: 'terra1747mad58h0w4y589y3sk84r5efqdev9q4r02pc',
  airdrop: 'terra1u5ywhlve3wugzqslqvm8ks2j0nsvrqjx0mgxpk'
};
/* Set up anchor contract addresses (testnet Columbus-5)
const addressMap = {
  bLunaHub: 'terra1mtwph2juhj0rvjz7dy92gvl6xvukaxu8rfv8ts',
  bLunaToken: 'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp',
  bLunaReward: 'terra17yap3mhph35pcwvhza38c2lkj7gzywzy05h7l0',
  bLunaAirdrop: 'terra199t7hg7w5vymehhg834r6799pju2q3a0ya7ae9',
  bLunaValidatorsRegistry: '',
  bEthReward: 'terra1939tzfn4hn960ychpcsjshu8jds3zdwlp8jed9',
  bEthToken: 'terra1dzhzukyezv0etz22ud940z7adyv7xgcjkahuun',
  mmInterestModel: 'terra1kq8zzq5hufas9t0kjsjc62t2kucfnx8txf547n',
  mmOracle: 'terra1cgg6yef7qcdm070qftghfulaxmllgmvk77nc7t',
  mmMarket: 'terra1sepfj7s0aeg5967uxnfk4thzlerrsktkpelm5s',
  mmOverseer: 'terra1tmnqgvg567ypvsvk6rwsga3srp7e3lg6u0elp8',
  mmCustody: 'terra1ptjp2vfjrwh0j0faj9r6katm640kgjxnwwq9kn',
  mmCustodyBEth: 'terra10cxuzggyvvv44magvrh3thpdnk9cmlgk93gmx2',
  mmLiquidation: 'terra1w9ky73v4g7v98zzdqpqgf3kjmusnx4d4mvnac6',
  mmLiquidationQueue: 'terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u',
  mmDistributionModel: 'terra14mufqpr5mevdfn92p4jchpkxp7xr46uyknqjwq',
  aTerra: 'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu',
  bLunaLunaPair: 'terra1j66jatn3k50hjtg2xemnjm8s7y8dws9xqa5y8w',
  bLunaLunaLPToken: 'terra1htw7hm40ch0hacm8qpgd24sus4h0tq3hsseatl',
  ancUstPair: 'terra1qr2k6yjjd5p2kaewqvg93ag74k6gyjr7re37fs',
  ancUstLPToken: 'terra1wmaty65yt7mjw6fjfymkd9zsm6atsq82d9arcd',
  gov: 'terra1f32xyep306hhcxxxf7mlyh0ucggc00rm2s9da5',
  distributor: 'terra1mxf7d5updqxfgvchd7lv6575ehhm8qfdttuqzz',
  collector: 'terra14ku9pgw5ld90dexlyju02u4rn6frheexr5f96h',
  community: 'terra12wk8dey0kffwp27l5ucfumczlsc9aned8rqueg',
  staking: 'terra1h3mf22jm68ddueryuv2yxwfmqxxadvjceuaqz6',
  ANC: 'terra14z56l0fp2lsf86zy3hty2z47ezkhnthtr9yq76',
  airdrop: 'terra146ahqn6d3qgdvmj8cj96hh03dzmeedhsf0kxqm',
  team_vesting: 'terra1pm54pmw3ej0vfwn3gtn6cdmaqxt0x37e9jt0za',
  investor_vesting: 'terra10evq9zxk2m86n3n3xnpw28jpqwp628c6dzuq42',
}; */


//Generate JSON of all the contract addresses
const addressProvider = new AddressProviderFromJson(addressMap);

//Message Constructor to deposit UST into Anchor Earn
const depositMsg = fabricateMarketDepositStableCoin({
  address: wallet.key.accAddress,
  market: 'uusd',
  amount: '100',
})(addressProvider);

//Message Constructor to redeem UST from Anchor Earn (by BURNING aUST)
const redeemMsg = fabricateMarketRedeemStable({
  address: wallet.key.accAddress,
  market: 'uusd', 
  amount: '80', // VERY IMPORTANT: this is denominated in aUST not UST
})(addressProvider);

//Function to deposit $100 UST into Anchor earn 
async function depositStable() {
  const tx = await wallet.createAndSignTx({
      msgs: depositMsg,
      fee: new Fee(2_000_000, { uluna: 2_000_000 })
  });
  return await anchor.tx.broadcast(tx);
}

//Function to redeem $80 aUST from Anchor earn  
async function withdrawStable() {
  const tx = await wallet.createAndSignTx({
      msgs: redeemMsg,
      fee: new Fee(2_000_000, { uluna: 2_000_000 })
  });
  return await anchor.tx.broadcast(tx);
}

//Calling the deposit function
await depositStable()
  .then((result) => {
    console.log(result);
  })
  .catch(console.error);

//Calling the withdrawal function
await withdrawStable()
  .then((result) => {
    console.log(result);
  })
  .catch(console.error);
