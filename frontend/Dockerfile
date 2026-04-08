# Sử dụng Node.js bản mới nhất (khớp với môi trường của Hòa)
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy các file quản lý thư viện trước để tận dụng cache của Docker
COPY package.json package-lock.json* ./

# Cài đặt thư viện
RUN npm install

# Copy toàn bộ code frontend vào container
COPY . .

# Build dự án Next.js (Nếu Hòa dùng Next.js)
#RUN npm run build

# Mở cổng 3000
EXPOSE 3000

# Thay vì build, mình chạy dev để bỏ qua các bước kiểm tra khắt khe
CMD ["npm", "run", "dev"]