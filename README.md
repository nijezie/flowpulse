# FlowPulse - Real-time Stablecoin Flow Dashboard

FlowPulse is a comprehensive real-time dashboard for monitoring stablecoin flows across different blockchain networks with integrated betting functionality.

## 🚀 Features

### Backend (Node.js + Express)
- **Real-time Data Polling**: Connects to on-chain APIs and polls every 30 seconds
- **Flow Analytics**: Computes net stablecoin inflow/outflow per chain pair
- **Alert System**: Configurable thresholds with anomaly detection
- **Betting Engine**: Micro-betting system with dynamic odds calculation
- **WebSocket Support**: Real-time updates to connected clients
- **PostgreSQL Integration**: Persistent storage for flows, alerts, and bets

### Frontend (React)
- **Interactive Heatmap**: Visual grid showing chain-to-chain flows
- **Real-time Feed**: Live narrative feed with mini sparklines
- **Time-series Charts**: Detailed flow trends with multiple timeframes
- **Alert Management**: Configure and manage flow alerts
- **Betting Interface**: Quick betting with preset amounts and live odds
- **Responsive Design**: Mobile-friendly interface

### Database Schema
- **flows**: Store chain-to-chain flow data with timestamps
- **alerts**: Configurable alert thresholds and triggers
- **bets**: User betting history with odds and payouts

## 📁 Project Structure

\`\`\`
flowpulse/
├── package.json                 # Root package.json for scripts
├── server/                      # Backend API
│   ├── package.json
│   ├── index.js                # Main server file
│   ├── config/
│   │   └── database.js         # Database configuration
│   ├── routes/
│   │   ├── flows.js            # Flow data endpoints
│   │   ├── alerts.js           # Alert management endpoints
│   │   └── bets.js             # Betting endpoints
│   ├── services/
│   │   └── dataPoller.js       # Data polling service
│   └── .env                    # Environment variables
└── client/                     # Frontend React app
    ├── package.json
    ├── public/
    ├── src/
    │   ├── App.js              # Main app component
    │   ├── App.css             # Global styles
    │   └── components/
    │       ├── Header.js       # Header component
    │       ├── HeatmapGrid.js  # Flow heatmap
    │       ├── NarrativeFeed.js # Real-time feed
    │       ├── TimeSeriesChart.js # Flow charts
    │       ├── AlertPanel.js   # Alert management
    │       └── BettingInterface.js # Betting UI
    └── ...
\`\`\`

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### 1. Install Dependencies
\`\`\`bash
# Install all dependencies (root, server, and client)
npm run install-all

# Or install individually
npm install                    # Root dependencies
cd server && npm install      # Server dependencies
cd ../client && npm install   # Client dependencies
\`\`\`

### 2. Database Setup
1. Create a PostgreSQL database named `flowpulse`
2. Update the `DATABASE_URL` in `server/.env`
3. The database tables will be created automatically on first run

### 3. Environment Configuration
Copy and configure the environment variables in `server/.env`:

\`\`\`env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/flowpulse

# Server Configuration
PORT=3001
NODE_ENV=development

# API Keys (Add your actual API keys)
ETHEREUM_API_KEY=your_ethereum_api_key_here
SOLANA_API_KEY=your_solana_api_key_here
POLYGON_API_KEY=your_polygon_api_key_here
\`\`\`

### 4. Running the Application

#### Development Mode (Both server and client)
\`\`\`bash
npm run dev
\`\`\`

#### Run Server Only
\`\`\`bash
npm run server
\`\`\`

#### Run Client Only
\`\`\`bash
npm run client
\`\`\`

#### Production Build
\`\`\`bash
npm run build
\`\`\`

## 🔌 API Endpoints

### Flow Data
- `GET /api/flows` - Get recent stablecoin flows
- `GET /api/flows/heatmap` - Get heatmap data
- `GET /api/flows/timeseries` - Get time-series data for charts

### Alert Management
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id/toggle` - Toggle alert status
- `DELETE /api/alerts/:id` - Delete alert

### Betting System
- `GET /api/bets` - Get user bets
- `POST /api/bets` - Place new bet
- `GET /api/bets/odds` - Get current odds for chain pair

### Health Check
- `GET /api/health` - Server health status

## 🎯 Usage

1. **Monitor Flows**: View the heatmap to see real-time stablecoin flows between chains
2. **Set Alerts**: Configure alerts for significant flow changes
3. **Place Bets**: Select a flow and place micro-bets on direction predictions
4. **Analyze Trends**: Use the time-series charts to analyze flow patterns

## 🔧 Customization

### Adding New Chains
1. Update the `CHAINS` array in relevant components
2. Add chain-specific API integration in `dataPoller.js`
3. Update the database schema if needed

### Integrating Real APIs
Replace the mock data generation in `services/dataPoller.js` with actual API calls:

\`\`\`javascript
// Example: Replace generateMockFlowData() with real API calls
const fetchEthereumFlows = async () => {
  const response = await axios.get('https://api.etherscan.io/api', {
    params: {
      module: 'account',
      action: 'tokentx',
      // ... other parameters
    }
  });
  return response.data;
};
\`\`\`

### Styling Customization
- Modify CSS files in `client/src/components/` for component-specific styles
- Update `client/src/App.css` for global styles
- Color scheme can be changed by updating CSS custom properties

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Manual Deployment
1. Build the client: `cd client && npm run build`
2. Deploy the server with your preferred hosting service
3. Serve the built client files as static assets

## 🔮 Next Steps & Enhancements

### Immediate Improvements
1. **Real API Integration**: Replace mock data with actual blockchain APIs
2. **Enhanced Styling**: Improve visual design and animations
3. **User Authentication**: Add user accounts and authentication
4. **Mobile Optimization**: Further optimize for mobile devices

### Advanced Features
1. **Machine Learning**: Implement ML models for better flow predictions
2. **Social Features**: Add user profiles and leaderboards
3. **Advanced Analytics**: More sophisticated flow analysis tools
4. **Multi-token Support**: Expand beyond stablecoins
5. **DeFi Integration**: Connect with DeFi protocols for additional data

### Technical Improvements
1. **Caching Layer**: Implement Redis for better performance
2. **Rate Limiting**: Add API rate limiting
3. **Error Handling**: Enhanced error handling and logging
4. **Testing**: Add comprehensive test suites
5. **Documentation**: API documentation with Swagger

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment details

---

**FlowPulse** - Real-time insights into the stablecoin ecosystem 🌊💰
