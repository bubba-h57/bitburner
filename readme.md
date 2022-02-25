# Bubba's Bitburner Stuff
As I've been playing, it seems reasonable to create a repo and save my stuff. This is what I'm using. For now, it is a combination of manual interaction and some automation.

# Installation
1. Checkout the repo.
2. Run `npm install`.
3. Run `npm run build`.
4. run `npm run webserver`.
5. Copy the contents of `bin/repo/init.js` into a file within the game, then run it.
6. Run `run bin/repo/pull.js`

# Project Structure
- `/bin` This is where I stick scripts that I'm actually going to execute.
- `/etc` I stick configuration information in here. Tied tightly to `/lib/Config.ts`
- `/lib` I put library files here for shared code.


 # Aliases
 - `alias init="home; run bin/repo/init.js";` - This will initialize pulling the library into the game.
 - `alias delete="home; run bin/repo/delete.js";` - Delete everything, except the repo scripts, including cached files.
 - `alias pull="home; run bin/repo/pull.js";` - Pulls updates from out of the game.
 - `alias ssh="home; run bin/netw/ssh.js";` - `ssh hostname` so you don't have to connect repeatedly.
 - `alias pwn="home; run bin/netw/sudo.js";` - This will run port attacks and attempt backdooring all servers available.
 - `alias pen="home; run bin/netw/pentest.js";` - This will attempt to backdoor faction specific servers.
 - `alias spider="home; run bin/netw/spider.js";` - I don't recall, but it prints out nice stuff.
 - `alias priceguide="home; run bin/netw/prices.js";` - Get some prices around buying new servers in this Node.
 - `alias hack="home; run bin/hack/hacker.js";` - Spins up a bunch of hack scripts across whatever is availabe to run them.
 - `alias upgrade="home; run bin/srvc/upgrade.js";` - Will run in the background, slowly upgrading *home* and purchasing new servers.
 - `alias workout="home; run bin/srvc/workout.js";` - Two options to pass in `--initial` and `--advanced`. Will train up skills to the configured level.
 - `alias contracts="home; run bin/cntr/contractor.js";` - Finds and solves all available contracts.
 - `alias hacknet="home; run bin/hnet/manager.js";` - Will invest in HACKNET servers for you.
 - `alias test="home; run bin/misc/test.js";` - I just use this for testing.
 - `alias crime="home; run bin/slum/criminal.js";` - Will find and commit the best crimes on loop until you are tired of criminalizing.
 - `alias gang="home; run bin/slum/gang.js";` - Will manage your gang for you. Just start a game, then run this.
 - `alias karma="home; run bin/slum/karma.js";` - Will report your current karma.
 - `alias report="home; run bin/rep/report.js";` - Manages the factions available.
