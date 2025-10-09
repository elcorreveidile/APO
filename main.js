// SpanishFlow - Main JavaScript File
// Recording functionality and interactive components

class SpanishFlowApp {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordedAudio = null;
        this.recordingStartTime = null;
        this.recordingTimer = null;
        this.currentLevel = 'A1';
        this.currentPromptIndex = 0;
        this.recordings = JSON.parse(localStorage.getItem('spanishflow_recordings') || '[]');
        this.userProgress = JSON.parse(localStorage.getItem('spanishflow_progress') || '{}');
        
        this.initializeApp();
    }

    initializeApp() {
        this.initializeLevelCarousel();
        this.initializeWaveform();
        this.loadUserProgress();
        this.setupEventListeners();
        this.loadDailyPrompt();
    }

    // Spanish conversation prompts organized by level
    getPromptsByLevel(level) {
        const prompts = {
            'A1': [
                { spanish: 'Hola, ¿cómo estás hoy?', english: 'Hello, how are you today?', topic: 'Daily Life' },
                { spanish: 'Me llamo María, ¿y tú?', english: 'My name is Maria, and you?', topic: 'Daily Life' },
                { spanish: '¿De dónde eres?', english: 'Where are you from?', topic: 'Daily Life' },
                { spanish: 'Tengo veinte años', english: 'I am twenty years old', topic: 'Daily Life' },
                { spanish: 'Me gusta el café', english: 'I like coffee', topic: 'Food & Cuisine' },
                { spanish: '¿Hablas inglés?', english: 'Do you speak English?', topic: 'Daily Life' },
                { spanish: 'No entiendo', english: 'I don\'t understand', topic: 'Daily Life' },
                { spanish: '¿Cuánto cuesta?', english: 'How much does it cost?', topic: 'Shopping' },
                { spanish: '¿Dónde está el baño?', english: 'Where is the bathroom?', topic: 'Travel' },
                { spanish: 'Gracias por tu ayuda', english: 'Thank you for your help', topic: 'Daily Life' }
            ],
            'A2': [
                { spanish: 'Trabajo en una oficina cerca del centro', english: 'I work in an office near downtown', topic: 'Work' },
                { spanish: 'Estudio español los fines de semana', english: 'I study Spanish on weekends', topic: 'Education' },
                { spanish: '¿Qué te parece la película?', english: 'What do you think of the movie?', topic: 'Entertainment' },
                { spanish: 'El fin de semana pasado visité a mis abuelos', english: 'Last weekend I visited my grandparents', topic: 'Family' },
                { spanish: '¿Has estado en Madrid?', english: 'Have you been to Madrid?', topic: 'Travel' },
                { spanish: 'Me encanta la comida mexicana', english: 'I love Mexican food', topic: 'Food & Cuisine' },
                { spanish: '¿A qué hora cierra la tienda?', english: 'What time does the store close?', topic: 'Shopping' },
                { spanish: 'Necesito ir al médico', english: 'I need to go to the doctor', topic: 'Health' },
                { spanish: '¿Puedes ayudarme con esto?', english: 'Can you help me with this?', topic: 'Daily Life' },
                { spanish: 'Voy a estudiar en la universidad', english: 'I\'m going to study at university', topic: 'Education' }
            ],
            'B1': [
                { spanish: 'Creo que deberíamos reducir el uso del plástico', english: 'I think we should reduce plastic use', topic: 'Environment' },
                { spanish: '¿Qué te pareció la conferencia de ayer?', english: 'What did you think of yesterday\'s conference?', topic: 'Education' },
                { spanish: 'Estoy pensando en cambiar de trabajo', english: 'I\'m thinking about changing jobs', topic: 'Work' },
                { spanish: 'El teletrabajo ha cambiado mi vida personal', english: 'Remote work has changed my personal life', topic: 'Work' },
                { spanish: '¿Has visto las noticias sobre el cambio climático?', english: 'Have you seen the news about climate change?', topic: 'Current Events' },
                { spanish: 'Me preocupa la situación económica actual', english: 'I\'m worried about the current economic situation', topic: 'Politics' },
                { spanish: 'Quiero viajar por Latinoamérica el próximo año', english: 'I want to travel through Latin America next year', topic: 'Travel' },
                { spanish: 'La tecnología está transformando nuestra sociedad', english: 'Technology is transforming our society', topic: 'Technology' },
                { spanish: '¿Cuál es tu opinión sobre la inteligencia artificial?', english: 'What\'s your opinion about artificial intelligence?', topic: 'Technology' },
                { spanish: 'Es importante mantener un equilibrio entre trabajo y vida personal', english: 'It\'s important to maintain work-life balance', topic: 'Lifestyle' }
            ],
            'B2': [
                { spanish: 'La conferencia abordaba los efectos del cambio climático en zonas costeras', english: 'The conference addressed climate change effects on coastal areas', topic: 'Environment' },
                { spanish: 'Desde mi punto de vista, necesitamos políticas más efectivas', english: 'From my point of view, we need more effective policies', topic: 'Politics' },
                { spanish: 'La reseña del libro destaca el estilo innovador del autor', english: 'The book review highlights the author\'s innovative style', topic: 'Literature' },
                { spanish: '¿Cómo crees que afectará la globalización a las economías locales?', english: 'How do you think globalization will affect local economies?', topic: 'Economics' },
                { spanish: 'El artículo analiza las implicaciones éticas de la biotecnología', english: 'The article analyzes the ethical implications of biotechnology', topic: 'Science' },
                { spanish: 'Me interesa mucho la historia contemporánea de España', english: 'I\'m very interested in contemporary Spanish history', topic: 'History' },
                { spanish: '¿Has leído sobre los movimientos sociales en América Latina?', english: 'Have you read about social movements in Latin America?', topic: 'Society' },
                { spanish: 'La película refleja las complejidades de la identidad cultural', english: 'The film reflects the complexities of cultural identity', topic: 'Culture' },
                { spanish: 'Considero que la educación bilingüe tiene ventajas significativas', english: 'I believe bilingual education has significant advantages', topic: 'Education' },
                { spanish: '¿Cuál es tu perspectiva sobre el futuro del trabajo remoto?', english: 'What\'s your perspective on the future of remote work?', topic: 'Work' }
            ],
            'C1': [
                { spanish: 'La complejidad del sistema educativo requiere un análisis multidimensional', english: 'The complexity of the education system requires multidimensional analysis', topic: 'Education' },
                { spanish: 'Las implicaciones filosóficas del transhumanismo son profundas', english: 'The philosophical implications of transhumanism are profound', topic: 'Philosophy' },
                { spanish: 'El ensayo analiza la construcción social de la realidad a través del lenguaje', english: 'The essay analyzes the social construction of reality through language', topic: 'Linguistics' },
                { spanish: '¿Cómo influyen las estructuras socioeconómicas en la creatividad artística?', english: 'How do socioeconomic structures influence artistic creativity?', topic: 'Sociology' },
                { spanish: 'La novela contemporánea explora la memoria colectiva y el olvido histórico', english: 'Contemporary novels explore collective memory and historical forgetting', topic: 'Literature' },
                { spanish: 'Considero fundamental cuestionar los paradigmas establecidos', english: 'I consider it fundamental to question established paradigms', topic: 'Philosophy' },
                { spanish: 'La interseccionalidad es crucial para comprender las dinámicas de poder', english: 'Intersectionality is crucial for understanding power dynamics', topic: 'Sociology' },
                { spanish: '¿Qué papel juega la nostalgia en la construcción de identidades nacionales?', english: 'What role does nostalgia play in constructing national identities?', topic: 'Culture' },
                { spanish: 'El discurso político actual carece de propuestas sustanciales', english: 'Current political discourse lacks substantial proposals', topic: 'Politics' },
                { spanish: 'Es necesario repensar los fundamentos de nuestra economía global', english: 'We need to rethink the foundations of our global economy', topic: 'Economics' }
            ],
            'C2': [
                { spanish: 'La epistemología del conocimiento científico requiere una revisión crítica constante', english: 'The epistemology of scientific knowledge requires constant critical revision', topic: 'Philosophy' },
                { spanish: 'Las metáforas conceptuales moldean nuestra comprensión del mundo subconscientemente', english: 'Conceptual metaphors shape our understanding of the world subconsciously', topic: 'Cognitive Science' },
                { spanish: 'La deconstrucción del discurso hegemónico es esencial para el cambio social', english: 'Deconstructing hegemonic discourse is essential for social change', topic: 'Critical Theory' },
                { spanish: '¿Cómo se articulan las identidades híbridas en contextos poscoloniales?', english: 'How are hybrid identities articulated in postcolonial contexts?', topic: 'Cultural Studies' },
                { spanish: 'La fenomenología de la experiencia estética trasciende lo meramente sensorial', english: 'The phenomenology of aesthetic experience transcends the merely sensory', topic: 'Philosophy' },
                { spanish: 'Considero que la ética de la virtud ofrece un marco más integral que el utilitarismo', english: 'I believe virtue ethics offers a more comprehensive framework than utilitarianism', topic: 'Philosophy' },
                { spanish: 'Las narrativas transmedia reconfiguran las fronteras entre autor y audiencia', english: 'Transmedia narratives reconfigure the boundaries between author and audience', topic: 'Media Studies' },
                { spanish: 'La biopolítica contemporánea opera a través de mecanismos sutiles de control', english: 'Contemporary biopolitics operates through subtle control mechanisms', topic: 'Political Theory' },
                { spanish: '¿En qué medida el lenguaje construye nuestra realidad perceptiva?', english: 'To what extent does language construct our perceptual reality?', topic: 'Linguistics' },
                { spanish: 'La complejidad de los sistemas adaptativos desafía los modelos predictivos tradicionales', english: 'The complexity of adaptive systems challenges traditional predictive models', topic: 'Systems Theory' }
            ]
        };
        return prompts[level] || prompts['A1'];
    }

    loadDailyPrompt() {
        const prompts = this.getPromptsByLevel(this.currentLevel);
        const today = new Date().toDateString();
        const savedPrompt = localStorage.getItem(`daily_prompt_${today}_${this.currentLevel}`);
        
        if (savedPrompt) {
            const prompt = JSON.parse(savedPrompt);
            this.displayPrompt(prompt);
        } else {
            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            localStorage.setItem(`daily_prompt_${today}_${this.currentLevel}`, JSON.stringify(randomPrompt));
            this.displayPrompt(randomPrompt);
        }
    }

    displayPrompt(prompt) {
        document.getElementById('spanish-text').textContent = prompt.spanish;
        document.getElementById('english-translation').textContent = prompt.english;
        
        // Update topic tag
        const topicTags = document.querySelectorAll('.text-xs.text-gray-500 span');
        if (topicTags.length > 0) {
            topicTags[0].textContent = `📚 ${prompt.topic}`;
        }
    }

    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.recordedAudio = URL.createObjectURL(audioBlob);
                this.showPlaybackControls();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            this.updateRecordingUI();
            this.startRecordingTimer();
            this.startWaveformAnimation();
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showRecordingError();
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            
            this.updateRecordingUI();
            this.stopRecordingTimer();
            this.stopWaveformAnimation();
        }
    }

    updateRecordingUI() {
        const recordBtn = document.getElementById('record-btn');
        const statusText = document.getElementById('recording-status');
        
        if (this.isRecording) {
            recordBtn.classList.add('recording');
            statusText.textContent = 'Recording... Tap to stop';
        } else {
            recordBtn.classList.remove('recording');
            statusText.textContent = 'Tap to start recording';
        }
    }

    startRecordingTimer() {
        this.recordingTimer = setInterval(() => {
            if (this.recordingStartTime) {
                const elapsed = Date.now() - this.recordingStartTime;
                const seconds = Math.floor(elapsed / 1000);
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                
                document.getElementById('recording-timer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            }
        }, 100);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    showPlaybackControls() {
        document.getElementById('playback-controls').style.display = 'flex';
        document.getElementById('recording-status').textContent = 'Recording complete!';
    }

    hidePlaybackControls() {
        document.getElementById('playback-controls').style.display = 'none';
        document.getElementById('recording-status').textContent = 'Tap to start recording';
    }

    playRecording() {
        if (this.recordedAudio) {
            const audio = new Audio(this.recordedAudio);
            audio.play();
        }
    }

    pauseRecording() {
        // Implementation for pause functionality
        console.log('Pause recording');
    }

    saveRecording() {
        if (this.recordedAudio) {
            const recording = {
                id: Date.now(),
                audioUrl: this.recordedAudio,
                spanishText: document.getElementById('spanish-text').textContent,
                englishText: document.getElementById('english-translation').textContent,
                level: this.currentLevel,
                timestamp: new Date().toISOString(),
                duration: this.recordingStartTime ? Date.now() - this.recordingStartTime : 0
            };
            
            this.recordings.unshift(recording);
            localStorage.setItem('spanishflow_recordings', JSON.stringify(this.recordings));
            
            this.updateUserProgress();
            this.showSuccessMessage();
            this.loadNewPrompt();
            this.hidePlaybackControls();
            
            // Reset recording state
            this.recordedAudio = null;
            document.getElementById('recording-timer').textContent = '00:00';
        }
    }

    retryRecording() {
        this.hidePlaybackControls();
        this.recordedAudio = null;
        document.getElementById('recording-timer').textContent = '00:00';
    }

    loadNewPrompt() {
        const prompts = this.getPromptsByLevel(this.currentLevel);
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        this.displayPrompt(randomPrompt);
    }

    updateUserProgress() {
        const today = new Date().toDateString();
        if (!this.userProgress[this.currentLevel]) {
            this.userProgress[this.currentLevel] = { recordings: 0, lastPractice: null, streak: 0 };
        }
        
        this.userProgress[this.currentLevel].recordings++;
        this.userProgress[this.currentLevel].lastPractice = today;
        
        // Update streak
        const lastPracticeDate = new Date(this.userProgress[this.currentLevel].lastPractice);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPracticeDate.toDateString() === yesterday.toDateString()) {
            this.userProgress[this.currentLevel].streak++;
        } else if (lastPracticeDate.toDateString() !== today) {
            this.userProgress[this.currentLevel].streak = 1;
        }
        
        localStorage.setItem('spanishflow_progress', JSON.stringify(this.userProgress));
        this.updateProgressDisplay();
    }

    loadUserProgress() {
        this.updateProgressDisplay();
    }

    updateProgressDisplay() {
        const levelProgress = this.userProgress[this.currentLevel] || { recordings: 0, streak: 0 };
        
        // Update streak display
        document.getElementById('streak-counter').textContent = `🔥 ${levelProgress.streak || 0} day streak`;
        
        // Update level progress dots (simplified for demo)
        const completedRecordings = levelProgress.recordings || 0;
        const nextLevelRequirement = 5; // Simplified requirement
        const remaining = Math.max(0, nextLevelRequirement - (completedRecordings % nextLevelRequirement));
        
        // This would update the progress dots in a real implementation
    }

    showSuccessMessage() {
        // Create and show success animation
        anime({
            targets: '#record-btn',
            scale: [1, 1.2, 1],
            duration: 600,
            easing: 'easeInOutQuad'
        });
        
        // Show temporary success message
        const statusText = document.getElementById('recording-status');
        const originalText = statusText.textContent;
        statusText.textContent = 'Great job! Recording saved!';
        
        setTimeout(() => {
            statusText.textContent = originalText;
        }, 2000);
    }

    showRecordingError() {
        const statusText = document.getElementById('recording-status');
        statusText.textContent = 'Microphone access denied. Please check permissions.';
        statusText.style.color = '#EF4444';
        
        setTimeout(() => {
            statusText.textContent = 'Tap to start recording';
            statusText.style.color = '';
        }, 3000);
    }

    initializeLevelCarousel() {
        const splide = new Splide('#level-carousel', {
            type: 'slide',
            perPage: 3,
            perMove: 1,
            gap: '1rem',
            pagination: false,
            arrows: false,
            breakpoints: {
                640: {
                    perPage: 2,
                },
                480: {
                    perPage: 1.5,
                }
            }
        });
        
        splide.mount();
        
        // Add click handlers for level cards
        document.querySelectorAll('.level-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                this.switchLevel(levels[index]);
            });
        });
    }

    switchLevel(newLevel) {
        this.currentLevel = newLevel;
        document.getElementById('current-level').textContent = newLevel;
        this.loadDailyPrompt();
        this.updateProgressDisplay();
        
        // Animate level switch
        anime({
            targets: '#spanish-text, #english-translation',
            opacity: [1, 0, 1],
            duration: 800,
            easing: 'easeInOutQuad'
        });
    }

    initializeWaveform() {
        // Simple waveform visualization using canvas
        const container = document.getElementById('waveform-visualization');
        if (container) {
            const canvas = document.createElement('canvas');
            canvas.width = container.offsetWidth || 300;
            canvas.height = 80;
            container.appendChild(canvas);
            
            this.waveformCanvas = canvas;
            this.waveformContext = canvas.getContext('2d');
        }
    }

    startWaveformAnimation() {
        if (!this.waveformContext) return;
        
        this.waveformAnimationId = requestAnimationFrame(() => this.animateWaveform());
    }

    stopWaveformAnimation() {
        if (this.waveformAnimationId) {
            cancelAnimationFrame(this.waveformAnimationId);
            this.waveformAnimationId = null;
        }
        
        // Clear the canvas
        if (this.waveformContext) {
            this.waveformContext.clearRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);
        }
    }

    animateWaveform() {
        if (!this.isRecording || !this.waveformContext) return;
        
        const ctx = this.waveformContext;
        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw animated waveform
        const time = Date.now() * 0.005;
        const bars = 50;
        const barWidth = width / bars;
        
        for (let i = 0; i < bars; i++) {
            const amplitude = Math.sin(time + i * 0.1) * 0.5 + 0.5;
            const barHeight = amplitude * height * 0.8;
            
            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, '#E07A5F');
            gradient.addColorStop(1, '#81B29A');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
        }
        
        this.waveformAnimationId = requestAnimationFrame(() => this.animateWaveform());
    }

    setupEventListeners() {
        // Handle page visibility changes to stop recording
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRecording) {
                this.stopRecording();
            }
        });
        
        // Handle beforeunload to clean up
        window.addEventListener('beforeunload', () => {
            if (this.recordedAudio) {
                URL.revokeObjectURL(this.recordedAudio);
            }
        });
    }
}

