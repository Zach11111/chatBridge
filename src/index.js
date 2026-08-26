import "./client.js";
import "./textcommands.js";
import "./bridge.js";
import { initServers } from "./servers.js";
import { initUsers } from "./users.js";
import { loadMessageLog } from "./messageLog.js";

initUsers();
initServers();
loadMessageLog()