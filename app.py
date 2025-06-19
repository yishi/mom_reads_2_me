from flask import Flask, render_template, request, jsonify, url_for, send_from_directory
import os
import base64
import requests
import uuid
import json
import re  # 添加这一行导入re模块

# 导入配置
try:
    from config import API_KEY
except ImportError:
    # 如果配置文件不存在，使用环境变量或默认值
    import os
    API_KEY = os.environ.get("API_KEY", "")
    if not API_KEY:
        print("警告：API_KEY未设置，请创建config.py文件或设置环境变量")

app = Flask(__name__)

# 配置上传文件夹
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
AUDIO_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'audio')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# SiliconFlow API配置  海外版的
# API_KEY已从config.py导入  

# OCR_API_URL = "https://api.ap.siliconflow.com/v1/chat/completions"  # 请替换为实际的OCR API端点
# TRANSLATE_API_URL = "https://api.ap.siliconflow.com/v1/chat/completions"  # 请替换为实际的翻译API端点
# TTS_API_URL = "https://api.ap.siliconflow.com/v1/audio/speech"  # 请替换为实际的TTS API端点
# UPLOAD_VOICE_API_URL = "https://api.ap.siliconflow.com/v1/uploads/audio/voice"

# SiliconFlow API配置  国内版的
OCR_API_URL = "https://api.siliconflow.cn/v1/chat/completions"  # 请替换为实际的OCR API端点
TRANSLATE_API_URL = "https://api.siliconflow.cn/v1/chat/completions"  # 请替换为实际的翻译API端点
TTS_API_URL = "https://api.siliconflow.cn/v1/audio/speech"  # 请替换为实际的TTS API端点
UPLOAD_VOICE_API_URL = "https://api.siliconflow.cn/v1/uploads/audio/voice"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ocr', methods=['POST'])
def ocr():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    # 保存上传的图片
    filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # 将图片转换为base64
    with open(filepath, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    # 调用SiliconFlow OCR API
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    # 构建请求数据，参考SiliconFlow文档
    payload = {
        "model": "deepseek-ai/deepseek-vl2",  # 使用支持视觉的模型
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                            "detail": "high"
                        }
                    },
                    {
                        "type": "text",
                        "text": "请识别图片中的所有英文文本，只返回文本内容，不要添加任何解释。"
                    }
                ]
            }
        ],
        "temperature": 0.1
    }
    
    try:
        response = requests.post(OCR_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        extracted_text = result.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        return jsonify({'text': extracted_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text parameter'}), 400
    
    text = data['text']
    # 获取自定义提示词，如果没有则使用默认值
    prompt = data.get('prompt', "翻译成儿童科普漫画风格的中文。只返回翻译结果，不要添加任何解释或原文。")
    
    # 调用SiliconFlow翻译API
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    payload = {
        "model": "deepseek-ai/DeepSeek-R1",
        "messages": [
            {
                "role": "system",
                "content": prompt
            },
            {
                "role": "user",
                "content": text
            }
        ],
        "temperature": 0.3
    }
    
    try:
        response = requests.post(TRANSLATE_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        translated_text = result.get('choices', [{}])[0].get('message', {}).get('content', '')
        
        return jsonify({'text': translated_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/tts', methods=['POST'])
def tts():
    data = request.json
    if not data or 'text' not in data or 'lang' not in data:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    text = data['text']
    lang = data['lang']
    
    # 获取原始文件名，如果没有提供则使用UUID
    original_filename = data.get('original_filename', str(uuid.uuid4()))
    
    # 文本分段处理（针对长文本）
    max_text_length = 500  # 设置合理的最大长度
    text_segments = []
    
    # 如果文本超过最大长度，按句子分段
    if len(text) > max_text_length:
        # 按句子分割文本
        sentences = re.split(r'(?<=[.!?])\s+', text)
        current_segment = ""
        
        for sentence in sentences:
            # 如果添加这个句子后超过最大长度，先保存当前段落，再开始新段落
            if len(current_segment) + len(sentence) > max_text_length and current_segment:
                text_segments.append(current_segment)
                current_segment = sentence
            else:
                current_segment += " " + sentence if current_segment else sentence
        
        # 添加最后一个段落
        if current_segment:
            text_segments.append(current_segment)
    else:
        text_segments = [text]
    
    # 检查是否有用户上传的语音URI
    if 'voice_uri' in data and data['voice_uri']:
        voice = data['voice_uri']
    else:
        # 使用默认语音
        voice = f"FunAudioLLM/CosyVoice2-0.5B:david" if lang == 'en' else f"FunAudioLLM/CosyVoice2-0.5B:david"
    
    # 处理所有文本段落并合并音频
    all_audio_data = bytearray()
    
    for segment in text_segments:
        # 调用SiliconFlow TTS API
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }
        
        # 正确格式化请求参数
        payload = {
            "model": "FunAudioLLM/CosyVoice2-0.5B",
            "input": segment,
            "voice": voice,
            "response_format": "mp3",
            "speed": 1.0,
            "sample_rate": 44100
        }
        
        try:
            # 发送请求到SiliconFlow TTS API
            response = requests.post(TTS_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            
            # 检查响应类型
            content_type = response.headers.get('Content-Type', '')
            
            if 'application/json' in content_type:
                # 如果返回JSON，提取音频URL或base64数据
                result = response.json()
                if 'audio' in result:
                    # 如果返回base64编码的音频
                    audio_data = base64.b64decode(result['audio'])
                    all_audio_data.extend(audio_data)
                elif 'url' in result:
                    # 如果返回音频URL，下载音频
                    audio_response = requests.get(result['url'])
                    audio_response.raise_for_status()
                    all_audio_data.extend(audio_response.content)
                else:
                    return jsonify({'error': '无法从API响应中获取音频数据'}), 500
            else:
                # 如果直接返回二进制音频数据
                all_audio_data.extend(response.content)
                
        except Exception as e:
            print(f"TTS API错误: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    # 根据语言设置文件名
    lang_text = "英文" if lang == 'en' else "中文"
    filename = f"{original_filename}_{lang_text}.mp3"
    filepath = os.path.join(AUDIO_FOLDER, filename)
    
    # 保存合并后的音频文件
    with open(filepath, 'wb') as f:
        f.write(all_audio_data)
    
    # 返回本地音频URL
    audio_url = url_for('static', filename=f'audio/{filename}')
    return jsonify({'audio_url': audio_url})

# 添加上传用户语音的接口
@app.route('/upload_voice', methods=['POST'])
def upload_voice():
    if 'file' not in request.files:
        return jsonify({'error': '没有提供音频文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '没有选择音频文件'}), 400
    
    text = request.form.get('text', '')
    if not text:
        return jsonify({'error': '没有提供参考文本'}), 400
    
    model = request.form.get('model', 'FunAudioLLM/CosyVoice2-0.5B')
    custom_name = request.form.get('customName', f'user-voice-{uuid.uuid4()}')
    
    # 保存上传的音频文件
    filename = f"voice_{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
    filepath = os.path.join(AUDIO_FOLDER, filename)
    file.save(filepath)
    
    # 调用SiliconFlow上传语音API
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    
    try:
        # 创建multipart/form-data请求
        files = {
            'file': (filename, open(filepath, 'rb'), f'audio/{os.path.splitext(file.filename)[1][1:]}')
        }
        
        data = {
            'model': model,
            'customName': custom_name,
            'text': text
        }
        
        # 发送请求到SiliconFlow上传语音API
        response = requests.post(
            UPLOAD_VOICE_API_URL,
            headers=headers,
            files=files,
            data=data
        )
        
        response.raise_for_status()
        result = response.json()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
