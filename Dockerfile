# Stage 1: Build the Next.js app
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN yarn install --frozen-lockfile

# Copy Prisma schema and migrations if they exist
COPY prisma ./prisma

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN yarn build

# Stage 2: Set up production environment without Puppeteer and cron
FROM node:18-alpine

WORKDIR /app

# Install openssh-client for SSH and autossh for automatic SSH tunnel management
RUN apk update && apk add --no-cache openssh-client autossh

# Copy the .ssh directory from the build context (host machine) to /root/.ssh in the container
COPY .ssh /root/.ssh

# Ensure correct permissions for the .ssh directory and files
RUN chmod 700 /root/.ssh && chmod 600 /root/.ssh/*

# Ensure the /root/.ssh directory exists with the correct permissions
#RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh

# Generate an RSA key with 4096 bits and no passphrase
#RUN ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa -N ""

COPY --from=builder /app /app

RUN yarn install --frozen-lockfile --production

# Expose the port that Next.js listens on
EXPOSE 3000

CMD ["/bin/sh","/app/start.sh"]
# Start Next.js without cron
#CMD ["yarn", "start"]
