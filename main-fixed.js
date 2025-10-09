// SpanishFlow - Fixed JavaScript File
// Enhanced recording functionality and button interactions

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
        this.isInitialized = false;
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            await this.checkBrowserCompatibility();
            this.initializeLevelCarousel();
            this.initializeWaveform();
            this.loadUserProgress();
            this.setupEventListeners();
            this.loadDailyPrompt();
            this.isInitialized = true;
            console.log('SpanishFlow app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showInitializationError();
        }
    }

    async checkBrowserCompatibility() {
        // Check for required APIs
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('MediaDevices API not supported');
        }
        
        if (!window.MediaRecorder) {
            throw new Error('MediaRecorder API not supported');
        }
        
        if (!window.localStorage) {
            throw new Error('Local Storage not supported');
        }
        
        // Check for HTTPS (required for media access)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            console.warn('Media recording requires HTTPS. Some features may not work.');
        }
    }

    showInitializationError() {
        const statusElement = document.getElementById('recording-status');
        if (statusElement) {
            statusElement.textContent = 'App initialization failed. Please refresh the page.';
            statusElement.style.color = '#EF4444';
        }
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
        const spanishText = document.getElementById('spanish-text');
        const englishText = document.getElementById('english-translation');
        
        if (spanishText && englishText) {
            spanishText.textContent = prompt.spanish;
            englishText.textContent = prompt.english;
            
            // Update topic tag
            const topicTags = document.querySelectorAll('.text-xs.text-gray-500 span');
            if (topicTags.length > 0) {
                topicTags[0].textContent = `📚 ${prompt.topic}`;
            }
        }
    }

    async toggleRecording() {
        if (!this.isInitialized) {
            this.showError('App not initialized. Please refresh the page.');
            return;
        }

        if (this.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            this.showStatus('Requesting microphone access...');
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            this.showStatus('Starting recording...');
            
            // Create MediaRecorder with proper MIME type
            const mimeType = this.getSupportedMimeType();
            this.mediaRecorder = new MediaRecorder(stream, { mimeType });
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                try {
                    const audioBlob = new Blob(this.audioChunks, { type: mimeType });
                    this.recordedAudio = URL.createObjectURL(audioBlob);
                    this.showPlaybackControls();
                    this.showStatus('Recording completed!');
                } catch (error) {
                    console.error('Error creating audio blob:', error);
                    this.showError('Failed to process recording');
                }
            };
            
            this.mediaRecorder.onerror = (error) => {
                console.error('MediaRecorder error:', error);
                this.showError('Recording error occurred');
            };
            
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            this.updateRecordingUI();
            this.startRecordingTimer();
            this.startWaveformAnimation();
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.handleRecordingError(error);
        }
    }

    async stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            try {
                this.mediaRecorder.stop();
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                this.isRecording = false;
                
                this.updateRecordingUI();
                this.stopRecordingTimer();
                this.stopWaveformAnimation();
            } catch (error) {
                console.error('Error stopping recording:', error);
                this.showError('Failed to stop recording');
            }
        }
    }

    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/wav'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return 'audio/webm'; // Fallback
    }

    handleRecordingError(error) {
        let errorMessage = 'Failed to start recording';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Microphone access denied. Please check permissions.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No microphone found. Please check your device.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = 'Recording not supported in this browser.';
        }
        
        this.showError(errorMessage);
    }

    updateRecordingUI() {
        const recordBtn = document.getElementById('record-btn');
        const statusText = document.getElementById('recording-status');
        
        if (recordBtn && statusText) {
            if (this.isRecording) {
                recordBtn.classList.add('recording');
                statusText.textContent = 'Recording... Tap to stop';
                statusText.style.color = '#EF4444';
            } else {
                recordBtn.classList.remove('recording');
                statusText.textContent = 'Tap to start recording';
                statusText.style.color = '';
            }
        }
    }

    showStatus(message) {
        const statusText = document.getElementById('recording-status');
        if (statusText) {
            statusText.textContent = message;
            statusText.style.color = '#6B7280';
        }
    }

    showError(message) {
        const statusText = document.getElementById('recording-status');
        if (statusText) {
            statusText.textContent = message;
            statusText.style.color = '#EF4444';
            
            // Reset after 3 seconds
            setTimeout(() => {
                statusText.textContent = 'Tap to start recording';
                statusText.style.color = '';
            }, 3000);
        }
    }

    startRecordingTimer() {
        this.recordingTimer = setInterval(() => {
            if (this.recordingStartTime) {
                const elapsed = Date.now() - this.recordingStartTime;
                const seconds = Math.floor(elapsed / 1000);
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                
                const timerElement = document.getElementById('recording-timer');
                if (timerElement) {
                    timerElement.textContent = 
                        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
                }
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
        const playbackControls = document.getElementById('playback-controls');
        if (playbackControls) {
            playbackControls.style.display = 'flex';
        }
    }

    hidePlaybackControls() {
        const playbackControls = document.getElementById('playback-controls');
        if (playbackControls) {
            playbackControls.style.display = 'none';
        }
    }

    playRecording() {
        if (this.recordedAudio) {
            try {
                const audio = new Audio(this.recordedAudio);
                audio.play().catch(error => {
                    console.error('Error playing recording:', error);
                    this.showError('Failed to play recording');
                });
            } catch (error) {
                console.error('Error creating audio element:', error);
                this.showError('Failed to play recording');
            }
        } else {
            this.showError('No recording to play');
        }
    }

    pauseRecording() {
        // For now, just show a message
        this.showStatus('Pause functionality coming soon');
        setTimeout(() => {
            this.showStatus('Tap to start recording');
        }, 2000);
    }

    saveRecording() {
        if (this.recordedAudio) {
            try {
                const recording = {
                    id: Date.now(),
                    audioUrl: this.recordedAudio,
                    spanishText: document.getElementById('spanish-text')?.textContent || '',
                    englishText: document.getElementById('english-translation')?.textContent || '',
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
                const timerElement = document.getElementById('recording-timer');
                if (timerElement) {
                    timerElement.textContent = '00:00';
                }
            } catch (error) {
                console.error('Error saving recording:', error);
                this.showError('Failed to save recording');
            }
        }
    }

    retryRecording() {
        this.hidePlaybackControls();
        this.recordedAudio = null;
        const timerElement = document.getElementById('recording-timer');
        if (timerElement) {
            timerElement.textContent = '00:00';
        }
        this.showStatus('Tap to start recording');
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
        const streakElement = document.getElementById('streak-counter');
        if (streakElement) {
            streakElement.textContent = `🔥 ${levelProgress.streak || 0} day streak`;
        }
    }

    showSuccessMessage() {
        // Create and show success animation
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn) {
            anime({
                targets: recordBtn,
                scale: [1, 1.2, 1],
                duration: 600,
                easing: 'easeInOutQuad'
            });
        }
        
        // Show temporary success message
        const statusText = document.getElementById('recording-status');
        if (statusText) {
            const originalText = statusText.textContent;
            statusText.textContent = 'Great job! Recording saved!';
            statusText.style.color = '#10B981';
            
            setTimeout(() => {
                statusText.textContent = originalText;
                statusText.style.color = '';
            }, 2000);
        }
    }

    initializeLevelCarousel() {
        try {
            const splideElement = document.getElementById('level-carousel');
            if (splideElement) {
                const splide = new Splide(splideElement, {
                    type: 'slide',
                    perPage: 3,
                    perMove: 1,
                    gap: '1rem',
                    pagination: false,
                    arrows: false,
                    breakpoints: {
                        640: { perPage: 2 },
                        480: { perPage: 1.5 }
                    }
                });
                
                splide.mount();
                
                // Add click handlers for level cards
                document.querySelectorAll('.level-card').forEach((card, index) => {
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                        this.switchLevel(levels[index]);
                    });
                });
            }
        } catch (error) {
            console.error('Error initializing carousel:', error);
        }
    }

    switchLevel(newLevel) {
        this.currentLevel = newLevel;
        const levelElement = document.getElementById('current-level');
        if (levelElement) {
            levelElement.textContent = newLevel;
        }
        
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
        // Handle page visibility changes
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
        
        // Handle touch events for better mobile interaction
        document.addEventListener('touchstart', (e) => {
            // Prevent default touch behaviors that might interfere
            if (e.target.closest('.recording-button, .level-card, .subject-card')) {
                // Allow the interaction but prevent scrolling
            }
        }, { passive: true });
    }
}

