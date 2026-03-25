FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Run npm install if package.json exists
RUN if [ -f package.json ]; then npm install; fi
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]
