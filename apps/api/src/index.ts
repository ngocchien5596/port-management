import 'dotenv/config'; // Heartbeat: Reloading for ReportController fix
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { initSocket, getIO } from './lib/socket';

// Import routes
import qltauRoutes from './routes/index';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler';

// Import cron jobs
import { startNotificationCronJob } from './jobs/notification.cron';

const app = express();
const httpServer = createServer(app);

// Socket.io setup — single shared instance used by all services
const io = initSocket(httpServer);

// Make io accessible to routes
app.set('io', io);

import { testTimeController } from './controllers/test-time.controller';
app.get('/api/test-time', testTimeController);

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Normalize for comparison
        const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
        const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '').toLowerCase();

        // Debug logging (View this in Render -> Logs)
        console.log(`[CORS] Request from: "${normalizedOrigin}", Allowed: "${frontendUrl}"`);

        // Check against localhost
        if (normalizedOrigin.match(/^http:\/\/localhost:\d+$/)) {
            return callback(null, true);
        }

        // Check against configured URL or fallback
        if (
            (frontendUrl && normalizedOrigin === frontendUrl) ||
            normalizedOrigin === 'https://port-management-web.vercel.app'
        ) {
            return callback(null, true);
        }

        console.error(`[CORS] Blocked origin: ${origin}`);
        callback(null, false); // Don't allow
    },
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'port-management-api', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', qltauRoutes);

// 404 handler for unhandled API routes
app.use(notFound);

// Error handler
app.use(errorHandler);

// Socket.io connection handlers
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join-voyage', (voyageId: string) => {
        socket.join(`voyage-${voyageId}`);
    });

    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 4000;

// Start background cron jobs
startNotificationCronJob();

httpServer.listen(PORT, () => {
    console.log('');
    console.log('⚓ Port Management API Server');
    console.log('================================');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io ready`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
});

export { io };

