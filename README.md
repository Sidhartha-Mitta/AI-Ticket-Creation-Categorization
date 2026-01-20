# AI Ticket Project

A comprehensive role-based ticket management system built with a modern tech stack, featuring AI-powered ticket categorization, user authentication, ticket creation, status tracking, and administrative controls.

## Features

- **Role-Based Access Control**: Supports Admin, Support, and User roles with different permissions
- **User Authentication**: JWT-based authentication with secure password hashing
- **Ticket Management**: Create, view, update, and track tickets with status progression
- **AI-Powered Categorization**: Ticket category and priority are automatically determined by machine learning models based on ticket content
- **Admin Dashboard**: User management, ticket oversight, and system statistics
- **Support Interface**: Dedicated tools for support staff to manage tickets
- **Responsive Design**: Mobile-friendly interface built with React and Tailwind CSS
- **Real-time Updates**: State management with Zustand for seamless user experience

## AI/ML Integration

The system incorporates machine learning models to automatically categorize tickets and assign priority levels based on the ticket's title and description. This helps in efficient routing and prioritization of support requests.

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React 19** with **Vite** build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React Toastify** for notifications
- **Heroicons** and **Lucide React** for icons
- **jsPDF** for PDF generation

## Project Structure

```
AI_TICKET_PROJECT/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Ticket.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── support.js
│   │   └── tickets.js
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   └── ...
│   │   ├── pages/
│   │   ├── stores/
│   │   └── ...
│   ├── package.json
│   ├── vite.config.js
│   └── ...
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/ticket_management
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory (if needed for API endpoints):
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Access the Application**: Open your browser and navigate to `http://localhost:5173` (default Vite port)

2. **User Registration/Login**:
   - Register a new account or login with existing credentials
   - Different roles have access to different features

3. **Creating Tickets**:
   - Navigate to the dashboard
   - Fill out the ticket creation form with title and description
   - Submit to create a new ticket

4. **Managing Tickets**:
   - View all tickets in the ticket list
   - Update ticket status (for authorized roles)
   - Filter and search tickets

5. **Admin Features**:
   - Access admin panel for user management
   - View system statistics and reports
   - Manage all tickets across the system

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

### Tickets
- `GET /tickets` - Get user's tickets
- `POST /tickets` - Create new ticket
- `PUT /tickets/:id` - Update ticket
- `DELETE /tickets/:id` - Delete ticket

### Admin
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id` - Update user role
- `GET /admin/tickets` - Get all tickets
- `GET /admin/stats` - Get system statistics

### Support
- `GET /support/tickets` - Get tickets assigned to support
- `PUT /support/tickets/:id` - Update ticket status

## Development

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend linting
cd frontend
npm run lint
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd backend
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Architecture Overview

```mermaid
graph TB
    A[Frontend - React] --> B[API Routes]
    B --> C[Authentication Middleware]
    B --> D[Ticket Routes]
    B --> E[Admin Routes]
    B --> F[Support Routes]
    C --> G[JWT Verification]
    D --> H[Ticket Controller]
    E --> I[Admin Controller]
    F --> J[Support Controller]
    H --> M[ML Model]
    M --> N[Categorization & Priority]
    N --> K[MongoDB - Tickets]
    I --> L[MongoDB - Users]
    J --> K
    G --> L
```

## Future Enhancements

- Email notifications for ticket updates
- File attachments for tickets
- Advanced search and filtering
- Real-time notifications with WebSockets
- API documentation with Swagger
- Unit and integration tests
- Docker containerization