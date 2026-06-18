# 💬 Real-Time Anonymous Chat Application

A lightweight, modern, full-stack anonymous chat application that allows users to instantly connect in private rooms. Built with real-time responsiveness and mobile compatibility in mind.

## ✨ Features
* **Multi-Room Support:** Join distinct rooms securely via URL route parameters.
* **Persistent Roster Sidebar:** A slide-out panel showing exactly who is in your room (with a responsive, touch-friendly mobile drawer layout).
* **Live Metrics:** Up-to-the-second counters showing total active users online.
* **Smart Typing Indicators:** Debounced "X is typing..." animations that throttle network events to minimize WebSocket bandwidth strain.
* **Seamless Disconnect Handling:** Automatically flushes inactive user data and updates remaining chatters when a window is closed.

## 🛠️ Tech Stack
* **Frontend:** React (TypeScript), Vite, Tailwind CSS, Socket.io-Client
* **Backend:** Node.js, Express, Socket.io