// Enhanced global functions for HTML event handlers
function toggleRecording() {
    if (window.spanishFlowApp && window.spanishFlowApp.isInitialized) {
        window.spanishFlowApp.toggleRecording();
    } else {
        console.error('App not initialized');
        alert('App not ready. Please refresh the page.');
    }
}

function playRecording() {
    if (window.spanishFlowApp && window.spanishFlowApp.isInitialized) {
        window.spanishFlowApp.playRecording();
    }
}

function pauseRecording() {
    if (window.spanishFlowApp && window.spanishFlowApp.isInitialized) {
        window.spanishFlowApp.pauseRecording();
    }
}

function saveRecording() {
    if (window.spanishFlowApp && window.spanishFlowApp.isInitialized) {
        window.spanishFlowApp.saveRecording();
    }
}

function retryRecording() {
    if (window.spanishFlowApp && window.spanishFlowApp.isInitialized) {
        window.spanishFlowApp.retryRecording();
    }
}

function playNativeAudio() {
    try {
        const spanishText = document.getElementById('spanish-text')?.textContent;
        if (!spanishText) return;
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(spanishText);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            
            // Cancel any existing speech
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
            
            // Visual feedback
            const btn = event?.target;
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = '🔊 Playing...';
                btn.disabled = true;
                
                utterance.onend = () => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                };
            }
        } else {
            alert('Text-to-speech not supported in this browser');
        }
    } catch (error) {
        console.error('Error playing native audio:', error);
    }
}

function playLastRecording() {
    try {
        const recordings = JSON.parse(localStorage.getItem('spanishflow_recordings') || '[]');
        if (recordings.length > 0) {
            const audio = new Audio(recordings[0].audioUrl);
            audio.play().catch(error => {
                console.error('Error playing last recording:', error);
                alert('Failed to play recording');
            });
        } else {
            alert('No recordings found');
        }
    } catch (error) {
        console.error('Error playing last recording:', error);
        alert('Failed to play recording');
    }
}

// Enhanced navigation functions
function navigateToPage(page) {
    try {
        // Add loading state
        document.body.style.opacity = '0.8';
        
        setTimeout(() => {
            window.location.href = page;
        }, 100);
    } catch (error) {
        console.error('Navigation error:', error);
        window.location.href = page; // Fallback
    }
}

// Initialize the app when DOM is loaded with enhanced error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'app-loading';
        loadingDiv.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                        background: rgba(244, 243, 238, 0.9); display: flex; 
                        align-items: center; justify-content: center; z-index: 9999;
                        font-family: Inter, sans-serif;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🎙️</div>
                    <div style="color: #3D405B; font-weight: 500;">Loading SpanishFlow...</div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingDiv);
        
        // Initialize app
        window.spanishFlowApp = new SpanishFlowApp();
        
        // Remove loading indicator after initialization
        setTimeout(() => {
            const loading = document.getElementById('app-loading');
            if (loading) {
                loading.remove();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        alert('Failed to load the app. Please refresh the page.');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpanishFlowApp };
}