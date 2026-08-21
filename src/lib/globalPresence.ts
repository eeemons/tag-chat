"use client";

import mqtt, { type MqttClient } from "mqtt";
import type { TypingPayload, PresencePayload } from "@/lib/socket";

type GlobalPresenceListener = {
  onTyping?: (payload: TypingPayload) => void;
  onPresence?: (payload: PresencePayload) => void;
};

let mqttClient: MqttClient | null = null;
const listeners = new Set<GlobalPresenceListener>();

const BROKER_URLS = [
  "wss://broker.emqx.io:8084/mqtt",
  "wss://broker.hivemq.com:8884/mqtt",
];

let currentBrokerIndex = 0;

export function initGlobalPresence(currentUserId?: string) {
  if (typeof window === "undefined") return;
  if (mqttClient && mqttClient.connected) return;

  try {
    const brokerUrl = BROKER_URLS[currentBrokerIndex];
    mqttClient = mqtt.connect(brokerUrl, {
      clientId: `tagchat_${currentUserId || "anon"}_${Math.random().toString(36).substring(2, 9)}`,
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 3000,
    });

    mqttClient.on("connect", () => {
      // Subscribe to all Tag Chat typing and presence channels
      mqttClient?.subscribe("tagchat/v2/typing/#", { qos: 0 });
      mqttClient?.subscribe("tagchat/v2/presence/#", { qos: 0 });
    });

    mqttClient.on("message", (topic, messageBuffer) => {
      try {
        const text = messageBuffer.toString();
        const data = JSON.parse(text);

        if (topic.startsWith("tagchat/v2/typing/") && data) {
          listeners.forEach((l) => {
            try {
              l.onTyping?.(data as TypingPayload);
            } catch {
              // Ignore
            }
          });
        } else if (topic.startsWith("tagchat/v2/presence") && data) {
          listeners.forEach((l) => {
            try {
              l.onPresence?.(data as PresencePayload);
            } catch {
              // Ignore
            }
          });
        }
      } catch {
        // Parse error ignored
      }
    });

    mqttClient.on("error", () => {
      // Try next broker on next reconnection cycle
      currentBrokerIndex = (currentBrokerIndex + 1) % BROKER_URLS.length;
    });
  } catch {
    // Client connection error ignored
  }
}

export function broadcastGlobalTyping(
  conversationId: string,
  userId: string,
  userName: string,
  isTyping: boolean,
) {
  if (!mqttClient || !mqttClient.connected) {
    initGlobalPresence(userId);
  }

  const payload: TypingPayload = { conversationId, userId, userName, isTyping };
  try {
    mqttClient?.publish(
      `tagchat/v2/typing/${conversationId}`,
      JSON.stringify(payload),
      { qos: 0 },
    );
  } catch {
    // Publish error ignored
  }
}

export function broadcastGlobalPresence(userId: string, isOnline: boolean) {
  if (!mqttClient || !mqttClient.connected) {
    initGlobalPresence(userId);
  }

  const payload: PresencePayload = { userId, isOnline };
  try {
    mqttClient?.publish(
      `tagchat/v2/presence/${userId}`,
      JSON.stringify(payload),
      { qos: 0 },
    );
  } catch {
    // Publish error ignored
  }
}

export function subscribeGlobalPresence(listener: GlobalPresenceListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
