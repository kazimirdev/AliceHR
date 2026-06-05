#!/bin/bash
# AliceHR Installation Helper Script

echo "🚀 AliceHR Installation Helper"
echo "=============================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"
echo ""

# Navigate to project directory
cd /home/user/AliceHR || exit 1
echo "✅ In project directory: $PWD"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Build the extension
echo "🔨 Building extension..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build extension"
    exit 1
fi
echo "✅ Extension built successfully"
echo ""

# Show results
echo "📋 Build Summary"
echo "================"
du -sh dist/
echo ""
echo "📁 Files built:"
find dist/ -type f | wc -l
echo ""

echo "🎉 Installation Complete!"
echo ""
echo "Next steps:"
echo "1. Open Chrome"
echo "2. Go to chrome://extensions/"
echo "3. Enable 'Developer mode' (toggle in top-right)"
echo "4. Click 'Load unpacked'"
echo "5. Select this folder: /home/user/AliceHR/dist/"
echo ""
echo "Then visit any job posting and click the AliceHR icon!"
echo ""
