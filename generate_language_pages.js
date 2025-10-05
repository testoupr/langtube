// Script to generate language-specific pages for LangTube
const fs = require('fs');
const path = require('path');

// Language configurations
const languages = {
    'ar': {
        name: 'Arabic',
        native: 'العربية',
        title: 'LangTube - تعلم من خلال مشاهدة الفيديوهات',
        tagline: 'حول فيديوهات يوتيوب إلى تجارب تعليمية تفاعلية',
        content: {
            'Get Started': 'ابدأ',
            'YouTube URL': 'رابط يوتيوب',
            'Make Quiz': 'إنشاء اختبار',
            'Quiz & Summary Language': 'لغة الاختبار والملخص',
            'Choose the language for questions and summaries': 'اختر اللغة للأسئلة والملخصات',
            'OR': 'أو',
            'Paste Transcript Manually': 'الصق النص يدوياً',
            'Paste your YouTube transcript here (timestamps will be cleaned automatically)...': 'الصق نص يوتيوب هنا (ستتم إزالة الطوابع الزمنية تلقائياً)...',
            'Process Transcript': 'معالجة النص',
            'Processing Video Content': 'معالجة محتوى الفيديو',
            'Analyzing transcript...': 'تحليل النص...',
            'Video Summary': 'ملخص الفيديو',
            'Start Quiz': 'بدء الاختبار',
            'View Full Transcript': 'عرض النص الكامل',
            'Full Transcript': 'النص الكامل',
            'Knowledge Quiz': 'اختبار المعرفة',
            'Question 1 of 5': 'السؤال 1 من 5',
            'Quiz Results': 'نتائج الاختبار',
            'Great job!': 'عمل رائع!',
            'Retake Quiz': 'إعادة الاختبار',
            'Analyze New Video': 'تحليل فيديو جديد',
            'Previous Attempts': 'المحاولات السابقة',
            'Built with ❤️ for better learning': 'صُنع بـ ❤️ للتعلم الأفضل'
        }
    },
    'hi': {
        name: 'Hindi',
        native: 'हिन्दी',
        title: 'LangTube - वीडियो देखकर सीखें',
        tagline: 'YouTube वीडियो को इंटरैक्टिव लर्निंग अनुभव में बदलें',
        content: {
            'Get Started': 'शुरू करें',
            'YouTube URL': 'YouTube URL',
            'Make Quiz': 'क्विज बनाएं',
            'Quiz & Summary Language': 'क्विज और सारांश भाषा',
            'Choose the language for questions and summaries': 'प्रश्नों और सारांश के लिए भाषा चुनें',
            'OR': 'या',
            'Paste Transcript Manually': 'ट्रांसक्रिप्ट मैन्युअली पेस्ट करें',
            'Paste your YouTube transcript here (timestamps will be cleaned automatically)...': 'अपना YouTube ट्रांसक्रिप्ट यहाँ पेस्ट करें (टाइमस्टैम्प्स स्वचालित रूप से साफ हो जाएंगे)...',
            'Process Transcript': 'ट्रांसक्रिप्ट प्रोसेस करें',
            'Processing Video Content': 'वीडियो कंटेंट प्रोसेसिंग',
            'Analyzing transcript...': 'ट्रांसक्रिप्ट का विश्लेषण...',
            'Video Summary': 'वीडियो सारांश',
            'Start Quiz': 'क्विज शुरू करें',
            'View Full Transcript': 'पूरा ट्रांसक्रिप्ट देखें',
            'Full Transcript': 'पूरा ट्रांसक्रिप्ट',
            'Knowledge Quiz': 'ज्ञान क्विज',
            'Question 1 of 5': 'प्रश्न 1/5',
            'Quiz Results': 'क्विज परिणाम',
            'Great job!': 'बहुत बढ़िया!',
            'Retake Quiz': 'क्विज दोबारा करें',
            'Analyze New Video': 'नया वीडियो एनालाइज़ करें',
            'Previous Attempts': 'पिछले प्रयास',
            'Built with ❤️ for better learning': 'बेहतर सीखने के लिए ❤️ से बनाया गया'
        }
    },
    'pt': {
        name: 'Portuguese',
        native: 'Português',
        title: 'LangTube - Aprenda assistindo vídeos',
        tagline: 'Transforme vídeos do YouTube em experiências de aprendizado interativas',
        content: {
            'Get Started': 'Começar',
            'YouTube URL': 'URL do YouTube',
            'Make Quiz': 'Criar Quiz',
            'Quiz & Summary Language': 'Idioma do Quiz e Resumo',
            'Choose the language for questions and summaries': 'Escolha o idioma para perguntas e resumos',
            'OR': 'OU',
            'Paste Transcript Manually': 'Colar Transcrição Manualmente',
            'Paste your YouTube transcript here (timestamps will be cleaned automatically)...': 'Cole sua transcrição do YouTube aqui (timestamps serão limpos automaticamente)...',
            'Process Transcript': 'Processar Transcrição',
            'Processing Video Content': 'Processando Conteúdo do Vídeo',
            'Analyzing transcript...': 'Analisando transcrição...',
            'Video Summary': 'Resumo do Vídeo',
            'Start Quiz': 'Iniciar Quiz',
            'View Full Transcript': 'Ver Transcrição Completa',
            'Full Transcript': 'Transcrição Completa',
            'Knowledge Quiz': 'Quiz de Conhecimento',
            'Question 1 of 5': 'Pergunta 1 de 5',
            'Quiz Results': 'Resultados do Quiz',
            'Great job!': 'Ótimo trabalho!',
            'Retake Quiz': 'Refazer Quiz',
            'Analyze New Video': 'Analisar Novo Vídeo',
            'Previous Attempts': 'Tentativas Anteriores',
            'Built with ❤️ for better learning': 'Construído com ❤️ para melhor aprendizado'
        }
    },
    'ru': {
        name: 'Russian',
        native: 'Русский',
        title: 'LangTube - Учитесь, смотря видео',
        tagline: 'Превращайте видео YouTube в интерактивные обучающие опыты',
        content: {
            'Get Started': 'Начать',
            'YouTube URL': 'URL YouTube',
            'Make Quiz': 'Создать Викторину',
            'Quiz & Summary Language': 'Язык Викторины и Резюме',
            'Choose the language for questions and summaries': 'Выберите язык для вопросов и резюме',
            'OR': 'ИЛИ',
            'Paste Transcript Manually': 'Вставить Транскрипт Вручную',
            'Paste your YouTube transcript here (timestamps will be cleaned automatically)...': 'Вставьте ваш YouTube транскрипт здесь (временные метки будут очищены автоматически)...',
            'Process Transcript': 'Обработать Транскрипт',
            'Processing Video Content': 'Обработка Содержимого Видео',
            'Analyzing transcript...': 'Анализ транскрипта...',
            'Video Summary': 'Резюме Видео',
            'Start Quiz': 'Начать Викторину',
            'View Full Transcript': 'Просмотреть Полный Транскрипт',
            'Full Transcript': 'Полный Транскрипт',
            'Knowledge Quiz': 'Викторина Знаний',
            'Question 1 of 5': 'Вопрос 1 из 5',
            'Quiz Results': 'Результаты Викторины',
            'Great job!': 'Отличная работа!',
            'Retake Quiz': 'Повторить Викторину',
            'Analyze New Video': 'Анализировать Новое Видео',
            'Previous Attempts': 'Предыдущие Попытки',
            'Built with ❤️ for better learning': 'Создано с ❤️ для лучшего обучения'
        }
    },
    'it': {
        name: 'Italian',
        native: 'Italiano',
        title: 'LangTube - Impara guardando video',
        tagline: 'Trasforma i video di YouTube in esperienze di apprendimento interattive',
        content: {
            'Get Started': 'Inizia',
            'YouTube URL': 'URL YouTube',
            'Make Quiz': 'Crea Quiz',
            'Quiz & Summary Language': 'Lingua del Quiz e Riepilogo',
            'Choose the language for questions and summaries': 'Scegli la lingua per domande e riepiloghi',
            'OR': 'OPPURE',
            'Paste Transcript Manually': 'Incolla Trascrizione Manualmente',
            'Paste your YouTube transcript here (timestamps will be cleaned automatically)...': 'Incolla qui la tua trascrizione YouTube (i timestamp verranno puliti automaticamente)...',
            'Process Transcript': 'Elabora Trascrizione',
            'Processing Video Content': 'Elaborazione Contenuto Video',
            'Analyzing transcript...': 'Analisi trascrizione...',
            'Video Summary': 'Riepilogo Video',
            'Start Quiz': 'Inizia Quiz',
            'View Full Transcript': 'Visualizza Trascrizione Completa',
            'Full Transcript': 'Trascrizione Completa',
            'Knowledge Quiz': 'Quiz di Conoscenza',
            'Question 1 of 5': 'Domanda 1 di 5',
            'Quiz Results': 'Risultati Quiz',
            'Great job!': 'Ottimo lavoro!',
            'Retake Quiz': 'Rifai Quiz',
            'Analyze New Video': 'Analizza Nuovo Video',
            'Previous Attempts': 'Tentativi Precedenti',
            'Built with ❤️ for better learning': 'Costruito con ❤️ per un apprendimento migliore'
        }
    }
};

