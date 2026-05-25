# ---- Stage 1: Build ----
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Astro project
RUN npm run build

# ---- Stage 2: Production ----
FROM node:22-alpine AS production

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Copy only the built output and production dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Expose the default Astro standalone port
EXPOSE 4321

# Run the standalone Node.js server
CMD ["node", "dist/server/entry.mjs"]
