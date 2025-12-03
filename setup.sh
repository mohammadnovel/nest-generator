#!/bin/bash

echo "🚀 NestJS MVC App - Quick Setup Script"
echo ""

# Check if PostgreSQL database exists
echo "📦 Checking database..."
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -w nestjs_mvc_app | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo "Creating database nestjs_mvc_app..."
    psql -U postgres -c "CREATE DATABASE nestjs_mvc_app;"
    echo "✅ Database created"
else
    echo "✅ Database already exists"
fi

echo ""
echo "📝 Starting application to create tables..."
echo "   (Will stop automatically after 10 seconds)"
echo ""

# Start app in background
npm run start:dev &
APP_PID=$!

# Wait for app to start and create tables
sleep 10

# Stop the app
kill $APP_PID 2>/dev/null

echo ""
echo "✅ Tables created!"
echo ""
echo "🌱 Running database seeder..."
npm run seed

echo ""
echo "✨ Setup complete!"
echo ""
echo "🚀 Start the application:"
echo "   npm run start:dev"
echo ""
echo "📚 Swagger docs:"
echo "   http://localhost:3000/api"
echo ""
echo "🔑 Login credentials:"
echo "   Admin: admin@example.com / Admin123!"
echo "   User:  user@example.com / User123!"
echo ""
