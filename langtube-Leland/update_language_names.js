// Script to update all language pages with proper endonyms and exonyms
const fs = require('fs');
const path = require('path');

// Language configurations with endonyms and exonyms
const languageNames = {
    'index.html': {
        currentText: '🇺🇸 English',
        options: {
            'index.html': '🇺🇸 English',
            'spanish.html': '🇪🇸 Español / Spanish',
            'french.html': '🇫🇷 Français / French',
            'german.html': '🇩🇪 Deutsch / German',
            'chinese.html': '🇨🇳 中文 / Chinese',
            'japanese.html': '🇯🇵 日本語 / Japanese',
            'korean.html': '🇰🇷 한국어 / Korean',
            'arabic.html': '🇸🇦 العربية / Arabic',
            'hindi.html': '🇮🇳 हिन्दी / Hindi',
            'portuguese.html': '🇵🇹 Português / Portuguese',
            'russian.html': '🇷🇺 Русский / Russian',
            'italian.html': '🇮🇹 Italiano / Italian',
            'languages.html': '🌍 All Languages'
        }
    },
    'spanish.html': {
        currentText: '🇪🇸 Español',
        options: {
            'index.html': '🇺🇸 English / Inglés',
            'spanish.html': '🇪🇸 Español',
            'french.html': '🇫🇷 Français / Francés',
            'german.html': '🇩🇪 Deutsch / Alemán',
            'chinese.html': '🇨🇳 中文 / Chino',
            'japanese.html': '🇯🇵 日本語 / Japonés',
            'korean.html': '🇰🇷 한국어 / Coreano',
            'arabic.html': '🇸🇦 العربية / Árabe',
            'hindi.html': '🇮🇳 हिन्दी / Hindi',
            'portuguese.html': '🇵🇹 Português / Portugués',
            'russian.html': '🇷🇺 Русский / Ruso',
            'italian.html': '🇮🇹 Italiano / Italiano',
            'languages.html': '🌍 All Languages / Todos los Idiomas'
        }
    },
    'french.html': {
        currentText: '🇫🇷 Français',
        options: {
            'index.html': '🇺🇸 English / Anglais',
            'spanish.html': '🇪🇸 Español / Espagnol',
            'french.html': '🇫🇷 Français',
            'german.html': '🇩🇪 Deutsch / Allemand',
            'chinese.html': '🇨🇳 中文 / Chinois',
            'japanese.html': '🇯🇵 日本語 / Japonais',
            'korean.html': '🇰🇷 한국어 / Coréen',
            'arabic.html': '🇸🇦 العربية / Arabe',
            'hindi.html': '🇮🇳 हिन्दी / Hindi',
            'portuguese.html': '🇵🇹 Português / Portugais',
            'russian.html': '🇷🇺 Русский / Russe',
            'italian.html': '🇮🇹 Italiano / Italien',
            'languages.html': '🌍 All Languages / Toutes les Langues'
        }
    },
    'german.html': {
        currentText: '🇩🇪 Deutsch',
        options: {
            'index.html': '🇺🇸 English / Englisch',
            'spanish.html': '🇪🇸 Español / Spanisch',
            'french.html': '🇫🇷 Français / Französisch',
            'german.html': '🇩🇪 Deutsch',
            'chinese.html': '🇨🇳 中文 / Chinesisch',
            'japanese.html': '🇯🇵 日本語 / Japanisch',
            'korean.html': '🇰🇷 한국어 / Koreanisch',
            'arabic.html': '🇸🇦 العربية / Arabisch',
            'hindi.html': '🇮🇳 हिन्दी / Hindi',
            'portuguese.html': '🇵🇹 Português / Portugiesisch',
            'russian.html': '🇷🇺 Русский / Russisch',
            'italian.html': '🇮🇹 Italiano / Italienisch',
            'languages.html': '🌍 All Languages / Alle Sprachen'
        }
    },
    'chinese.html': {
        currentText: '🇨🇳 中文',
        options: {
            'index.html': '🇺🇸 English / 英语',
            'spanish.html': '🇪🇸 Español / 西班牙语',
            'french.html': '🇫🇷 Français / 法语',
            'german.html': '🇩🇪 Deutsch / 德语',
            'chinese.html': '🇨🇳 中文',
            'japanese.html': '🇯🇵 日本語 / 日语',
            'korean.html': '🇰🇷 한국어 / 韩语',
            'arabic.html': '🇸🇦 العربية / 阿拉伯语',
            'hindi.html': '🇮🇳 हिन्दी / 印地语',
            'portuguese.html': '🇵🇹 Português / 葡萄牙语',
            'russian.html': '🇷🇺 Русский / 俄语',
            'italian.html': '🇮🇹 Italiano / 意大利语',
            'languages.html': '🌍 All Languages / 所有语言'
        }
    },
    'japanese.html': {
        currentText: '🇯🇵 日本語',
        options: {
            'index.html': '🇺🇸 English / 英語',
            'spanish.html': '🇪🇸 Español / スペイン語',
            'french.html': '🇫🇷 Français / フランス語',
            'german.html': '🇩🇪 Deutsch / ドイツ語',
            'chinese.html': '🇨🇳 中文 / 中国語',
            'japanese.html': '🇯🇵 日本語',
            'korean.html': '🇰🇷 한국어 / 韓国語',
            'arabic.html': '🇸🇦 العربية / アラビア語',
            'hindi.html': '🇮🇳 हिन्दी / ヒンディー語',
            'portuguese.html': '🇵🇹 Português / ポルトガル語',
            'russian.html': '🇷🇺 Русский / ロシア語',
            'italian.html': '🇮🇹 Italiano / イタリア語',
            'languages.html': '🌍 All Languages / すべての言語'
        }
    },
    'korean.html': {
        currentText: '🇰🇷 한국어',
        options: {
            'index.html': '🇺🇸 English / 영어',
            'spanish.html': '🇪🇸 Español / 스페인어',
            'french.html': '🇫🇷 Français / 프랑스어',
            'german.html': '🇩🇪 Deutsch / 독일어',
            'chinese.html': '🇨🇳 中文 / 중국어',
            'japanese.html': '🇯🇵 日本語 / 일본어',
            'korean.html': '🇰🇷 한국어',
            'arabic.html': '🇸🇦 العربية / 아랍어',
            'hindi.html': '🇮🇳 हिन्दी / 힌디어',
            'portuguese.html': '🇵🇹 Português / 포르투갈어',
            'russian.html': '🇷🇺 Русский / 러시아어',
            'italian.html': '🇮🇹 Italiano / 이탈리아어',
            'languages.html': '🌍 All Languages / 모든 언어'
        }
    },
    'arabic.html': {
        currentText: '🇸🇦 العربية',
        options: {
            'index.html': '🇺🇸 English / الإنجليزية',
            'spanish.html': '🇪🇸 Español / الإسبانية',
            'french.html': '🇫🇷 Français / الفرنسية',
            'german.html': '🇩🇪 Deutsch / الألمانية',
            'chinese.html': '🇨🇳 中文 / الصينية',
            'japanese.html': '🇯🇵 日本語 / اليابانية',
            'korean.html': '🇰🇷 한국어 / الكورية',
            'arabic.html': '🇸🇦 العربية',
            'hindi.html': '🇮🇳 हिन्दी / الهندية',
            'portuguese.html': '🇵🇹 Português / البرتغالية',
            'russian.html': '🇷🇺 Русский / الروسية',
            'italian.html': '🇮🇹 Italiano / الإيطالية',
            'languages.html': '🌍 All Languages / جميع اللغات'
        }
    },
    'hindi.html': {
        currentText: '🇮🇳 हिन्दी',
        options: {
            'index.html': '🇺🇸 English / अंग्रेजी',
            'spanish.html': '🇪🇸 Español / स्पेनिश',
            'french.html': '🇫🇷 Français / फ्रेंच',
            'german.html': '🇩🇪 Deutsch / जर्मन',
            'chinese.html': '🇨🇳 中文 / चीनी',
            'japanese.html': '🇯🇵 日本語 / जापानी',
            'korean.html': '🇰🇷 한국어 / कोरियाई',
            'arabic.html': '🇸🇦 العربية / अरबी',
            'hindi.html': '🇮🇳 हिन्दी',
            'portuguese.html': '🇵🇹 Português / पुर्तगाली',
            'russian.html': '🇷🇺 Русский / रूसी',
            'italian.html': '🇮🇹 Italiano / इतालवी',
            'languages.html': '🌍 All Languages / सभी भाषाएं'
        }
    },
    'portuguese.html': {
        currentText: '🇵🇹 Português',
        options: {
            'index.html': '🇺🇸 English / Inglês',
            'spanish.html': '🇪🇸 Español / Espanhol',
            'french.html': '🇫🇷 Français / Francês',
            'german.html': '🇩🇪 Deutsch / Alemão',
            'chinese.html': '🇨🇳 中文 / Chinês',
            'japanese.html': '🇯🇵 日本語 / Japonês',
            'korean.html': '🇰🇷 한국어 / Coreano',
            'arabic.html': '🇸🇦 العربية / Árabe',
            'hindi.html': '🇮🇳 हिन्दी / Hindi',
            'portuguese.html': '🇵🇹 Português',
            'russian.html': '🇷🇺 Русский / Russo',
            'italian.html': '🇮🇹 Italiano / Italiano',
            'languages.html': '🌍 All Languages / Todos os Idiomas'
        }
    },
    'russian.html': {
        currentText: '🇷🇺 Русский',
        options: {
            'index.html': '🇺🇸 English / Английский',
            'spanish.html': '🇪🇸 Español / Испанский',
            'french.html': '🇫🇷 Français / Французский',
            'german.html': '🇩🇪 Deutsch / Немецкий',
            'chinese.html': '🇨🇳 中文 / Китайский',
            'japanese.html': '🇯🇵 日本語 / Японский',
            'korean.html': '🇰🇷 한국어 / Корейский',
            'arabic.html': '🇸🇦 العربية / Арабский',
            'hindi.html': '🇮🇳 हिन्दी / Хинди',
            'portuguese.html': '🇵🇹 Português / Португальский',
            'russian.html': '🇷🇺 Русский',
            'italian.html': '🇮🇹 Italiano / Итальянский',
            'languages.html': '🌍 All Languages / Все Языки'
        }
    },
    'italian.html': {
        currentText: '🇮🇹 Italiano',
        options: {
            'index.html': '🇺🇸 English / Inglese',
            'spanish.html': '🇪🇸 Español / Spagnolo',
            'french.html': '🇫🇷 Français / Francese',
            'german.html': '🇩🇪 Deutsch / Tedesco',
            'chinese.html': '🇨🇳 中文 / Cinese',
            'japanese.html': '🇯🇵 日本語 / Giapponese',
            'korean.html': '🇰🇷 한국어 / Coreano',
            'arabic.html': '🇸🇦 العربية / Arabo',
            'hindi.html': '🇮🇳 हिन्दी / Hindi',
            'portuguese.html': '🇵🇹 Português / Portoghese',
            'russian.html': '🇷🇺 Русский / Russo',
            'italian.html': '🇮🇹 Italiano',
            'languages.html': '🌍 All Languages / Tutte le Lingue'
        }
    },
    'languages.html': {
        currentText: '🌍 All Languages',
        options: {
            'index.html': '🇺🇸 English',
            'spanish.html': '🇪🇸 Español / Spanish',
            'french.html': '🇫🇷 Français / French',
            'german.html': '🇩🇪 Deutsch / German',
            'chinese.html': '🇨🇳 中文 / Chinese',
            'japanese.html': '🇯🇵 日本語 / Japanese',
            'korean.html': '🇰🇷 한국어 / Korean',
            'arabic.html': '🇸🇦 العربية / Arabic',
            'hindi.html': '🇮🇳 हिन्दी / Hindi',
            'portuguese.html': '🇵🇹 Português / Portuguese',
            'russian.html': '🇷🇺 Русский / Russian',
            'italian.html': '🇮🇹 Italiano / Italian',
            'languages.html': '🌍 All Languages'
        }
    }
};

