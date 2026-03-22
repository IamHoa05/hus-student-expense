import os
import io
import base64
from llama_cpp import Llama
from PIL import Image
from app.schemas.receipt import OCRResultResponse
import json
import re


class OCRService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OCRService, cls).__new__(cls)
            cls._instance.llm = Llama(
                model_path="/code/models/Vintern-1B-v3_5-Q8_0.gguf",
                clip_model_path="/code/models/mmproj-Vintern-1B-v3_5-Q8_0.gguf",
                # SỬA Ở ĐÂY: Dùng chatml để hỗ trợ cấu trúc thẻ im_start
                chat_format="vintern_chatml", 
                n_ctx=2048,
                n_threads=4
            )
        return cls._instance

    async def process_receipt(self, image_bytes: bytes) -> OCRResultResponse:
        # 1. Xử lý ảnh sang Base64
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=95)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        # 2. Tạo Prompt THÔ (Raw) - KHÔNG dùng messages, KHÔNG dùng chat_format
        # Đây là cấu trúc chuẩn để Vintern-1B không bị "ngáo"
        prompt = (
            "<|im_start|>user\n<image>\n"
            "Trích xuất thông tin chính trong ảnh và trả về dạng markdown."
            "<|im_end|>\n<|im_start|>assistant\n"
        )

        # 3. Dùng hàm create_completion (KHÔNG CÓ CHỮ CHAT)
        # Hàm này nhận chuỗi String thuần túy, tránh lỗi concatenate list
        response = self.llm.create_completion(
            prompt=prompt,
            # CHÌA KHÓA: Truyền ảnh vào đây để 'Mắt thần' kích hoạt
            image_base64=img_str, 
            max_tokens=512,
            temperature=0,            # do_sample=False
            repeat_penalty=2.5,       # Ép AI không lặp lại câu hỏi xã giao
            stop=["<|im_end|>", "</s>", "USER:", "ASSISTANT:"]
        )

        # 4. Lấy kết quả từ ['choices'][0]['text']
        raw_text = response["choices"][0]["text"].strip()
        print(f"--- KẾT QUẢ OCR: {raw_text}")

        return OCRResultResponse(
            raw_text=raw_text,
            amount=0, 
            shop_name="Đang trích xuất..."
        )