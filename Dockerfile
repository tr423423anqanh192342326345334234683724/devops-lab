FROM node:20-alpine
WORKDIR /usr/src/app

# Copy file định nghĩa dependency trước để tối ưu Docker cache
COPY package*.json ./

# Cài đặt toàn bộ dependencies bao gồm express
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn
COPY . .

EXPOSE 3000
CMD ["node", "app/index.js"]
