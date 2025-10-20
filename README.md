# EMR Healthcare Management System

A comprehensive Electronic Medical Records (EMR) system for healthcare facilities, built with modern web technologies.

## 🏥 Features

- **Patient Management**: Complete patient records and history
- **Appointment Scheduling**: Manage doctor appointments and schedules
- **Billing & Invoicing**: Generate and track medical bills and invoices
- **Doctor & Nurse Management**: Manage healthcare staff profiles
- **Referral System**: Track patient referrals between providers
- **Pharmacy Management**: Medication tracking and inventory
- **Dashboard Analytics**: Real-time insights and statistics
- **Audit Logs**: Complete activity tracking for compliance
- **Multi-Clinic Support**: Manage multiple clinic locations

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer for notifications
- **Security**: bcryptjs for password hashing

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 📁 Project Structure

```
Emr-Live/
├── backend/                 # Node.js/Express API
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── scripts/            # Utility scripts
│   └── server.js           # Entry point
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app component
│   └── dist/              # Build output
│
└── render.yaml            # Render deployment config
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Emr-Live
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env if needed
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🌐 Deployment

### Deploy to Render

We provide complete deployment guides for Render:

1. **Quick Start**: See `DEPLOYMENT_CHECKLIST.md` for step-by-step checklist
2. **Detailed Guide**: See `RENDER_DEPLOYMENT.md` for comprehensive instructions
3. **Keep Alive**: See `keep-alive.md` for keeping free tier backend active

### Deployment Files Included:
- ✅ `render.yaml` - Automatic deployment configuration
- ✅ Health check endpoint configured
- ✅ Environment variable templates
- ✅ Production-ready API configuration

### Quick Deploy Steps:
1. Push code to GitHub
2. Connect repository to Render
3. Use Blueprint deployment with `render.yaml`
4. Add environment variables
5. Deploy!

**Estimated deployment time**: 10-15 minutes

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
FRONTEND_URL=your_frontend_url
```

### Frontend (.env)
```env
VITE_API_URL=your_backend_url
```

## 📚 API Documentation

See `backend/API_DOCUMENTATION.md` for complete API reference.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment help:
- Check `DEPLOYMENT_CHECKLIST.md` for quick reference
- See `RENDER_DEPLOYMENT.md` for detailed instructions
- Review `keep-alive.md` for free tier optimization

For technical issues:
- Check the logs in Render dashboard
- Review API documentation
- Ensure all environment variables are set correctly

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Real-time notifications with Socket.IO
- [ ] Advanced reporting and analytics
- [ ] Telemedicine integration
- [ ] Lab results management
- [ ] Prescription management system

---

**Built with ❤️ for better healthcare management**