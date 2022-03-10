export const hack_net = {
  // Controls how far to upgrade hacknets. Can be a number of seconds, or an expression of minutes/hours (e.g. '123m', '4h')
  max_payoff_time: '12h',
  // Set to true to run continuously, otherwise, it runs once
  continuous: true,
  // Rate at which the program purchases upgrades when running continuously
  interval: 200,
  // The maximum amount of money to spend on upgrades
  max_spend: Number.MAX_VALUE,
  // Set to true to toast purchases
  toast: false,
};
