FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN chown -R node:node /app
USER node
EXPOSE 5000
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node src/app.js"]