// Global functions for HTML event handlers
function toggleRecording() {
    window.spanishFlowApp.toggleRecording();
}

function playRecording() {
    window.spanishFlowApp.playRecording();
}

function pauseRecording() {
    window.spanishFlowApp.pauseRecording();
}

function saveRecording() {
    window.spanishFlowApp.saveRecording();
}

function retryRecording() {
    window.spanishFlowApp.retryRecording();
}

function playNativeAudio() {
    // Simulate native audio playback
    const spanishText = document.getElementById('spanish-text').textContent;
    
    // Create a simple text-to-speech for demo purposes
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(spanishText);
        utterance.lang = 'es-ES';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
    
    // Visual feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '🔊 Playing...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
    }, 2000);
}

function playLastRecording() {
    // Play the most recent recording
    const recordings = JSON.parse(localStorage.getItem('spanishflow_recordings') || '[]');
    if (recordings.length > 0) {
        const audio = new Audio(recordings[0].audioUrl);
        audio.play();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.spanishFlowApp = new SpanishFlowApp();
});

// Add some utility functions for navigation
function navigateToPage(page) {
    window.location.href = page;
}

// Add animation utilities
function animateElement(selector, animation) {
    anime({
        targets: selector,
        ...animation
    });
}

// Progress tracking utilities
function updateProgress(level, recordings) {
    const progress = JSON.parse(localStorage.getItem('spanishflow_progress') || '{}');
    if (!progress[level]) {
        progress[level] = { recordings: 0, streak: 0, lastPractice: null };
    }
    progress[level].recordings += recordings;
    progress[level].lastPractice = new Date().toDateString();
    localStorage.setItem('spanishflow_progress', JSON.stringify(progress));
}

function getProgress(level) {
    const progress = JSON.parse(localStorage.getItem('spanishflow_progress') || '{}');
    return progress[level] || { recordings: 0, streak: 0, lastPractice: null };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpanishFlowApp, updateProgress, getProgress };
}