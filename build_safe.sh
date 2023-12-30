# Step 1: Build the new version into a new directory
cd ./client

# Build path is build_ + timestamp (timestamp formatted for folder name)
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BUILD_PATH=build_$TIMESTAMP
BUILD_PATH=$(echo $BUILD_PATH | tr -d ' ') npm run build

# Step 2: Copy the build to the server
mv ./build ./build_old_$TIMESTAMP
mv ./$BUILD_PATH ./build

echo "Build complete"