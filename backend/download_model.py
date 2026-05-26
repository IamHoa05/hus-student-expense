import os
#from huggingface_hub import hf_hub_download

# Thêm dòng này để kiểm tra xem Hoa có thực sự muốn dùng AI lúc này không
ENABLE_AI = os.getenv("ENABLE_AI", "false").lower() == "true"

def download_vintern_gguf():
    # # Nếu ENABLE_AI là false, thoát luôn, không làm gì cả cho mát máy
    # if not ENABLE_AI:
    #     print("❄️ Chế độ tiết kiệm: Đã bỏ qua bước tải Model AI.")
    #     return

    # repo_id = "ngxson/Vintern-1B-v3_5-GGUF"
    # model_file = "Vintern-1B-v3_5-Q8_0.gguf"
    # clip_file = "mmproj-Vintern-1B-v3_5-Q8_0.gguf"
    
    # local_dir = "/code/models" if os.path.exists("/code") else "./models"

    # if not os.path.exists(local_dir):
    #     os.makedirs(local_dir)

    # for f in [model_file, clip_file]:
    #     path = os.path.join(local_dir, f)
    #     if not os.path.exists(path):
    #         print(f"🚀 Đang tải {f} về máy Hoa...")
    #         #(repo_id=repo_id, filename=f, local_dir=local_dir)
    # print("✅ Tất cả model đã sẵn sàng!")
    print("❄️ AI đã bị tắt. Bỏ qua bước tải model.")
    return  # Thoát luôn, không chạy gì bên dưới nữa

if __name__ == "__main__":
    download_vintern_gguf()
# Test
