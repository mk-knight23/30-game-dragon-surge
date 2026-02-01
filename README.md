# 30-game-dragon-surge

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-FF4D00?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Style-Neon_Jurassic-00F3FF?style=for-the-badge" alt="Style">
  <img src="https://img.shields.io/badge/Stack-Vue_3_Vite-4FC08D?style=for-the-badge&logo=vue.js" alt="Stack">
</p>

## 🌋 The Primeval Revolution

**DRAGON_SURGE** is a high-fidelity, hardware-accelerated 2D runner that merges primeval survival with a neon-synthwave aesthetic. Built on a custom parallax engine, it delivers 60FPS of pure prehistoric adrenaline.

### ⚡ Evolution Protocol (v2.0)
- **Obsidian Core**: New deep-void design system with volcanic magma highlights.
- **Neon Surge**: Hardware-accelerated motion trails and particle effects.
- **Jurassic HUD**: Re-engineered tactical overlay for real-time telemetry.
- **Atmospheric Depth**: Multi-layer parallax with glowing lava flows and ash particles.
active physics, and a "Jurassic Surge" design system.
</p>

<p align="center">
  <a href="https://mk-knight23.github.io/33-Dragon-Game-JS/">🚀 Live Demo</a>
</p>

![Game Screenshot](https://via.placeholder.com/800x450/0f172a/39ff14?text=Dragon+Surge)

## 🎮 Overview

Dragon Surge replaces the legacy React-based runner with a modern Vue 3 architecture. It prioritizes hardware-accelerated rendering and frame-independent logic for a smooth 60fps experience on any device.

## ✨ Features

### Before → After

| Feature | Legacy | Upgraded (v1.0) |
|---------|--------|-----------------|
| **Framework** | Basic setup | Vue 3 + Vite |
| **State** | Simple store | 3 Pinia stores |
| **Theming** | Single theme | Dark/Light/System |
| **Accessibility** | None | Full ARIA + Keyboard |
| **Settings** | None | Full settings panel |
| **Persistence** | High score only | Settings + Stats |
| **Audio** | None | Sound effects |
| **Game Modes** | 1 | 3 difficulty levels |
| **Statistics** | None | Comprehensive stats |
| **Physics** | Single jump | Double jump |
| **Visual FX** | None | Trail + Popups + Warnings |
| **Linting** | None | ESLint + Prettier |

### New Features

- **Double Jump**: Press jump again while airborne for a second boost
- **Score Popups**: Visual feedback when reaching score milestones
- **Obstacle Warnings**: Pulsing triangle indicator before obstacles appear
- **Motion Trail**: Dragon leaves a fading trail during jumps

## 🛠️ Tech Stack

- **Framework**: Vue 3.5 (Composition API, Script Setup)
- **Build Tool**: Vite 6
- **State Management**: Pinia
- **Styling**: Tailwind CSS (Jurassic palette)
- **TypeScript**: Full type safety
- **Icons**: Lucide Vue Next
- **Audio**: Howler.js

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/mk-knight23/33-Dragon-Game-JS.git
cd 33-Dragon-Game-JS

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 How to Play

1. **Start Game**: Press `Space` or click "Execute Run"
2. **Jump**: Press `↑` or `W` key to jump over obstacles
3. **Goal**: Run as far as possible to set a new record
4. **Obstacles**: Avoid the red volcanic rocks
5. **Lives**: You have 3 lives - don't crash!

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start Game |
| `Esc` | Pause Game |
| `↑` / `W` | Jump |
| `M` | Toggle Sound |
| `T` | Toggle Theme |

## 📁 Project Structure

```
33-Dragon-Game-JS/
├── src/
│   ├── assets/           # Static assets
│   ├── components/
│   │   └── ui/           # UI components
│   │       └── SettingsPanel.vue
│   ├── composables/      # Vue composables
│   │   ├── useAudio.ts
│   │   └── useKeyboardControls.ts
│   ├── stores/           # Pinia stores
│   │   ├── game.ts
│   │   ├── settings.ts
│   │   └── stats.ts
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.vue           # Main app component
│   ├── main.ts           # App entry point
│   └── style.css         # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🏗️ Architecture

### State Management

The app uses three Pinia stores:

1. **Game Store**: Manages game state, player physics, scoring, and game logic
2. **Settings Store**: Handles user preferences (sound, theme, difficulty)
3. **Stats Store**: Tracks player statistics and achievements

### Game Engine

The game uses a custom engine with:
- Canvas-based rendering with hardware acceleration
- Reactive gravity and velocity clamping
- Multi-layer parallax background
- Dynamic difficulty scaling

### Component Structure

- **App.vue**: Main game container with canvas and UI
- **SettingsPanel.vue**: Settings and statistics modal

## 🎨 Theming

The app supports three theme modes:

- **Dark**: Default Jurassic dark theme
- **Light**: Light theme for bright environments
- **System**: Follows system preference

Toggle themes with the theme button or `T` key.

## ♿ Accessibility

This project is built with accessibility in mind:

- Full ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Reduced motion support
- High contrast mode support

## 📱 Responsive Design

The game is fully responsive:

- **Desktop**: Full keyboard and mouse support
- **Tablet**: Touch controls and responsive UI
- **Mobile**: Touch-optimized controls

## 🔧 Configuration

### Game Settings

| Setting | Options | Default |
|---------|---------|---------|
| Difficulty | Easy / Normal / Hard | Normal |
| Sound | On / Off | On |
| Particles | On / Off | On |
| HUD | On / Off | On |

### Build Configuration

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## 📦 Deployment

### GitHub Pages

The project is configured for GitHub Pages deployment:

1. Build: `npm run build`
2. Output: `dist/` folder
3. Deploy to `gh-pages` branch

### Vercel

Deploy to Vercel with zero configuration:

```bash
npm i -g vercel
vercel
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the [Wiki](https://github.com/mk-knight23/33-Dragon-Game-JS/wiki)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/mk-knight23">mk-knight23</a>
</p>

---

### Live Demo
- GitHub Pages: <https://mk-knight23.github.io/33-Dragon-Game-JS/>
- Vercel: [Deploy your own](https://vercel.com/new)
- Netlify: [Deploy your own](https://app.netlify.com/start)

---

## 📝 Design Notes (V2)

### Intentional Quirk: The Coin Risk-Reward
I added collectible coins (V2) that appear above obstacles. They're worth 50 points but require jumping toward danger. The quirk: they're placed slightly randomly, sometimes in awkward positions. This creates micro-decisions—"is 50 points worth the risk?" The imperfection of placement makes each coin feel like a discovered opportunity, not a scripted reward.

### Tradeoff: No Invincibility Power-ups
Coins give score, not abilities. I deliberately didn't add shields or invincibility stars. The tradeoff: score chasing vs. survival. Players must choose between safe play (longer runs, lower score) and risky jumps (coins but danger). This maintains the purity of "one hit = death" while adding strategic depth.

### What I Chose NOT to Build
No combo system or score multiplier. Coins are flat 50 points. Multipliers would encourage grinding for perfect runs. Flat rewards mean every coin matters equally whether you're on level 1 or level 10. Consistency over escalation.

## 🎉 Additional Features (V3)

Two focused additions that add depth without complexity:

### Shield Power-up
**Why added**: The original design deliberately avoided invincibility. But for newer players, the one-hit death feels punishing.

**What changed**: Added a rare shield power-up (blue orb) that absorbs one hit. Spawns every ~1000 points, so it's not common. It creates a temporary "safety" feeling that encourages riskier play—exactly the kind of psychological engagement runners need.

### Near-Miss Points
**Why added**: Skilled players who narrowly avoid obstacles deserved more recognition than just staying alive.

**What changed**: Passing within 10 pixels of an obstacle now awards "Close Call!" text with +5 bonus points. It's subtle but rewards precision. The game already tracks your position, so this was purely a display/score addition.

### Intentionally Rejected: Double Jump Upgrade
I considered making double jump an unlockable or power-up. Rejected because double jump is core to the game's feel—it should always be available. Making it earnable would make early runs feel unfair. The game is hard enough without gimping the player's primary movement option.
