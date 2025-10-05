// Script to update all language pages with proper endonyms and exonyms
const fs = require('fs');
const path = require('path');

// Language configurations with endonyms and exonyms
const languageNames = {
    '../index.html': {
        currentText: '🇺🇸 English',
        options: {
            '../index.html': '🇺🇸 English',
            '../languages/spanish.html': '🇪🇸 Español / Spanish',
            '../languages/french.html': '🇫🇷 Français / French',
            '../languages/german.html': '🇩🇪 Deutsch / German',
            '../languages/chinese.html': '🇨🇳 中文 / Chinese',
            '../languages/japanese.html': '🇯🇵 日本語 / Japanese',
            '../languages/korean.html': '🇰🇷 한국어 / Korean',
            '../languages/arabic.html': '🇸🇦 العربية / Arabic',
            '../languages/hindi.html': '🇮🇳 हिन्दी / Hindi',
            '../languages/portuguese.html': '🇵🇹 Português / Portuguese',
            '../languages/russian.html': '🇷🇺 Русский / Russian',
            '../languages/italian.html': '🇮🇹 Italiano / Italian',
            '../languages/languages.html': '🌍 All Languages'
        }
    },
    '../languages/spanish.html': {
        currentText: '🇪🇸 Español',
        options: {
            '../index.html': '🇺🇸 English / Inglés',
            '../languages/spanish.html': '🇪🇸 Español',
            '../languages/french.html': '🇫🇷 Français / Francés',
            '../languages/german.html': '🇩🇪 Deutsch / Alemán',
            '../languages/chinese.html': '🇨🇳 中文 / Chino',
            '../languages/japanese.html': '🇯🇵 日本語 / Japonés',
            '../languages/korean.html': '🇰🇷 한국어 / Coreano',
            '../languages/arabic.html': '🇸🇦 العربية / Árabe',
            '../languages/hindi.html': '🇮🇳 हिन्दी / Hindi',
            '../languages/portuguese.html': '🇵🇹 Português / Portugués',
            '../languages/russian.html': '🇷🇺 Русский / Ruso',
            '../languages/italian.html': '🇮🇹 Italiano / Italiano',
            '../languages/languages.html': '🌍 All Languages / Todos los Idiomas'
        }
    },
    '../languages/french.html': {
        currentText: '🇫🇷 Français',
        options: {
            '../index.html': '🇺🇸 English / Anglais',
            '../languages/spanish.html': '🇪🇸 Español / Espagnol',
            '../languages/french.html': '🇫🇷 Français',
            '../languages/german.html': '🇩🇪 Deutsch / Allemand',
            '../languages/chinese.html': '🇨🇳 中文 / Chinois',
            '../languages/japanese.html': '🇯🇵 日本語 / Japonais',
            '../languages/korean.html': '🇰🇷 한국어 / Coréen',
            '../languages/arabic.html': '🇸🇦 العربية / Arabe',
            '../languages/hindi.html': '🇮🇳 हिन्दी / Hindi',
            '../languages/portuguese.html': '🇵🇹 Português / Portugais',
            '../languages/russian.html': '🇷🇺 Русский / Russe',
            '../languages/italian.html': '🇮🇹 Italiano / Italien',
            '../languages/languages.html': '🌍 All Languages / Toutes les Langues'
        }
    },
    '../languages/german.html': {
        currentText: '🇩🇪 Deutsch',
        options: {
            '../index.html': '🇺🇸 English / Englisch',
            '../languages/spanish.html': '🇪🇸 Español / Spanisch',
            '../languages/french.html': '🇫🇷 Français / Französisch',
            '../languages/german.html': '🇩🇪 Deutsch',
            '../languages/chinese.html': '🇨🇳 中文 / Chinesisch',
            '../languages/japanese.html': '🇯🇵 日本語 / Japanisch',
            '../languages/korean.html': '🇰🇷 한국어 / Koreanisch',
            '../languages/arabic.html': '🇸🇦 العربية / Arabisch',
            '../languages/hindi.html': '🇮🇳 हिन्दी / Hindi',
            '../languages/portuguese.html': '🇵🇹 Português / Portugiesisch',
            '../languages/russian.html': '🇷🇺 Русский / Russisch',
            '../languages/italian.html': '🇮🇹 Italiano / Italienisch',
            '../languages/languages.html': '🌍 All Languages / Alle Sprachen'
        }
    },
    '../languages/chinese.html': {
        currentText: '🇨🇳 中文',
        options: {
            '../index.html': '🇺🇸 English / 英语',
            '../languages/spanish.html': '🇪🇸 Español / 西班牙语',
            '../languages/french.html': '🇫🇷 Français / 法语',
            '../languages/german.html': '🇩🇪 Deutsch / 德语',
            '../languages/chinese.html': '🇨🇳 中文',
            '../languages/japanese.html': '🇯🇵 日本語 / 日语',
            '../languages/korean.html': '🇰🇷 한국어 / 韩语',
            '../languages/arabic.html': '🇸🇦 العربية / 阿拉伯语',
            '../languages/hindi.html': '🇮🇳 हिन्दी / 印地语',
            '../languages/portuguese.html': '🇵🇹 Português / 葡萄牙语',
            '../languages/russian.html': '🇷🇺 Русский / 俄语',
            '../languages/italian.html': '🇮🇹 Italiano / 意大利语',
            '../languages/languages.html': '🌍 All Languages / 所有语言'
        }
    },
    '../languages/japanese.html': {
        currentText: '🇯🇵 日本語',
        options: {
            '../index.html': '🇺🇸 English / 英語',
            '../languages/spanish.html': '🇪🇸 Español / スペイン語',
            '../languages/french.html': '🇫🇷 Français / フランス語',
            '../languages/german.html': '🇩🇪 Deutsch / ドイツ語',
            '../languages/chinese.html': '🇨🇳 中文 / 中国語',
            '../languages/japanese.html': '🇯🇵 日本語',
            '../languages/korean.html': '🇰🇷 한국어 / 韓国語',
            '../languages/arabic.html': '🇸🇦 العربية / アラビア語',
            '../languages/hindi.html': '🇮🇳 हिन्दी / ヒンディー語',
            '../languages/portuguese.html': '🇵🇹 Português / ポルトガル語',
            '../languages/russian.html': '🇷🇺 Русский / ロシア語',
            '../languages/italian.html': '🇮🇹 Italiano / イタリア語',
            '../languages/languages.html': '🌍 All Languages / すべての言語'
        }
    },
    '../languages/korean.html': {
        currentText: '🇰🇷 한국어',
        options: {
            '../index.html': '🇺🇸 English / 영어',
            '../languages/spanish.html': '🇪🇸 Español / 스페인어',
            '../languages/french.html': '🇫🇷 Français / 프랑스어',
            '../languages/german.html': '🇩🇪 Deutsch / 독일어',
            '../languages/chinese.html': '🇨🇳 中文 / 중국어',
            '../languages/japanese.html': '🇯🇵 日本語 / 일본어',
            '../languages/korean.html': '🇰🇷 한국어',
            '../languages/arabic.html': '🇸🇦 العربية / 아랍어',
            '../languages/hindi.html': '🇮🇳 हिन्दी / 힌디어',
            '../languages/portuguese.html': '🇵🇹 Português / 포르투갈어',
            '../languages/russian.html': '🇷🇺 Русский / 러시아어',
            '../languages/italian.html': '🇮🇹 Italiano / 이탈리아어',
            '../languages/languages.html': '🌍 All Languages / 모든 언어'
        }
    },
    '../languages/arabic.html': {
        currentText: '🇸🇦 العربية',
        options: {
            '../index.html': '🇺🇸 English / الإنجليزية',
            '../languages/spanish.html': '🇪🇸 Español / الإسبانية',
            '../languages/french.html': '🇫🇷 Français / الفرنسية',
            '../languages/german.html': '🇩🇪 Deutsch / الألمانية',
            '../languages/chinese.html': '🇨🇳 中文 / الصينية',
            '../languages/japanese.html': '🇯🇵 日本語 / اليابانية',
            '../languages/korean.html': '🇰🇷 한국어 / الكورية',
            '../languages/arabic.html': '🇸🇦 العربية',
            '../languages/hindi.html': '🇮🇳 हिन्दी / الهندية',
            '../languages/portuguese.html': '🇵🇹 Português / البرتغالية',
            '../languages/russian.html': '🇷🇺 Русский / الروسية',
            '../languages/italian.html': '🇮🇹 Italiano / الإيطالية',
            '../languages/languages.html': '🌍 All Languages / جميع اللغات'
        }
    },
    '../languages/hindi.html': {
        currentText: '🇮🇳 हिन्दी',
        options: {
            '../index.html': '🇺🇸 English / अंग्रेजी',
            '../languages/spanish.html': '🇪🇸 Español / स्पेनिश',
            '../languages/french.html': '🇫🇷 Français / फ्रेंच',
            '../languages/german.html': '🇩🇪 Deutsch / जर्मन',
            '../languages/chinese.html': '🇨🇳 中文 / चीनी',
            '../languages/japanese.html': '🇯🇵 日本語 / जापानी',
            '../languages/korean.html': '🇰🇷 한국어 / कोरियाई',
            '../languages/arabic.html': '🇸🇦 العربية / अरबी',
            '../languages/hindi.html': '🇮🇳 हिन्दी',
            '../languages/portuguese.html': '🇵🇹 Português / पुर्तगाली',
            '../languages/russian.html': '🇷🇺 Русский / रूसी',
            '../languages/italian.html': '🇮🇹 Italiano / इतालवी',
            '../languages/languages.html': '🌍 All Languages / सभी भाषाएं'
        }
    },
    '../languages/portuguese.html': {
        currentText: '🇵🇹 Português',
        options: {
            '../index.html': '🇺🇸 English / Inglês',
            '../languages/spanish.html': '🇪🇸 Español / Espanhol',
            '../languages/french.html': '🇫🇷 Français / Francês',
            '../languages/german.html': '🇩🇪 Deutsch / Alemão',
            '../languages/chinese.html': '🇨🇳 中文 / Chinês',
            '../languages/japanese.html': '🇯🇵 日本語 / Japonês',
            '../languages/korean.html': '🇰🇷 한국어 / Coreano',
            '../languages/arabic.html': '🇸🇦 العربية / Árabe',
            '../languages/hindi.html': '🇮🇳 हिन्दी / Hindi',
            '../languages/portuguese.html': '🇵🇹 Português',
            '../languages/russian.html': '🇷🇺 Русский / Russo',
            '../languages/italian.html': '🇮🇹 Italiano / Italiano',
            '../languages/languages.html': '🌍 All Languages / Todos os Idiomas'
        }
    },
    '../languages/russian.html': {
        currentText: '🇷🇺 Русский',
        options: {
            '../index.html': '🇺🇸 English / Английский',
            '../languages/spanish.html': '🇪🇸 Español / Испанский',
            '../languages/french.html': '🇫🇷 Français / Французский',
            '../languages/german.html': '🇩🇪 Deutsch / Немецкий',
            '../languages/chinese.html': '🇨🇳 中文 / Китайский',
            '../languages/japanese.html': '🇯🇵 日本語 / Японский',
            '../languages/korean.html': '🇰🇷 한국어 / Корейский',
            '../languages/arabic.html': '🇸🇦 العربية / Арабский',
            '../languages/hindi.html': '🇮🇳 हिन्दी / Хинди',
            '../languages/portuguese.html': '🇵🇹 Português / Португальский',
            '../languages/russian.html': '🇷🇺 Русский',
            '../languages/italian.html': '🇮🇹 Italiano / Итальянский',
            '../languages/languages.html': '🌍 All Languages / Все Языки'
        }
    },
    '../languages/italian.html': {
        currentText: '🇮🇹 Italiano',
        options: {
            '../index.html': '🇺🇸 English / Inglese',
            '../languages/spanish.html': '🇪🇸 Español / Spagnolo',
            '../languages/french.html': '🇫🇷 Français / Francese',
            '../languages/german.html': '🇩🇪 Deutsch / Tedesco',
            '../languages/chinese.html': '🇨🇳 中文 / Cinese',
            '../languages/japanese.html': '🇯🇵 日本語 / Giapponese',
            '../languages/korean.html': '🇰🇷 한국어 / Coreano',
            '../languages/arabic.html': '🇸🇦 العربية / Arabo',
            '../languages/hindi.html': '🇮🇳 हिन्दी / Hindi',
            '../languages/portuguese.html': '🇵🇹 Português / Portoghese',
            '../languages/russian.html': '🇷🇺 Русский / Russo',
            '../languages/italian.html': '🇮🇹 Italiano',
            '../languages/languages.html': '🌍 All Languages / Tutte le Lingue'
        }
    },
    '../languages/languages.html': {
        currentText: '🌍 All Languages',
        options: {
            '../index.html': '🇺🇸 English',
            '../languages/spanish.html': '🇪🇸 Español / Spanish',
            '../languages/french.html': '🇫🇷 Français / French',
            '../languages/german.html': '🇩🇪 Deutsch / German',
            '../languages/chinese.html': '🇨🇳 中文 / Chinese',
            '../languages/japanese.html': '🇯🇵 日本語 / Japanese',
            '../languages/korean.html': '🇰🇷 한국어 / Korean',
            '../languages/arabic.html': '🇸🇦 العربية / Arabic',
            '../languages/hindi.html': '🇮🇳 हिन्दी / Hindi',
            '../languages/portuguese.html': '🇵🇹 Português / Portuguese',
            '../languages/russian.html': '🇷🇺 Русский / Russian',
            '../languages/italian.html': '🇮🇹 Italiano / Italian',
            '../languages/languages.html': '🌍 All Languages'
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
        '../index.html': 'en',
        '../languages/spanish.html': 'es',
        '../languages/french.html': 'fr',
        '../languages/german.html': 'de',
        '../languages/chinese.html': 'zh',
        '../languages/japanese.html': 'ja',
        '../languages/korean.html': 'ko',
        '../languages/arabic.html': 'ar',
        '../languages/hindi.html': 'hi',
        '../languages/portuguese.html': 'pt',
        '../languages/russian.html': 'ru',
        '../languages/italian.html': 'it',
        '../languages/languages.html': 'all'
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
