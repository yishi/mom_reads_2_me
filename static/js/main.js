document.addEventListener('DOMContentLoaded', function() {
    // 元素获取
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removeBtn');
    const processBtn = document.getElementById('processBtn');
    const resultSection = document.getElementById('resultSection');
    
    // 流程图元素
    const processFlow = document.getElementById('processFlow');
    const uploadStep = document.getElementById('uploadStep');
    const ocrFlowStep = document.getElementById('ocrFlowStep');
    const translateFlowStep = document.getElementById('translateFlowStep');
    const audioFlowStep = document.getElementById('audioFlowStep');
    const connector1 = document.getElementById('connector1');
    const connector2 = document.getElementById('connector2');
    const connector3 = document.getElementById('connector3');
    const toggleDetailsBtn = document.getElementById('toggleDetailsBtn');
    const detailsContainer = document.getElementById('detailsContainer');
    
    // 步骤元素
    const ocrStep = document.getElementById('ocrStep');
    const translateStep = document.getElementById('translateStep');
    const audioStep = document.getElementById('audioStep');
    
    // 结果和按钮元素
    const ocrResult = document.getElementById('ocrResult');
    const translationResult = document.getElementById('translationResult');
    const confirmOcrBtn = document.getElementById('confirmOcrBtn');
    const confirmTranslateBtn = document.getElementById('confirmTranslateBtn');
    const resetAllBtn = document.getElementById('resetAllBtn');
    
    // 编辑和下载按钮
    const editOcrBtn = document.getElementById('editOcrBtn');
    const downloadOcrBtn = document.getElementById('downloadOcrBtn');
    const editTranslateBtn = document.getElementById('editTranslateBtn');
    const downloadTranslateBtn = document.getElementById('downloadTranslateBtn');
    
    // 添加提示词相关元素获取
    const promptInput = document.getElementById('promptInput');
    const editPromptBtn = document.getElementById('editPromptBtn');
    const retranslateBtn = document.getElementById('retranslateBtn');

    // 音频元素
    const englishAudio = document.getElementById('englishAudio');
    const chineseAudio = document.getElementById('chineseAudio');
    const downloadEnBtn = document.getElementById('downloadEnBtn');
    const downloadZhBtn = document.getElementById('downloadZhBtn');
    
    // 加载元素
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    // 存储原始文件名（不含扩展名）
    let originalFileName = '';
    
    // 确保加载覆盖层在页面加载时被隐藏
    console.log('页面加载完成，准备隐藏加载覆盖层');
    if (loadingOverlay) {
        console.log('找到loadingOverlay元素，当前hidden状态:', loadingOverlay.hidden);
        loadingOverlay.hidden = true;
        console.log('设置hidden=true后的状态:', loadingOverlay.hidden);
        // 强制使用样式隐藏
        loadingOverlay.style.display = 'none';
    } else {
        console.error('未找到loadingOverlay元素');
    }
    
    // 文件上传相关事件
    dropArea.addEventListener('click', () => fileInput.click());
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });
    
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });
    
    // 处理上传的文件
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (!file.type.match('image.*')) {
                alert('请上传图片文件！');
                return;
            }
            
            // 保存原始文件名（不含扩展名）
            originalFileName = file.name.replace(/\.[^\.]+$/, '');
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                uploadPlaceholder.hidden = true;
                imagePreview.hidden = false;
                processBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }
    
    // 重置上传区域和结果
    function resetUpload() {
        fileInput.value = '';
        previewImg.src = '';
        uploadPlaceholder.hidden = false;
        imagePreview.hidden = true;
        processBtn.disabled = true;
        resultSection.hidden = true;
        processFlow.hidden = true;
        
        // 重置流程图状态
        resetFlowStatus();
        
        // 重置步骤显示
        detailsContainer.hidden = true;
        toggleDetailsBtn.textContent = '查看详情';
        toggleDetailsBtn.classList.remove('active');
        ocrStep.hidden = false;
        translateStep.hidden = true;
        audioStep.hidden = false;
        
        // 清空结果
        ocrResult.value = '';
        translationResult.value = '';
        
        // 重置音频
        englishAudio.src = '';
        chineseAudio.src = '';
        downloadEnBtn.href = '#';
        downloadZhBtn.href = '#';
        
        // 重置编辑状态
        ocrResult.readOnly = true;
        translationResult.readOnly = true;
        editOcrBtn.textContent = '编辑';
        editTranslateBtn.textContent = '编辑';
    }
    
    // 重置流程图状态
    function resetFlowStatus() {
        uploadStep.classList.add('completed');
        ocrFlowStep.classList.remove('completed', 'current');
        translateFlowStep.classList.remove('completed', 'current');
        audioFlowStep.classList.remove('completed', 'current');
        connector1.classList.remove('completed');
        connector2.classList.remove('completed');
        connector3.classList.remove('completed');
    }
    
    // 更新流程图状态
    function updateFlowStatus(step) {
        resetFlowStatus();
        
        switch(step) {
            case 'ocr':
                ocrFlowStep.classList.add('current');
                break;
            case 'ocrDone':
                ocrFlowStep.classList.add('completed');
                connector1.classList.add('completed');
                translateFlowStep.classList.add('current');
                break;
            case 'translateDone':
                ocrFlowStep.classList.add('completed');
                connector1.classList.add('completed');
                translateFlowStep.classList.add('completed');
                connector2.classList.add('completed');
                audioFlowStep.classList.add('current');
                break;
            case 'audioDone':
                ocrFlowStep.classList.add('completed');
                connector1.classList.add('completed');
                translateFlowStep.classList.add('completed');
                connector2.classList.add('completed');
                audioFlowStep.classList.add('completed');
                connector3.classList.add('completed');
                break;
        }
    }
    
    // 切换详情显示
    toggleDetailsBtn.addEventListener('click', function() {
        detailsContainer.hidden = !detailsContainer.hidden;
        if (detailsContainer.hidden) {
            toggleDetailsBtn.textContent = '查看详情';
            toggleDetailsBtn.classList.remove('active');
        } else {
            toggleDetailsBtn.textContent = '隐藏详情';
            toggleDetailsBtn.classList.add('active');
        }
    });
    
    // OCR处理按钮点击事件
    processBtn.addEventListener('click', async () => {
        if (!previewImg.src) return;
        
        // 第一步：OCR识别
        showLoading('正在识别图片文本...');
        processFlow.hidden = false;
        updateFlowStatus('ocr');
        
        try {
            // 创建FormData对象
            const formData = new FormData();
            const blob = await fetch(previewImg.src).then(r => r.blob());
            formData.append('image', blob, 'image.jpg');
            
            // 发送OCR请求
            const ocrResponse = await fetch('/ocr', {
                method: 'POST',
                body: formData
            });
            
            if (!ocrResponse.ok) throw new Error('OCR处理失败');
            
            const ocrData = await ocrResponse.json();
            const englishText = ocrData.text;
            ocrResult.value = englishText;
            
            // 显示结果部分并更新流程图
            resultSection.hidden = false;
            updateFlowStatus('ocrDone');
            
            // 第二步：自动翻译
            showLoading('正在翻译文本...');
            
            // 发送翻译请求
            const translationResponse = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: ocrResult.value })
            });
            
            if (!translationResponse.ok) throw new Error('翻译处理失败');
            
            const translationData = await translationResponse.json();
            const chineseText = translationData.text;
            translationResult.value = chineseText;
            
            // 显示翻译结果步骤
            translateStep.hidden = false;
            updateFlowStatus('translateDone');
            
            // 第三步：自动生成语音
            showLoading('正在生成语音...');
            
            // 并行生成英文和中文语音
            const [enAudio, zhAudio] = await Promise.all([
                generateAudio('en', ocrResult.value),
                generateAudio('zh', translationResult.value)
            ]);
            
            // 设置音频源
            englishAudio.src = enAudio;
            chineseAudio.src = zhAudio;
            downloadEnBtn.href = enAudio;
            downloadZhBtn.href = zhAudio;
            
            // 显示音频步骤
            audioStep.hidden = false;
            updateFlowStatus('audioDone');
            hideLoading();
            
        } catch (error) {
            console.error('处理过程中出错:', error);
            alert('处理失败: ' + error.message);
            hideLoading();
        }
    });
    
    // 编辑OCR结果
    editOcrBtn.addEventListener('click', function() {
        // 切换readonly属性
        ocrResult.readOnly = !ocrResult.readOnly;
        
        // 更新按钮文本
        if (ocrResult.readOnly) {
            editOcrBtn.textContent = '编辑';
        } else {
            editOcrBtn.textContent = '完成编辑';
            // 获取焦点
            ocrResult.focus();
        }
    });
    
    // 下载OCR结果
    downloadOcrBtn.addEventListener('click', function() {
        if (!ocrResult.value.trim()) {
            alert('OCR结果为空，无法下载！');
            return;
        }
        
        // 确保编辑完成
        ocrResult.readOnly = true;
        editOcrBtn.textContent = '编辑';
        
        // 创建下载链接
        const blob = new Blob([ocrResult.value], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFileName ? `${originalFileName}_英文.txt` : 'ocr_result_英文.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // 确认OCR结果并翻译
    confirmOcrBtn.addEventListener('click', async () => {
        if (!ocrResult.value.trim()) {
            alert('OCR结果为空，无法进行翻译！');
            return;
        }
        
        showLoading('正在翻译文本...');
        
        try {
            // 发送翻译请求
            const translationResponse = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: ocrResult.value })
            });
            
            if (!translationResponse.ok) throw new Error('翻译处理失败');
            
            const translationData = await translationResponse.json();
            const chineseText = translationData.text;
            translationResult.value = chineseText;
            
            // 显示翻译结果步骤
            translateStep.hidden = false;
            updateFlowStatus('translateDone');
            hideLoading();
            
        } catch (error) {
            console.error('翻译过程中出错:', error);
            alert('翻译失败: ' + error.message);
            hideLoading();
        }
    });
    
    // 编辑翻译结果
    editTranslateBtn.addEventListener('click', function() {
        // 切换readonly属性
        translationResult.readOnly = !translationResult.readOnly;
        
        // 更新按钮文本
        if (translationResult.readOnly) {
            editTranslateBtn.textContent = '编辑';
        } else {
            editTranslateBtn.textContent = '完成编辑';
            // 获取焦点
            translationResult.focus();
        }
    });
    
    // 下载翻译结果
    downloadTranslateBtn.addEventListener('click', function() {
        if (!translationResult.value.trim()) {
            alert('翻译结果为空，无法下载！');
            return;
        }
        
        // 确保编辑完成
        translationResult.readOnly = true;
        editTranslateBtn.textContent = '编辑';
        
        // 创建下载链接
        const blob = new Blob([translationResult.value], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFileName ? `${originalFileName}_中文.txt` : 'translation_result_中文.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // 确认翻译结果并生成语音
    confirmTranslateBtn.addEventListener('click', async () => {
        if (!translationResult.value.trim()) {
            alert('翻译结果为空，无法生成语音！');
            return;
        }
        
        showLoading('正在生成语音...');
        
        try {
            // 并行生成英文和中文语音
            const [enAudio, zhAudio] = await Promise.all([
                generateAudio('en', ocrResult.value),
                generateAudio('zh', translationResult.value)
            ]);
            
            // 设置音频源
            englishAudio.src = enAudio;
            chineseAudio.src = zhAudio;
            downloadEnBtn.href = enAudio;
            downloadZhBtn.href = zhAudio;
            
            // 显示音频步骤
            audioStep.hidden = false;
            updateFlowStatus('audioDone');
            hideLoading();
            
        } catch (error) {
            console.error('语音生成过程中出错:', error);
            alert('语音生成失败: ' + error.message);
            hideLoading();
        }
    });
    
    // 一键重置按钮
    resetAllBtn.addEventListener('click', function() {
        resetUpload();
    });
    
    // 生成音频
    async function generateAudio(lang, text) {
        try {
            const response = await fetch('/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, lang })
            });
            
            if (!response.ok) throw new Error('语音生成失败');
            
            const data = await response.json();
            return data.audio_url;
            
        } catch (error) {
            console.error(`${lang}语音生成失败:`, error);
            throw error;
        }
    }
    
    // 加载状态控制
    function showLoading(text) {
        loadingText.textContent = text || '正在处理中...';
        loadingOverlay.hidden = false;
        loadingOverlay.style.display = 'flex';
    }
    
    function hideLoading() {
        loadingOverlay.hidden = true;
        loadingOverlay.style.display = 'none';
    }

    // 编辑提示词
    editPromptBtn.addEventListener('click', function() {
        // 切换readonly属性
        promptInput.readOnly = !promptInput.readOnly;
        
        // 更新按钮文本和样式
        if (promptInput.readOnly) {
            editPromptBtn.textContent = '编辑';
            promptInput.classList.remove('editing');
        } else {
            editPromptBtn.textContent = '完成编辑';
            promptInput.classList.add('editing');
            // 获取焦点
            promptInput.focus();
        }
    });
    
    // 确认提示词并重新翻译
    retranslateBtn.addEventListener('click', async () => {
        if (!ocrResult.value.trim()) {
            alert('OCR结果为空，无法进行翻译！');
            return;
        }
        
        // 确保提示词编辑完成
        promptInput.readOnly = true;
        editPromptBtn.textContent = '编辑';
        promptInput.classList.remove('editing');
        
        showLoading('正在重新翻译文本...');
        
        try {
            // 发送翻译请求，包含自定义提示词
            const translationResponse = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    text: ocrResult.value,
                    prompt: promptInput.value
                })
            });
            
            if (!translationResponse.ok) throw new Error('翻译处理失败');
            
            const translationData = await translationResponse.json();
            const chineseText = translationData.text;
            translationResult.value = chineseText;
            
            hideLoading();
            
        } catch (error) {
            console.error('翻译过程中出错:', error);
            alert('翻译失败: ' + error.message);
            hideLoading();
        }
    });
    
    // 确认OCR结果并翻译
    confirmOcrBtn.addEventListener('click', async () => {
        if (!ocrResult.value.trim()) {
            alert('OCR结果为空，无法进行翻译！');
            return;
        }
        
        showLoading('正在翻译文本...');
        
        try {
            // 发送翻译请求，包含提示词
            const translationResponse = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    text: ocrResult.value,
                    prompt: promptInput.value
                })
            });
            
            if (!translationResponse.ok) throw new Error('翻译处理失败');
            
            const translationData = await translationResponse.json();
            const chineseText = translationData.text;
            translationResult.value = chineseText;
            
            // 显示翻译结果步骤
            translateStep.hidden = false;
            updateFlowStatus('translateDone');
            hideLoading();
            
        } catch (error) {
            console.error('翻译过程中出错:', error);
            alert('翻译失败: ' + error.message);
            hideLoading();
        }
    });

    // 添加重新生成语音按钮元素获取
    const regenerateAudioBtn = document.getElementById('regenerateAudioBtn');

    // 添加语音上传相关元素获取
    const voiceInput = document.getElementById('voiceInput');
    const uploadVoiceBtn = document.getElementById('uploadVoiceBtn');
    const removeVoiceBtn = document.getElementById('removeVoiceBtn');
    const voiceFileName = document.getElementById('voiceFileName');
    const voicePreview = document.getElementById('voicePreview');
    const voicePreviewAudio = document.getElementById('voicePreviewAudio');
    const voiceText = document.getElementById('voiceText');

    // 存储用户上传的语音文件
    let userVoiceFile = null;

    // 点击上传语音按钮
    uploadVoiceBtn.addEventListener('click', () => {
        voiceInput.click();
    });

    // 处理语音文件选择
    voiceInput.addEventListener('change', () => {
        if (voiceInput.files.length > 0) {
            userVoiceFile = voiceInput.files[0];
            voiceFileName.textContent = userVoiceFile.name;
            removeVoiceBtn.hidden = false;
            
            // 创建预览
            const objectURL = URL.createObjectURL(userVoiceFile);
            voicePreviewAudio.src = objectURL;
            voicePreview.hidden = false;
        }
    });

    // 移除语音文件
    removeVoiceBtn.addEventListener('click', () => {
        userVoiceFile = null;
        voiceInput.value = '';
        voiceFileName.textContent = '未选择文件';
        removeVoiceBtn.hidden = true;
        voicePreview.hidden = true;
        voicePreviewAudio.src = '';
        voiceText.value = '';
    });

    // 修改生成音频函数，支持用户语音
    async function generateAudio(lang, text) {
        try {
            // 准备请求数据
            let requestData = { text, lang };
            
            // 如果有用户上传的语音，添加到请求中
            if (userVoiceFile && voiceText.value.trim()) {
                // 创建FormData对象
                const formData = new FormData();
                formData.append('file', userVoiceFile);
                formData.append('text', voiceText.value.trim());
                formData.append('model', 'FunAudioLLM/CosyVoice2-0.5B');
                formData.append('customName', 'user-voice-' + Date.now());
                
                // 上传用户语音
                showLoading('正在上传参考语音...');
                const uploadResponse = await fetch('/upload_voice', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadResponse.ok) throw new Error('语音上传失败');
                
                const uploadData = await uploadResponse.json();
                requestData.voice_uri = uploadData.uri;
            }
            
            // 生成语音
            showLoading('正在生成语音...');
            const response = await fetch('/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) throw new Error('语音生成失败');
            
            const data = await response.json();
            return data.audio_url;
            
        } catch (error) {
            console.error(`${lang}语音生成失败:`, error);
            throw error;
        }
    }

    // 确认参考语音文本并重新生成语音
    regenerateAudioBtn.addEventListener('click', async () => {
        // 检查是否有已生成的音频
        if (!englishAudio.src ||!chineseAudio.src) {
            alert('请先生成语音！');
            return;
        }

        // 检查是否有上传的语音文件
        if (!userVoiceFile) {
            alert('请先上传参考语音！');
            return;
        }

        // 检查参考语音文本
        if (!voiceText.value.trim()) {
            alert('请输入参考语音的文字内容！');
            return;
        }

        showLoading('正在重新生成语音...');

        try {
            // 并行重新生成英文和中文语音
            const [enAudio, zhAudio] = await Promise.all([
                generateAudio('en', ocrResult.value),
                generateAudio('zh', translationResult.value)
            ]);
            
            // 更新音频源
            englishAudio.src = enAudio;
            chineseAudio.src = zhAudio;
            downloadEnBtn.href = enAudio;
            downloadZhBtn.href = zhAudio;
            
            hideLoading();
            
        } catch (error) {
            console.error('重新生成语音过程中出错:', error);
            alert('重新生成语音失败: ' + error.message);
            hideLoading();
        }
    })

});
