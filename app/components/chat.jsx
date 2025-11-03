"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";
import {
  Copy,
  Send,
  MessageCircle,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import "./chat.css";

const CopyButton = ({ content }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="copy-button text-black/60 hover:text-black text-xs flex items-center"
      title="Copy to clipboard"
    >
      {copied ? (
        <div className="copy-success rounded-md px-3 py-1.5 text-xs flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Copied!</span>
        </div>
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
};

const TypingIndicator = () => (
  <div className="flex items-start">
    <div className="typing-indicator mr-auto">
      <div className="flex items-center gap-1 text-black/80">
        <Bot className="w-4 h-4 mr-2" />
        <span className="text-sm">AI is typing</span>
        <div className="flex gap-1 ml-2">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  </div>
);

const MessageHeader = ({ role, timestamp }) => (
  <div className="flex items-center gap-2 mb-2 opacity-70">
    {role === "user" ? (
      <User className="w-4 h-4" />
    ) : (
      <Bot className="w-4 h-4" />
    )}
    <span className="text-xs font-medium">
      {role === "user" ? "You" : "AI Assistant"}
    </span>
    <span className="text-xs opacity-60">{timestamp}</span>
  </div>
);

const ChatComponent = () => {
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState("connected");
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendChatMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: message.trim(),
      timestamp: formatTimestamp(),
      id: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setConnectionStatus("connecting");

    try {
      const res = await fetch(
        `http://localhost:8001/api/v1/chat?message=${encodeURIComponent(
          message.trim()
        )}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setConnectionStatus("connected");

      const assistantMessage = {
        role: "assistant",
        content: data?.message || "No response received.",
        expanded: false,
        timestamp: formatTimestamp(),
        id: Date.now() + 1,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setConnectionStatus("error");

      const errorMessage = {
        role: "assistant",
        content:
          "⚠️ I'm having trouble connecting right now. Please check your connection and try again.",
        error: true,
        timestamp: formatTimestamp(),
        id: Date.now() + 1,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, expanded: !msg.expanded } : msg
      )
    );
  };

  const shouldShowExpand = (content) => {
    if (!content) return false;
    const lines = content.split("\n");
    return lines.length > 6 || content.length > 600;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600";
      case "connecting":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <span className="text-green-600 font-semibold hide-on-mobile">
            Connected
          </span>
        );
      case "connecting":
        return (
          <span className="text-yellow-600 italic hidden hide-on-mobile">
            Connecting...
          </span>
        );
      case "error":
        return (
          <span className="text-red-600 font-bold hidden hide-on-mobile">
            Connection Error
          </span>
        );
      default:
        return (
          <span className="text-gray-500 hidden hide-on-mobile">Offline</span>
        );
    }
  };

  return (
    <div className="chat-container flex items-center justify-center p-4">
      <div className="chat-window w-full max-w-4xl h-[90vh] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="chat-header px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/10">
              <MessageCircle className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-black font-semibold text-lg">
                Your Chat Assistant
              </h1>
              <p className="text-black/60 text-sm">Ask me !</p>
            </div>
          </div>

          <div className="status-indicator">
            <div className="flex items-center gap-2">
              {connectionStatus === "connecting" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : connectionStatus === "error" ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              )}
              <span className={`text-xs ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scroll">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 rounded-full bg-black/10 mb-4">
                <Bot className="w-8 h-8 text-black/60" />
              </div>
              <h3 className="text-black/80 text-lg font-medium mb-2">
                Welcome to EmmVision
              </h3>
              <p className="text-black/60 text-sm max-w-md">
                Ask me anything about your company documents, manuals, or
                knowledge base. I'm here to help with quick answers, detailed
                explanations, and smart insights—powered by your internal data.
                Just type your question below to get started.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isAssistant = msg.role === "assistant";
            const isUser = msg.role === "user";
            const showExpand =
              isAssistant && msg.content && shouldShowExpand(msg.content);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`relative max-w-2xl p-5 rounded-2xl text-sm text-black ${
                    isUser
                      ? "message-user ml-auto rounded-br-md"
                      : `message-assistant mr-auto rounded-bl-md ${
                          msg.error ? "border-red-400/30" : ""
                        }`
                  }`}
                >
                  <MessageHeader role={msg.role} timestamp={msg.timestamp} />

                  <div
                    className={`message-content blackspace-pre-wrap overflow-hidden transition-all duration-300 ease-in-out ${
                      showExpand && !msg.expanded ? "line-clamp-6" : ""
                    }`}
                    style={{
                      maxHeight: showExpand
                        ? msg.expanded
                          ? "none"
                          : "9em"
                        : "none",
                    }}
                  >
                    {msg.content}
                  </div>

                  {showExpand && (
                    <button
                      onClick={() => toggleExpand(msg.id)}
                      className="expand-button mt-3 text-xs text-blue-300 hover:text-blue-200 font-medium"
                    >
                      {msg.expanded ? "Show less ▲" : "Show more ▼"}
                    </button>
                  )}

                  <div className="flex justify-end mt-3">
                    <CopyButton content={msg.content} />
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-container p-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
                className="chat-input text-black placeholder:text-black/60 border-0 py-3 px-4 text-sm resize-none"
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-xs text-black/40">
                  {message.length}/2000 characters
                </span>
                <span className="text-xs text-black/40">
                  Enter to send • Shift+Enter for new line
                </span>
              </div>
            </div>

            <Button
              onClick={handleSendChatMessage}
              disabled={!message.trim() || isLoading}
              className="send-button px-6 py-3 text-black font-medium"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
