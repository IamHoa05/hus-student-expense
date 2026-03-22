import os
from huggingface_hub import hf_hub_download

def download_vintern_gguf():
    repo_id = "ngxson/Vintern-1B-v3_5-GGUF"
    model_file = "Vintern-1B-v3_5-Q8_0.gguf"        # Bộ não (Trích xuất chữ)
    clip_file = "mmproj-Vintern-1B-v3_5-Q8_0.gguf"  # Mắt thần (Nhìn ảnh)
    
    # Dùng đường dẫn TUYỆT ĐỐI bên trong Docker container
    # Tự động nhận diện: Nếu ở trong Docker thì dùng /code/models, ở ngoài thì dùng ./models
    local_dir = "/code/models" if os.path.exists("/code") else "./models"

    if not os.path.exists(local_dir):
        os.makedirs(local_dir)

    for f in [model_file, clip_file]:
        path = os.path.join(local_dir, f)
        if not os.path.exists(path):
            print(f"🚀 Đang tải {f} về máy Hoa...")
            hf_hub_download(repo_id=repo_id, filename=f, local_dir=local_dir)
    print("✅ Tất cả model đã sẵn sàng!")

if __name__ == "__main__":
    download_vintern_gguf()