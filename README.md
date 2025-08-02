# FocusFuel 🔥

> AI-powered productivity suite for distraction blocking, content summarization, and digital well-being

FocusFuel is a next-generation digital productivity assistant designed for remote workers, students, content consumers, and creators. It combines AI summarization, habit coaching, real-time focus analytics, and mindful UX design to help users stay sharp without burning out.

## ✨ Features

### 🚫 Smart Distraction Blocker
- **AI-powered detection**: Identifies distracting patterns beyond just URLs (scrolling behavior, tab-switching, time-of-day patterns)
- **Flexible blocking modes**: Soft blocks with motivational messages or hard locks with timers
- **Customizable settings**: Blacklists/whitelists and adjustable distraction sensitivity levels
- **Smart scheduling**: Time-based blocking rules for different days and hours

### 🧠 AI Summarizer & Content Simplifier
- **One-click summaries**: Articles, research papers, emails, or documentation
- **TL;DR mode**: Adjustable summary length (short, medium, long)
- **Visual summary cards**: Perfect for students and UX-focused professionals
- **Save and tag**: Organize summaries for future reference

### 🧘 Digital Well-being & Nudging
- **Real-time nudges**: Gentle reminders when focus drops
- **Smart suggestions**: Breathing exercises, short videos, or music based on mood tracking
- **Wearable integration**: Optional heart rate and activity data for personalized suggestions
- **Mindful breaks**: Guided meditation and relaxation prompts

### 📊 Focus Analytics Dashboard
- **Comprehensive tracking**: Daily, weekly, and monthly productivity breakdowns
- **Flow zone detection**: Identify your most productive time periods
- **Multi-device sync**: Track behavior across all your devices
- **Goal setting**: Set and track productivity goals with streak rewards

### ⏲️ Pomodoro & Task Mode
- **Built-in timer**: Customizable Pomodoro intervals with rewards
- **Task management**: Tag and track progress on specific tasks
- **Calendar integration**: Sync with Google Calendar or Notion for auto-task import
- **Smart notifications**: Break reminders and session completion alerts

### 🎯 Gamified Team/Group Focus (Optional)
- **Privacy-safe leaderboards**: Productivity metrics without compromising privacy
- **XP and badges**: Earn rewards for focus streaks and no-scroll sessions
- **Team challenges**: Perfect for coworking groups, student teams, or accountability partners
- **Social motivation**: Join focus rooms for collaborative productivity sessions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Chrome browser (for extension development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/focusfuel.git
   cd focusfuel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development servers**
   ```bash
   # Start both Electron app and extension development
   npm run dev
   
   # Or start them separately
   npm run dev:electron    # Desktop app
   npm run dev:extension   # Browser extension
   ```

### Building for Production

```bash
# Build both desktop app and extension
npm run build

# Build desktop app only
npm run build:electron

# Build extension only
npm run build:extension
```

## 📱 Platforms

### Desktop App
- **Windows**: Built with Electron for native performance
- **macOS**: Full integration with system notifications and menu bar
- **Linux**: Cross-platform compatibility

### Browser Extension
- **Chrome**: Full feature set with Manifest V3
- **Edge**: Compatible with Chromium-based browsers
- **Firefox**: Limited functionality (in development)

### Mobile Companion
- **iOS**: Native app for reminders and focus tracking
- **Android**: Sync with desktop and extension data

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern UI with hooks and context
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling with custom design system
- **Electron**: Cross-platform desktop app framework

### Backend & Data
- **Node.js**: Server-side logic and API
- **Supabase**: Real-time database and authentication
- **PostgreSQL**: Reliable data storage
- **Redis**: Caching and session management

### AI & Integrations
- **OpenAI API**: Content summarization and analysis
- **Claude API**: Alternative AI provider
- **Chrome Extensions API**: Browser integration
- **Google Calendar API**: Task synchronization
- **Notion API**: Project management integration

### Development Tools
- **Webpack**: Module bundling for extension
- **Jest**: Testing framework
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

## 🏗️ Project Structure

```
focusfuel/
├── src/                    # Desktop app source
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # State management (Zustand)
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript definitions
│   └── main.js           # Electron main process
├── extension/             # Browser extension
│   ├── popup/            # Extension popup UI
│   ├── background/       # Service worker
│   ├── content/          # Content scripts
│   ├── options/          # Extension settings
│   └── manifest.json     # Extension manifest
├── public/               # Static assets
├── dist/                 # Build outputs
└── docs/                 # Documentation
```

## 🔧 Configuration

### Desktop App Settings
- **Auto-start**: Launch with system startup
- **Notifications**: Desktop and system notifications
- **Theme**: Light, dark, or system preference
- **Language**: Multi-language support

### Extension Settings
- **Blocking sensitivity**: Low, medium, or high
- **Blocking mode**: Soft, hard, or smart
- **Schedule**: Time-based blocking rules
- **Whitelist/Blacklist**: Custom site lists

### AI Configuration
- **API provider**: OpenAI or Claude
- **Model selection**: GPT-3.5, GPT-4, or Claude-3
- **Summary length**: Short, medium, or long
- **Key points**: Include or exclude key points

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📦 Distribution

### Desktop App
- **Windows**: NSIS installer with auto-updates
- **macOS**: DMG package with code signing
- **Linux**: AppImage for universal compatibility

### Browser Extension
- **Chrome Web Store**: Automated deployment
- **Firefox Add-ons**: Manual submission
- **Edge Add-ons**: Microsoft Store listing

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier for formatting
- Write comprehensive tests
- Document new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the AI summarization capabilities
- **Supabase** for the real-time database infrastructure
- **Electron** team for the cross-platform framework
- **Tailwind CSS** for the utility-first styling system
- **React** team for the amazing UI library

## 📞 Support

- **Documentation**: [docs.focusfuel.app](https://docs.focusfuel.app)
- **Issues**: [GitHub Issues](https://github.com/your-username/focusfuel/issues)
- **Discord**: [Join our community](https://discord.gg/focusfuel)
- **Email**: support@focusfuel.app

## 🚀 Roadmap

### v1.1 - Enhanced AI Features
- [ ] Advanced content analysis
- [ ] Personalized learning recommendations
- [ ] Voice-to-text summarization
- [ ] Multi-language support

### v1.2 - Social Features
- [ ] Focus rooms with video/audio
- [ ] Team productivity challenges
- [ ] Anonymous productivity sharing
- [ ] Community leaderboards

### v1.3 - Advanced Analytics
- [ ] Machine learning insights
- [ ] Predictive productivity patterns
- [ ] Integration with health apps
- [ ] Advanced reporting dashboard

### v2.0 - Enterprise Features
- [ ] Team management dashboard
- [ ] Advanced security features
- [ ] SSO integration
- [ ] Custom branding options

---

**Made with ❤️ by the FocusFuel Team**

*Stay focused, stay productive, stay mindful.* 