// Function to update language names in a file
function updateLanguageNames(filePath, languageConfig) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Update current language text
        const currentLangPattern = /<span class="current-language" id="current-language">[^<]*<\/span>/;
        content = content.replace(currentLangPattern, `<span class="current-language" id="current-language">${languageConfig.currentText}</span>`);
        
        // Update dropdown options
        Object.entries(languageConfig.options).forEach(([file, name]) => {
            const optionPattern = new RegExp(`<a href="${file}"[^>]*>[^<]*</a>`);
            const newOption = `<a href="${file}" class="language-option" data-lang="${getLangCode(file)}">${name}</a>`;
            content = content.replace(optionPattern, newOption);
        });
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated language names in ${filePath}`);
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// Helper function to get language code from filename
function getLangCode(filename) {
    const langMap = {
        'index.html': 'en',
        'spanish.html': 'es',
        'french.html': 'fr',
        'german.html': 'de',
        'chinese.html': 'zh',
        'japanese.html': 'ja',
        'korean.html': 'ko',
        'arabic.html': 'ar',
        'hindi.html': 'hi',
        'portuguese.html': 'pt',
        'russian.html': 'ru',
        'italian.html': 'it',
        'languages.html': 'all'
    };
    return langMap[filename] || 'en';
}

// Update all language files
Object.entries(languageNames).forEach(([file, config]) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        updateLanguageNames(filePath, config);
    } else {
        console.log(`File ${file} does not exist, skipping...`);
    }
});

console.log('Language names update completed!');
