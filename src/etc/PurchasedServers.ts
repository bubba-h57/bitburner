export const purchased_servers = {
  // hardcoded max servers as of Bitburner v1.3
  max_count: 25,
  // String to Prepend to purchased servers hostname, followed by a number
  name_prefix: 'purchased',
  // Minimum RAM to buy, in Gigabytes
  min_ram: 32000,
  // Target RAM for server is "Home" RAM, divided by SVR_RAM_RATIO, must = power of 2
  home_ram_ratio: 1,
  hack_script: '/bin/hack/hackIt.js',
  ram: 1048576,
};
