ChatBridge
==========

ChatBridge is a self-hosted Discord bridge bot that synchronizes messages between multiple Discord servers and channels. It is designed for communities that want to link conversations across different servers in real time, with moderation and user management features.

Features
--------
- Real-time message bridging between linked Discord channels
- User ban/unban and admin management
- Channel linking/unlinking via commands
- SQLite database for persistent server and user data
- Command-based configuration and management

Requirements
------------
- Node.js v18 or higher
- Discord bot token (see [Discord Developer Portal](https://discord.com/developers/applications))

Installation
------------
1. Clone this repository:
	```sh
	git clone https://github.com/Zach11111/chatBridge.git
	cd chatBridge
	```
2. Install dependencies:
	```sh
	npm install
	```

3. Copy the example environment file and fill in your credentials:
	```sh
	cp .env.example .env
	# Edit .env with your preferred editor
	```
	- `TOKEN`: Your Discord bot token
	- `PREFIX`: Command prefix (e.g., `!` or `b!`)
	- `USERID`: Your Discord user ID (for owner/admin commands)

4. Start the bot:
	```sh
	node src/index.js
	```

Usage
-----
Once the bot is running and invited to your server(s):

### Linking a Channel
1. In a server where you have administrator rights, run:
	```
	<PREFIX>link <#channel>
	```
	This will create a webhook and link the channel to the bridge. Repeat in other servers/channels to bridge them together.

### Unlinking a Channel
	```
	<PREFIX>unlink
	```
	This will remove the channel from the bridge.

### User Management
- **Ban a user:**
  - As an admin, run:
	 ```
	 <PREFIX>ban <@user>
	 ```
	 Or reply to a user's message with:
	 ```
	 <PREFIX>ban
	 ```
- **Unban a user:**
  - As an admin, run:
	 ```
	 <PREFIX>unban <@user>
	 ```
	 Or reply to a user's message with:
	 ```
	 <PREFIX>unban
	 ```
- **Grant admin rights:**
  - As the bot owner, run:
	 ```
	 <PREFIX>admin <@user>
	 ```

Configuration
-------------
All configuration is handled via the `.env` file and Discord commands. The bot uses a local SQLite database (`data/servers.sqlite`) for persistent storage.

Security & Permissions
---------------------
- The bot requires the following Discord permissions:
  - Manage Webhooks
  - Read Messages/View Channels
  - Send Messages
  - Attach Files
  - Read Message History
- Only users with administrator rights can link/unlink channels.
- Only the owner (specified by `USERID`) can grant admin rights.

License
-------
See [LICENSE](LICENSE) for details. This project is for non-commercial use only.

Support
-------
For questions or issues, please open an issue on the GitHub repository.
