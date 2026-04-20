'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    PrayerChat?: {
      init: (config: { embedCode: string; apiUrl: string }) => void;
    };
  }
}

export default function PrayerChatWidget() {
  const embedCode = 'prayer-chat-bot-BT7VjiGc5krFjOSHWVFQHcqR';
  const baseUrl = 'https://chatbot-java-spring-ai.onrender.com';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = baseUrl + '/js/chatbot-widget.js';
    script.async = true;

    script.onerror = function () {
      const el = document.getElementById('prayer-chat-chatbot-' + embedCode);
      if (el) {
        el.innerHTML = '<p style="padding:12px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;font-family:sans-serif;font-size:14px;">Chat could not load. Check browser console (F12).</p>';
      }
    };

    script.onload = function () {
      if (window.PrayerChat?.init) {
        window.PrayerChat.init({
          embedCode: embedCode,
          apiUrl: baseUrl + '/api'
        });
      } else {
        const el = document.getElementById('prayer-chat-chatbot-' + embedCode);
        if (el) {
          el.innerHTML = '<p style="padding:12px;background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;font-family:sans-serif;font-size:14px;">Chat failed to start. Open console (F12) for details.</p>';
        }
      }
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div
      id={'prayer-chat-chatbot-' + embedCode}
      data-embed-code={embedCode}
      suppressHydrationWarning={true}
    />
  );
}