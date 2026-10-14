# Stage 1: Runtime base
FROM node:20-alpine
WORKDIR /usr/src/app

# Bảo mật: Dùng non-root user có sẵn của image alpine
USER node

# Copy app files
COPY --chown=node:node app/ ./

EXPOSE 3000

CMD ["node", "index.js"]
