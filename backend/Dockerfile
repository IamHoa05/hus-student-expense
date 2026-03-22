# 1. Sử dụng Python bản slim
FROM python:3.11-slim

# 2. Thiết lập thư mục làm việc
WORKDIR /code

# 3. Cài đặt các thư viện hệ thống (Thêm build-essential cho llama-cpp)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements
COPY requirements.txt .

# 5. Cài đặt các thư viện Python
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 6. SỬA DÒNG NÀY: Copy TOÀN BỘ thư mục backend (bao gồm cả download_model.py và main.py)
# Thay vì chỉ copy ./app, Hoa hãy copy tất cả vào /code
COPY . .

# 7. Lệnh khởi chạy server (Lưu ý: Nếu main.py nằm ở gốc backend, lệnh sẽ là main:app)
# Nhưng vì mình đã dùng command trong docker-compose nên dòng CMD này sẽ bị ghi đè.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]