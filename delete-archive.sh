#!/bin/bash

# 🗑️ One-Click Archive Deletion Script
# WARNING: This permanently deletes ALL archived files

echo "🚨 WARNING: About to delete entire archive folder!"
echo "📊 Archive contains:"
echo "   - $(find archive -type f | wc -l) files"
echo "   - $(find archive -type d | wc -l) directories"
echo ""

read -p "Are you sure you want to delete everything? (yes/no): " confirmation

if [ "$confirmation" = "yes" ]; then
    echo "🗑️ Deleting archive..."
    rm -rf archive/
    echo "✅ Archive deleted successfully!"
    echo "🧹 Project is now completely clean"
else
    echo "❌ Deletion cancelled"
    echo "📂 Archive preserved at: ./archive/"
fi