// Template function to generate HTML for a language
function generateLanguagePage(langCode, langConfig) {
    const content = langConfig.content;
    
    return `<!DOCTYPE html>
<html lang="${langCode}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${langConfig.title}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🎬</text></svg>">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="logo">LangTube</h1>
            <p class="tagline">${langConfig.tagline}</p>
        </header>

        <main class="main">
            <!-- Step 1: Input Section -->
            <section id="input-section" class="section active">
                <h2>${content['Get Started']}</h2>
                <div class="input-group">
                    <label for="youtube-url">${content['YouTube URL']}</label>
                    <div class="url-input-wrapper">
                        <input 
                            type="text" 
                            id="youtube-url" 
                            placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                            aria-label="${content['YouTube URL']}"
                        />
                        <button id="fetch-transcript-btn" class="btn btn-primary">
                            <span class="btn-text">${content['Make Quiz']}</span>
                            <span class="spinner hidden"></span>
                        </button>
                    </div>
                    <div class="error-message hidden" id="url-error"></div>
                </div>

                <!-- Language Selection -->
                <div class="language-selection">
                    <div class="input-group language-group-single">
                        <label for="target-language">
                            <span class="label-main">${content['Quiz & Summary Language']}</span>
                            <span class="label-hint">${content['Choose the language for questions and summaries']}</span>
                        </label>
                        <select id="target-language" aria-label="${content['Quiz & Summary Language']}">
                            <option value="${langCode}">${langConfig.name} (${langConfig.native})</option>
                            <option value="en">English</option>
                            <option value="ar">Arabic (العربية)</option>
                            <option value="bn">Bengali (বাংলা)</option>
                            <option value="bg">Bulgarian (Български)</option>
                            <option value="zh">Chinese (中文)</option>
                            <option value="hr">Croatian (Hrvatski)</option>
                            <option value="cs">Czech (Čeština)</option>
                            <option value="da">Danish (Dansk)</option>
                            <option value="nl">Dutch (Nederlands)</option>
                            <option value="et">Estonian (Eesti)</option>
                            <option value="fi">Finnish (Suomi)</option>
                            <option value="fr">French (Français)</option>
                            <option value="de">German (Deutsch)</option>
                            <option value="el">Greek (Ελληνικά)</option>
                            <option value="he">Hebrew (עברית)</option>
                            <option value="hi">Hindi (हिन्दी)</option>
                            <option value="hu">Hungarian (Magyar)</option>
                            <option value="id">Indonesian (Bahasa Indonesia)</option>
                            <option value="it">Italian (Italiano)</option>
                            <option value="ja">Japanese (日本語)</option>
                            <option value="ko">Korean (한국어)</option>
                            <option value="lv">Latvian (Latviešu)</option>
                            <option value="lt">Lithuanian (Lietuvių)</option>
                            <option value="no">Norwegian (Norsk)</option>
                            <option value="pl">Polish (Polski)</option>
                            <option value="pt">Portuguese (Português)</option>
                            <option value="ro">Romanian (Română)</option>
                            <option value="ru">Russian (Русский)</option>
                            <option value="sr">Serbian (Српски)</option>
                            <option value="sk">Slovak (Slovenčina)</option>
                            <option value="sl">Slovenian (Slovenščina)</option>
                            <option value="es">Spanish (Español)</option>
                            <option value="sw">Swahili (Kiswahili)</option>
                            <option value="sv">Swedish (Svenska)</option>
                            <option value="th">Thai (ไทย)</option>
                            <option value="tr">Turkish (Türkçe)</option>
                            <option value="uk">Ukrainian (Українська)</option>
                            <option value="vi">Vietnamese (Tiếng Việt)</option>
                        </select>
                    </div>
                </div>

                <div class="divider">
                    <span>${content['OR']}</span>
                </div>

                <div class="input-group">
                    <label for="manual-transcript">${content['Paste Transcript Manually']}</label>
                    <textarea 
                        id="manual-transcript" 
                        rows="8" 
                        placeholder="${content['Paste your YouTube transcript here (timestamps will be cleaned automatically)...']}"
                        aria-label="${content['Paste Transcript Manually']}"
                    ></textarea>
                    <button id="process-manual-btn" class="btn btn-secondary">
                        ${content['Process Transcript']}
                    </button>
                </div>
            </section>

            <!-- Step 2: Processing/Loading Section -->
            <section id="processing-section" class="section hidden">
                <div class="loading-state">
                    <div class="spinner-large"></div>
                    <h3>${content['Processing Video Content']}</h3>
                    <p id="processing-status">${content['Analyzing transcript...']}</p>
                </div>
            </section>

            <!-- Step 3: Summary Section -->
            <section id="summary-section" class="section hidden">
                <h2>${content['Video Summary']}</h2>
                <div class="video-info" id="video-info"></div>
                <div class="summary-content" id="summary-content"></div>
                <div class="action-buttons">
                    <button id="start-quiz-btn" class="btn btn-primary">${content['Start Quiz']}</button>
                    <button id="view-transcript-btn" class="btn btn-secondary">${content['View Full Transcript']}</button>
                </div>
            </section>

            <!-- Transcript Modal -->
            <div id="transcript-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${content['Full Transcript']}</h3>
                        <button class="close-btn" id="close-transcript-modal">&times;</button>
                    </div>
                    <div class="modal-body" id="transcript-modal-body"></div>
                </div>
            </div>

            <!-- Step 4: Quiz Section -->
            <section id="quiz-section" class="section hidden">
                <div class="quiz-header">
                    <h2>${content['Knowledge Quiz']}</h2>
                    <div class="quiz-progress">
                        <span id="quiz-progress-text">${content['Question 1 of 5']}</span>
                    </div>
                </div>
                <div id="quiz-container"></div>
            </section>

            <!-- Step 5: Results Section -->
            <section id="results-section" class="section hidden">
                <div class="results-header">
                    <h2>${content['Quiz Results']}</h2>
                    <div class="score-display">
                        <div class="score-circle">
                            <span id="score-percentage">0%</span>
                        </div>
                        <p id="score-message">${content['Great job!']}</p>
                    </div>
                </div>
                <div id="results-details"></div>
                <div class="action-buttons">
                    <button id="retake-quiz-btn" class="btn btn-primary">${content['Retake Quiz']}</button>
                    <button id="new-video-btn" class="btn btn-secondary">${content['Analyze New Video']}</button>
                </div>
                <div class="history-section">
                    <h3>${content['Previous Attempts']}</h3>
                    <div id="attempt-history"></div>
                </div>
            </section>
        </main>

        <footer class="footer">
            <p>${content['Built with ❤️ for better learning']}</p>
        </footer>
    </div>

    <script src="app.js"></script>
</body>
</html>`;
}

// Generate pages for each language
Object.entries(languages).forEach(([langCode, langConfig]) => {
    const html = generateLanguagePage(langCode, langConfig);
    const filename = `${langCode}.html`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, html, 'utf8');
    console.log(`Generated ${filename}`);
});

console.log('Language pages generated successfully!');
