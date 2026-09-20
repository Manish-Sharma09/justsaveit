"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { publicConfig } from "@/lib/config";

/**
 * Live sync with the existing Socket.IO backend.
 *
 * The wire protocol is unchanged from the original implementation — `join-room`
 * on connect, `content-update` to publish, `receive-update` to subscribe — so
 * the deployed server keeps working without any change.
 *
 * Realtime is strictly an enhancement: if the URL is unset or the server is
 * unreachable the editor still saves over HTTP, so the app degrades to exactly
 * the behaviour it would have had without a socket at all.
 */
export type RealtimeStatus = "idle" | "connecting" | "live" | "offline";

export function useRealtime({
  dropId,
  enabled,
  onRemoteContent,
}: {
  dropId: string;
  enabled: boolean;
  onRemoteContent: (content: string) => void;
}) {
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const socketRef = useRef<Socket | null>(null);

  // Kept in a ref so reconnect logic never has to re-run when the handler
  // identity changes on re-render.
  const handlerRef = useRef(onRemoteContent);
  useEffect(() => {
    handlerRef.current = onRemoteContent;
  }, [onRemoteContent]);

  useEffect(() => {
    if (!enabled || !dropId || !publicConfig.realtimeUrl) {
      setStatus("idle");
      return;
    }

    setStatus("connecting");

    const socket = io(publicConfig.realtimeUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 4,
      reconnectionDelay: 1000,
      timeout: 8000,
    });
    socketRef.current = socket;

    const join = () => {
      setStatus("live");
      socket.emit("join-room", dropId);
    };

    socket.on("connect", join);
    socket.on("disconnect", () => setStatus("offline"));
    socket.on("connect_error", () => setStatus("offline"));
    socket.on("receive-update", (incoming: string) => {
      if (typeof incoming === "string") handlerRef.current(incoming);
    });

    return () => {
      socket.off("connect", join);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setStatus("idle");
    };
  }, [dropId, enabled]);

  const broadcast = useCallback(
    (content: string) => {
      const socket = socketRef.current;
      if (socket?.connected) socket.emit("content-update", { roomId: dropId, content });
    },
    [dropId]
  );

  return { status, broadcast };
}
