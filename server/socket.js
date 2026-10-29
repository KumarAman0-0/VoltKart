const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow all local dev ports (5173, 5174, 5175, 5176, 5177) and voltkart domains
        if (!origin || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1') || 
            origin.endsWith('.voltkart.in') || 
            origin === 'https://voltkart.in') {
          callback(null, true);
        } else {
          callback(null, true); // Dev-friendly permissive CORS
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    // Join room for a diagnostic code (e.g., 'VK7X92')
    socket.on('join_diagnostic', ({ code, role }) => {
      if (!code) return;
      const room = `diag:${code.toUpperCase()}`;
      socket.join(room);
      console.log(`📡 [Socket.io] ${role || 'Client'} (${socket.id}) joined room: ${room}`);

      // Notify others in the room
      socket.to(room).emit('peer_joined', { role, timestamp: new Date() });
    });

    // Diagnostic PWA emits progressive test result (e.g., touch grid, display, audio)
    socket.on('test_progress', ({ code, testKey, result }) => {
      if (!code) return;
      const room = `diag:${code.toUpperCase()}`;
      console.log(`⚡ [Socket.io] Progress on ${room} -> ${testKey}:`, result);
      
      // Broadcast to agent in the same room
      socket.to(room).emit('live_test_progress', {
        testKey,
        result,
        timestamp: new Date(),
      });
    });

    // Diagnostic PWA submits final results
    socket.on('diagnostic_submitted', ({ code, autoTests, battery }) => {
      if (!code) return;
      const room = `diag:${code.toUpperCase()}`;
      console.log(`🏁 [Socket.io] Diagnostic test submitted on room: ${room}`);
      
      socket.to(room).emit('live_diagnostic_completed', {
        code: code.toUpperCase(),
        autoTests,
        battery,
        timestamp: new Date(),
      });
    });

    // Agent arrives at doorstep with GPS
    socket.on('agent_location_lock', ({ code, coords }) => {
      if (!code) return;
      const room = `diag:${code.toUpperCase()}`;
      socket.to(room).emit('agent_arrived', { coords, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      // console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

module.exports = { initSocket, getIO };
