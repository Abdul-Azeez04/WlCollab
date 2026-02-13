export const validateWallet = (wallet, chain) => {
  const regexes = {
    EVM: /^0x[a-fA-F0-9]{40}$/,
    Solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    Aptos: /^0x[a-fA-F0-9]{64}$/,
    Sui: /^0x[a-fA-F0-9]{64}$/,
    BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  };

  return regexes[chain]?.test(wallet);
};
 
