import fs from "fs";
import path from "path";

import Logger from "garylog";

import { client } from "./client.js";

const MAX_MESSAGE_LOG_ENTRIES = 100;
const dataDir = "./data";

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const MESSAGE_LOG_PATH = path.join(dataDir, "message-log.json");

export let messageLog = [];

function loadMessageLog() {
  if (!fs.existsSync(MESSAGE_LOG_PATH)) {
    messageLog = [];
    return;
  }

  try {
    const raw = fs.readFileSync(MESSAGE_LOG_PATH, "utf8");
    const parsed = JSON.parse(raw);
    messageLog = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    Logger.warn("Failed to load message log, resetting it.", err);
    messageLog = [];
  }
}

function persistMessageLog() {
  try {
    fs.writeFileSync(MESSAGE_LOG_PATH, JSON.stringify(messageLog, null, 2));
  } catch (err) {
    Logger.error("Failed to persist message log.", err);
  }
}

export function getMessageLog() {
  loadMessageLog();
  return [...messageLog];
}

export function recordMessageBridge(originalId, sourceChannelId, webhookChannelId, webhookMessageId) {
  loadMessageLog();

  const existingEntry = messageLog.find((entry) => entry.original_id === originalId && entry.source_channel_id === sourceChannelId);

  if (existingEntry) {
    existingEntry.webhook_messages[webhookChannelId] = webhookMessageId;
  } else {
    messageLog.push({
      original_id: originalId,
      source_channel_id: sourceChannelId,
      webhook_messages: {
        [webhookChannelId]: webhookMessageId,
      },
    });
  }

  if (messageLog.length > MAX_MESSAGE_LOG_ENTRIES) {
    messageLog = messageLog.slice(-MAX_MESSAGE_LOG_ENTRIES);
  }

  persistMessageLog();
}
export async function deleteMessage(messageId, channelId) {
  loadMessageLog();

  const entryIndex = messageLog.findIndex((entry) => {
    const isOriginal = entry.original_id === messageId && entry.source_channel_id === channelId;
    const isWebhook = Object.values(entry.webhook_messages).includes(messageId);
    return isOriginal || isWebhook;
  });

  if (entryIndex === -1) {
    Logger.warn(`Message entry for ID ${messageId} not found in log.`);
    return false;
  }

  const entry = messageLog[entryIndex];

  try {
    const sourceChannel = client.channels.cache.get(entry.source_channel_id);
    if (sourceChannel) {
      const originalMsg = await sourceChannel.messages.fetch(entry.original_id).catch(() => null);
      if (originalMsg) await originalMsg.delete();
    }
  } catch (err) {
    Logger.error(`Failed to delete original message ${entry.original_id}:`, err);
  }

  for (const webhookChannelId in entry.webhook_messages) {
    const webhookMessageId = entry.webhook_messages[webhookChannelId];

    try {
      const webhookChannel = client.channels.cache.get(webhookChannelId);
      if (webhookChannel) {
        const webhookMsg = await webhookChannel.messages.fetch(webhookMessageId).catch(() => null);
        if (webhookMsg) await webhookMsg.delete();
      }
    } catch (err) {
      Logger.error(`Failed to delete webhook message ${webhookMessageId} in channel ${webhookChannelId}:`, err);
    }
  }

  messageLog.splice(entryIndex, 1);
  persistMessageLog();
  return true;
}

export function getReplicateMessageId(referencedMessageId, targetChannelId) {
  loadMessageLog();

  const directEntry = messageLog.find((entry) => entry.original_id === referencedMessageId);
  if (directEntry && directEntry.webhook_messages[targetChannelId]) {
    return directEntry.webhook_messages[targetChannelId];
  }

  const webhookEntry = messageLog.find((entry) => Object.values(entry.webhook_messages).includes(referencedMessageId));
  if (webhookEntry) {
    if (webhookEntry.source_channel_id === targetChannelId) {
      return webhookEntry.original_id;
    }
    if (webhookEntry.webhook_messages[targetChannelId]) {
      return webhookEntry.webhook_messages[targetChannelId];
    }
  }

  return null;
}
