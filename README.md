# Nyth Arise 🕊️
> **A Premium, Modular WhatsApp Multi-Device Automation Engine.**

![Nyth Arise Banner](assets/banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.4.0-blue.svg)](#)
[![Powered by Baileys](https://img.shields.io/badge/Powered%20by-Baileys-bone.svg)](https://github.com/adiwajshing/Baileys)

**Nyth Arise** is a sophisticated WhatsApp bot built on the **Baileys** library, featuring a highly modular plugin system. Designed for the **The Next Geeg Think** organization, it provides elegant solutions for group management, academic utilities, and interactive user experiences.

---

## ✨ Key Features

<details open>
<summary><b>📚 Academic Utilities (Kelas)</b></summary>

- **`mkgroup`**: Sophisticated student grouping algorithm.
  - Divide by number of people per group (`org`).
  - Divide by total number of groups (`kel`).
  - Integration with Course IDs from `dbjadwal.json`.
  - Balanced randomization with smart bias (e.g., probability matching).
- **History & Recall**: Save generated groups with unique IDs and recall them instantly.
</details>

<details>
<summary><b>🛠️ Modular Plugin System</b></summary>

- Easy to extend: just add a `.js` file to `plugins/`.
- Hot reloading: modifications are applied instantly without restarting the bot.
- Interactive buttons and list messages support.
</details>

<details>
<summary><b>⚡ High Performance</b></summary>

- Efficient memory management.
- Detailed performance tracing (WA Roundtrip, CPU Load, RAM Usage).
- Low latency response handling.
</details>

---

## 🚀 Getting Started

### Prerequisites
- Node.js v22 or higher
- FFmpeg installed in system path

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thenextgeegthink/nyth-arise-md.git
   cd nyth-arise-md
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure**
   Update `config.js` with your settings (Owner number, bot name, etc.).

4. **Run**
   ```bash
   npm start
   ```

---

## 📊 Commands

| Command | Category | Description |
| :--- | :--- | :--- |
| `.mkg` | Kelas | Create study groups based on student database |
| `.ping` | Main | Check bot response speed and system status |
| `.unreg` | User | Unregister user account from database |

---

## 🛡️ License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

<p align="center">
  Built with ❤️ by <b>The Next Geeg Think</b>
</p>
