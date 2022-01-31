# Bubba's Bitburner Stuff
As I've been playing, it seems reasonable to create a repo and save my stuff. This is what I'm using. For now, it is a combination of manual interaction and some automation.

# Commands
 - `contractor.js`: There are contracts in this game! Kinda like code golf challenges. Apparently they show up and disapear randomly on servers. this will search the entire network for contracts and then solve them, if it knows how to solve it, it will simply solve it. I schedule it in `cron.js` to run regularly.
 - `cron.js`: This script simply lets me schedule any other script to run every so often.
 - `hack.js`: This is an ... extremely simple ... hack script.
 - `hacker.js`: Run this, and it spins up the `hack.js` on host servers.
 - `karma.js`: Turns out karma is a thing. Who knew? I discovered and it and wanted a way to check what it's level is.
 - `lan.js`: Right now, this just buys twenty five 16tb servers. It needs some work.
 - `pen.js`: I use this for backdooring any server. just `run pen.js hostname` then wait for the backoor to complete running. I'm so looking forward to being able to automate this completely.
 - `spider.js`: It's a spider!
 - `ssh.js`: I was frustrated that without a backdoor I can't connect directly to any server on the network. This solves that issue. Try it out.
 - `sudo.js`: This takes care of rooting servers for me.
 - `trader.js`: An attempt at managing the Stock Market. I grabbed it off Reddit I think.

 # Aliases
 - `alias crawl=home;run spider.js`
 - `alias ssh=home;run ssh.js`
 - `alias pwn=home;run pwn.js`
 - `alias pen=home; run pen.js`
