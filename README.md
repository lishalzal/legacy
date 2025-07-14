# Hacker Experience Modern

A modern recreation of the classic Hacker Experience Legacy game, built with React, Node.js, and MySQL.

## Features

- **Modern Web Interface**: Beautiful React-based UI with cyberpunk theme
- **Real-time Updates**: Socket.IO for live process updates and notifications
- **Hardware Management**: Buy, upgrade, and manage PCs, servers, and laptops
- **Software System**: Install, manage, and use various hacking tools
- **Mission System**: Complete storyline and side missions for rewards
- **Internet Simulation**: Scan, hack, and interact with NPCs and other players
- **Financial System**: Manage money, bank accounts, and Bitcoin wallets
- **Process Management**: Run time-based operations with progress tracking
- **User Profiles**: Track statistics, rankings, and achievements

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **Socket.IO** for real-time communication
- **JWT** authentication
- **bcryptjs** for password hashing

### Frontend
- **React 18** with hooks
- **React Router** for navigation
- **Socket.IO Client** for real-time updates
- **React Query** for data fetching
- **Styled Components** for styling
- **React Toastify** for notifications

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hacker-experience-modern
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up the database**
   ```bash
   # Create a MySQL database
   mysql -u root -p
   CREATE DATABASE hacker_experience;
   USE hacker_experience;
   
   # Import the schema
   source server/config/schema.sql;
   ```

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hacker_experience
   
   # JWT
   JWT_SECRET=your_secret_key_here
   
   # Server
   PORT=5000
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the development servers**
   ```bash
   # Start both server and client (recommended)
   npm run dev
   
   # Or start them separately:
   # Terminal 1 - Start server
   npm run server
   
   # Terminal 2 - Start client
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Game Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt

### Hardware System
- **PCs**: Basic computers with upgradeable components
- **Servers**: High-performance machines for advanced operations
- **Laptops**: Portable computers with balanced specs
- **Components**: CPU, RAM, HDD, Internet, Firewall, Antivirus

### Software System
- **Hacking Tools**: Basic Hacker, Port Scanner, NMAP
- **File Operations**: Download, Upload, Delete, Hide, Seek
- **System Tools**: Antivirus, Log Viewer, Disk Formatter
- **Network Tools**: DDoS, Web Server, IP Reset
- **Organization**: Folders and text files

### Mission System
- **Storyline Missions**: Progressive narrative missions
- **Side Missions**: Optional objectives for rewards
- **Daily Missions**: Regular challenges
- **Rewards**: Money, experience, and software

### Internet Simulation
- **NPCs**: Computer-controlled targets
- **Players**: Other human players
- **Scanning**: Port scanning and system analysis
- **Hacking**: Breach security and steal data

### Financial System
- **Money**: In-game currency
- **Bank Accounts**: Secure storage with passwords
- **Bitcoin**: Cryptocurrency wallets
- **Transfers**: Move funds between accounts

### Process Management
- **Time-based Operations**: Real-time progress tracking
- **Hardware Dependencies**: Performance affects speed
- **Multiple Processes**: Run several operations simultaneously
- **Real-time Updates**: Live progress via Socket.IO

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Hardware
- `GET /api/hardware` - Get user's hardware
- `POST /api/hardware/buy` - Buy new hardware
- `PUT /api/hardware/:id/upgrade` - Upgrade hardware
- `PUT /api/hardware/:id/activate` - Set active hardware

### Software
- `GET /api/software` - Get user's software
- `GET /api/software/store` - Get available software
- `POST /api/software/buy` - Buy software
- `PUT /api/software/:id/install` - Install/uninstall software

### Missions
- `GET /api/missions/available` - Get available missions
- `GET /api/missions/current` - Get current mission
- `POST /api/missions/:id/start` - Start mission
- `POST /api/missions/:id/complete` - Complete mission

### Internet
- `GET /api/internet/connections` - Get internet connections
- `POST /api/internet/scan` - Scan target
- `POST /api/internet/portscan` - Port scan target

### Finances
- `GET /api/finances` - Get user finances
- `GET /api/finances/bank` - Get bank accounts
- `POST /api/finances/bank` - Create bank account
- `POST /api/finances/transfer` - Transfer money

### Processes
- `GET /api/processes` - Get user's processes
- `POST /api/processes` - Start new process
- `DELETE /api/processes/:id` - Cancel process

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/ranking` - Get player rankings

## Socket.IO Events

### Client to Server
- `process_update` - Update process status
- `chat_message` - Send chat message
- `notification` - Send notification
- `process_completed` - Mark process as completed
- `mission_update` - Update mission progress

### Server to Client
- `connected` - Connection established
- `process_completed` - Process finished
- `process_updated` - Process progress updated
- `mission_updated` - Mission progress updated
- `notification` - Receive notification
- `private_message` - Private chat message
- `global_message` - Global chat message

## Development

### Project Structure
```
hacker-experience-modern/
├── server/                 # Backend code
│   ├── config/            # Database and configuration
│   ├── routes/            # API routes
│   └── socket.js          # Socket.IO handler
├── client/                # Frontend code
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── styles/        # CSS files
│   └── package.json       # Frontend dependencies
├── package.json           # Backend dependencies
└── README.md             # This file
```

### Available Scripts

**Backend:**
- `npm run server` - Start development server
- `npm run build` - Build for production

**Frontend:**
- `npm run client` - Start React development server
- `npm run build` - Build React app for production

**Both:**
- `npm run dev` - Start both servers concurrently

## Deployment

### Production Build
```bash
# Build the React app
cd client
npm run build
cd ..

# Set NODE_ENV to production
export NODE_ENV=production

# Start the server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=hacker_experience
JWT_SECRET=your_secure_jwt_secret
PORT=5000
CLIENT_URL=https://your-domain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Hacker Experience Legacy by Renato Massaro
- React and Node.js communities
- All contributors and players

## Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Welcome to the Matrix, hacker. Your journey begins now.**
