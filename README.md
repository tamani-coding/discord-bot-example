# discord bot exaple

This discord bot is based on the [discord tutorial](https://discord.com/developers/docs/getting-started#overview).

This discord bot implements an `/aww` slash command where a random cute animal picture is posted inside a discord channel and users can react to it.

Check the `app.js` file for slash-command handling.

Make a copy of `.env.sample` file and name it `.env`. Replace the placeholders inside with real values. 

Install dependencies with `npm install` and run with `node app.js`. You must make sure this app is publicly reachable for a discord server, e.g using [ngrok](https://ngrok.com/) to create a cloud edge tunnel to your locally running bot app.

