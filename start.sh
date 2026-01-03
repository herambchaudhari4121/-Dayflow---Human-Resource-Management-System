#!/bin/bash

echo "🚀 Starting DayFlow HRMS..."
echo ""

# Start MongoDB (if not running)
if ! pgrep -x "mongod" > /dev/null
then
    echo "📦 Starting MongoDB..."
    sudo systemctl start mongod
    sleep 2
fi

# Start Backend Server
echo "🔧 Starting Backend Server..."
cd server && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend Server
echo "🎨 Starting Frontend Server..."
cd ../client && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ DayFlow HRMS is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Frontend: http://localhost:5173"
echo "⚙️  Backend:  http://localhost:5000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
