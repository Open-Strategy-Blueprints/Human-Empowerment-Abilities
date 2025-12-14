// Human Empowerment Abilities - Interactive Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

async function initApp() {
    // Load abilities data
    await loadAbilities();
    
    // Load exercises
    await loadExercises();
    
    // Load community signatures
    await loadSignatures();
    
    // Initialize progress chart
    initProgressChart();
    
    // Initialize user progress system
    UserProgress.init();
    updateProgressDisplay();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update stats periodically
    setInterval(updateLiveStats, 30000);
}

// Abilities Data (Now complete with all 9 abilities in English)
const abilitiesData = {
    "emotional": [
        {
            id: 1,
            number: "01",
            category: "Emotional & Meaning",
            title: "Embodied Empathy",
            description: "The capacity for compassion rooted in biological neurochemistry, sensory experience, and life journey.",
            aiLimitation: "Can simulate response patterns but lacks the weight of understanding from embodied pain and ecstasy.",
            icon: "fas fa-heart",
            color: "#4cc9f0",
            exercises: 5,
            philosophicalBasis: "Rooted in our biological existence, this ability emerges from the interplay of mirror neurons, hormonal responses, and lived experience that cannot be algorithmically reproduced.",
            example: "When you see a friend lose a loved one, you not only understand their sadness, but your body also feels a similar heaviness."
        },
        {
            id: 2,
            number: "02",
            category: "Emotional & Meaning",
            title: "Meaning-Giving in Absurdity",
            description: "Creating hope, narrative, and faith in the face of suffering, meaninglessness, and finitude.",
            aiLimitation: "Can combine texts about meaning but lacks existential urgency driven by death awareness.",
            icon: "fas fa-seedling",
            color: "#4361ee",
            exercises: 4,
            philosophicalBasis: "Emerges from our confrontation with mortality and the human condition. The awareness of death gives birth to the need for meaning, a uniquely human existential project.",
            example: "After losing a job, you redefine the meaning of life and find a new direction in volunteer work."
        },
        {
            id: 3,
            number: "03",
            category: "Emotional & Meaning",
            title: "Non-Utilitarian Love & Sacrifice",
            description: "Pure altruism beyond genetic calculation and interest exchange, where value lies in the act of sacrifice itself.",
            aiLimitation: "Its 'altruism' is a preset program goal, unable to understand the paradoxical beauty of sacrifice as meaning-completion.",
            icon: "fas fa-hands-helping",
            color: "#3a0ca3",
            exercises: 6,
            philosophicalBasis: "Transcends evolutionary programming through free will and moral imagination. The choice to sacrifice for another without expected return defines human ethical capacity.",
            example: "Donating an organ anonymously to a stranger, or risking one's life to save someone unrelated."
        }
    ],
    "cognitive": [
        {
            id: 4,
            number: "04",
            category: "Cognitive & Creative",
            title: "Intuitive Leap from Ambiguity",
            description: "Creative breakthroughs from contradictory and incomplete information through subconscious integration.",
            aiLimitation: "Innovation is recombination and optimization of existing data patterns, not emergence from consciousness edges.",
            icon: "fas fa-lightbulb",
            color: "#f72585",
            exercises: 5,
            philosophicalBasis: "Arises from the subconscious mind's ability to process information holistically, making connections that exceed logical deduction. This 'aha!' moment is a mystery of human consciousness.",
            example: "Archimedes suddenly understanding the principle of buoyancy in a bathtub, or a scientist solving a research problem in a dream."
        },
        {
            id: 5,
            number: "05",
            category: "Cognitive & Creative",
            title: "Tragic Choice Bearing",
            description: "Making and carrying the ethical burden of choices between incommensurable values.",
            aiLimitation: "Its choices are optimal solutions based on weight calculations, unable to experience the eternal regret and life texture.",
            icon: "fas fa-balance-scale",
            color: "#b5179e",
            exercises: 4,
            philosophicalBasis: "Rooted in the human condition of moral ambiguity. Unlike AI's cost-benefit analysis, humans must live with the irreconcilable consequences of their choices.",
            example: "Choosing whom to save when medical resources are limited, or making an irreversible choice between family and career."
        },
        {
            id: 6,
            number: "06",
            category: "Cognitive & Creative",
            title: "First-Person Consciousness",
            description: "Subjective experiences like 'redness' or 'pain' as the absolute origin of all understanding and value.",
            aiLimitation: "Can process 'red' wavelength data but has no experience of 'redness'. This is the core of the 'hard problem' of consciousness.",
            icon: "fas fa-eye",
            color: "#7209b7",
            exercises: 3,
            philosophicalBasis: "The 'hard problem' of consciousness - the qualitative, subjective experience of being. This phenomenal consciousness is the foundation of all human experience and value.",
            example: "The inner emotion when seeing a sunset, or the pleasure of tasting delicious food, which cannot be fully described in words."
        }
    ],
    "practical": [
        {
            id: 7,
            number: "07",
            category: "Practical & Historical",
            title: "Historical Self-Reinvention",
            description: "Reinterpreting the past to gain new identity and future direction. History as a 'living textbook'.",
            aiLimitation: "History for it is a closed dataset for analysis, unable to engage in self-changing 'horizon fusion'.",
            icon: "fas fa-history",
            color: "#560bad",
            exercises: 5,
            philosophicalBasis: "Humans exist in hermeneutical circles with history - we reinterpret our past, which in turn redefines our present and future. This is a dialogical, not analytical, relationship.",
            example: "Re-examining family history, understanding the choices of ancestors, and finding direction and meaning for one's own life."
        },
        {
            id: 8,
            number: "08",
            category: "Practical & Historical",
            title: "Reverence-Based Coexistence",
            description: "Interacting with nature and others as partners rather than objects, with emotional connection fostering sustainable wisdom.",
            aiLimitation: "Its environmental strategy is a cold optimization model, lacking emotional drivers like 'unity with nature' or 'reverence for life'.",
            icon: "fas fa-mountain",
            color: "#480ca8",
            exercises: 4,
            philosophicalBasis: "Emerges from the phenomenological experience of being-in-the-world. We don't just analyze the environment; we dwell within it, forming affective bonds that motivate care.",
            example: "Living in harmony with nature like indigenous peoples, or seeing others as beings with intrinsic value rather than tools."
        },
        {
            id: 9,
            number: "09",
            category: "Practical & Historical",
            title: "Soul-Transforming Dialogue",
            description: "Changing core beliefs through being genuinely moved by another's reasoning and character in sincere dialogue.",
            aiLimitation: "Its debate aims at logical victory or goal optimization, not belief transformation based on trust and recognition.",
            icon: "fas fa-comments",
            color: "#3a0ca3",
            exercises: 6,
            philosophicalBasis: "Requires mutual recognition and vulnerability. In authentic dialogue, we risk our own worldview and can be transformed through encounter with the other's irreducible subjectivity.",
            example: "After deep communication with someone of different political views, truly understanding their position and adjusting one's own views."
        }
    ]
};

async function loadAbilities() {
    const container = document.getElementById('abilities-container');
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.dimension || 'emotional';
    
    container.innerHTML = '';
    
    const abilities = abilitiesData[activeTab];
    
    if (!abilities || abilities.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-brain"></i><p>Loading abilities data...</p></div>';
        return;
    }
    
    abilities.forEach(ability => {
        // Get user progress for this ability
        const userProgress = UserProgress.getProgress();
        const progress = userProgress.abilitiesProgress[ability.id] || 0;
        const completed = Math.floor((progress / 100) * ability.exercises);
        
        const card = document.createElement('div');
        card.className = 'ability-card';
        card.innerHTML = `
            <div class="ability-header">
                <div class="ability-number">${ability.number}</div>
                <span class="ability-category">${ability.category}</span>
            </div>
            <h3 class="ability-title">${ability.title}</h3>
            <p class="ability-description">${ability.description}</p>
            <div class="ability-details">
                <div class="ai-limitation">
                    <strong>AI Limitation:</strong> ${ability.aiLimitation}
                </div>
                ${ability.example ? `<div class="ability-example"><strong>Example:</strong> ${ability.example}</div>` : ''}
            </div>
            <div class="ability-footer">
                <div class="ability-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span>Completed ${completed}/${ability.exercises} exercises</span>
                </div>
                <div class="ability-actions">
                    <button class="btn-secondary" onclick="startAbilityExercise(${ability.id})">
                        <i class="${ability.icon}"></i> Practice
                    </button>
                    <button class="btn-text" onclick="learnMore(${ability.id})">Learn More</button>
                </div>
            </div>
        `;
        
        // Set border color based on ability
        card.style.borderTopColor = ability.color;
        container.appendChild(card);
    });
}

async function loadExercises() {
    // In a real implementation, this would fetch from exercises.json
    const exercises = [
        {
            id: 1,
            category: "Embodied Empathy",
            title: "The Mirror of Another's Pain",
            description: "Recall a moment of witnessing someone's genuine pain. Instead of analyzing it, try to feel where in your own body you sense their suffering. Sit with that sensation for 5 minutes without judgment.",
            duration: "10 min",
            abilityId: 1
        },
        {
            id: 2,
            category: "Intuitive Leap from Ambiguity",
            title: "Embracing Contradiction",
            description: "Write down two conflicting beliefs you hold. Spend 15 minutes exploring how both might be true simultaneously, without forcing resolution.",
            duration: "15 min",
            abilityId: 4
        },
        {
            id: 3,
            category: "Soul-Transforming Dialogue",
            title: "Listening for Transformation",
            description: "Have a conversation where your only goal is to understand the other person's worldview. Resist the urge to persuade or correct. Afterwards, write one way your perspective has shifted.",
            duration: "20 min",
            abilityId: 9
        },
        {
            id: 4,
            category: "Meaning-Giving in Absurdity",
            title: "Finding Beauty in the Broken",
            description: "Find something broken or discarded (a fallen leaf, a cracked cup). Spend 10 minutes contemplating what beauty or meaning it holds despite (or because of) its imperfection.",
            duration: "10 min",
            abilityId: 2
        },
        {
            id: 5,
            category: "Tragic Choice Bearing",
            title: "The Unresolvable Dilemma",
            description: "Imagine you must choose between saving a masterpiece of human art or saving a stranger's life. Sit with the dilemma for 15 minutes without trying to solve it.",
            duration: "15 min",
            abilityId: 5
        }
    ];
    
    // Randomly select today's exercise
    const todayExercise = exercises[Math.floor(Math.random() * exercises.length)];
    
    document.getElementById('exercise-category').textContent = todayExercise.category;
    document.getElementById('exercise-title').textContent = todayExercise.title;
    document.getElementById('exercise-description').textContent = todayExercise.description;
    document.getElementById('exercise-duration').textContent = todayExercise.duration;
    
    // Store the current exercise for feedback
    window.currentExercise = todayExercise;
}

async function loadSignatures() {
    const container = document.getElementById('signatures-container');
    
    // Sample signatures
    const signatures = [
        { name: "Alex Chen", location: "Taipei", commitment: "Committing to daily embodied empathy practice." },
        { name: "Maria Rodriguez", location: "Barcelona", commitment: "Protecting human creativity in an algorithmic world." },
        { name: "Kofi Mensah", location: "Accra", commitment: "Teaching the next generation to value tragic choice bearing." },
        { name: "Sakura Tanaka", location: "Kyoto", commitment: "Cultivating reverence for nature in all interactions." },
        { name: "Liam O'Connor", location: "Dublin", commitment: "Preserving soul-transforming dialogue in digital spaces." },
        { name: "Elena Petrova", location: "Moscow", commitment: "Rediscovering meaning in everyday absurdities." },
        { name: "David Kim", location: "Seoul", commitment: "Defending first-person consciousness in an age of data." }
    ];
    
    container.innerHTML = '';
    
    signatures.forEach(sig => {
        const item = document.createElement('div');
        item.className = 'signature-item';
        item.innerHTML = `
            <div class="signature-name">${sig.name}</div>
            <div class="signature-location">${sig.location}</div>
            <div class="signature-commitment">"${sig.commitment}"</div>
        `;
        container.appendChild(item);
    });
}

function initProgressChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    
    // Get user progress data
    const userProgress = UserProgress.getProgress();
    
    // Prepare data for the radar chart
    const progressData = {
        labels: ['Empathy', 'Meaning', 'Love', 'Intuition', 'Choice', 'Consciousness', 'History', 'Reverence', 'Dialogue'],
        datasets: [{
            label: 'Your Development',
            data: [
                userProgress.abilitiesProgress[1] || 0,
                userProgress.abilitiesProgress[2] || 0,
                userProgress.abilitiesProgress[3] || 0,
                userProgress.abilitiesProgress[4] || 0,
                userProgress.abilitiesProgress[5] || 0,
                userProgress.abilitiesProgress[6] || 0,
                userProgress.abilitiesProgress[7] || 0,
                userProgress.abilitiesProgress[8] || 0,
                userProgress.abilitiesProgress[9] || 0
            ],
            backgroundColor: [
                'rgba(76, 201, 240, 0.7)',
                'rgba(67, 97, 238, 0.7)',
                'rgba(58, 12, 163, 0.7)',
                'rgba(247, 37, 133, 0.7)',
                'rgba(181, 23, 158, 0.7)',
                'rgba(114, 9, 183, 0.7)',
                'rgba(86, 11, 173, 0.7)',
                'rgba(72, 12, 168, 0.7)',
                'rgba(58, 12, 163, 0.7)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
        }]
    };
    
    // Destroy existing chart if it exists
    if (window.progressChart) {
        window.progressChart.destroy();
    }
    
    window.progressChart = new Chart(ctx, {
        type: 'radar',
        data: progressData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        color: '#333',
                        font: {
                            size: 12,
                            family: 'Inter, sans-serif'
                        }
                    },
                    ticks: {
                        display: false,
                        maxTicksLimit: 5
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// User Progress Management System
const UserProgress = {
    // Initialize user progress
    init: function() {
        if (!localStorage.getItem('userProgress')) {
            this.resetProgress();
        }
        return this.getProgress();
    },
    
    // Reset progress
    resetProgress: function() {
        const progress = {
            userId: 'user_' + Date.now(),
            username: 'Anonymous User',
            joinDate: new Date().toISOString().split('T')[0],
            abilitiesProgress: {},
            completedExercises: [],
            badges: ['sprout'],
            reflections: [],
            totalTimeSpent: 0
        };
        
        // Initialize all ability progress to 0
        for (let i = 1; i <= 9; i++) {
            progress.abilitiesProgress[i] = 0;
        }
        
        localStorage.setItem('userProgress', JSON.stringify(progress));
        return progress;
    },
    
    // Get progress
    getProgress: function() {
        const progress = localStorage.getItem('userProgress');
        if (!progress) {
            return this.resetProgress();
        }
        return JSON.parse(progress);
    },
    
    // Update progress
    updateProgress: function(abilityId, exerciseId, timeSpent, reflection) {
        const progress = this.getProgress();
        
        // Update ability progress
        if (!progress.completedExercises.includes(exerciseId)) {
            progress.completedExercises.push(exerciseId);
            progress.abilitiesProgress[abilityId] = 
                Math.min(100, (progress.abilitiesProgress[abilityId] || 0) + 15);
        }
        
        // Add total time
        progress.totalTimeSpent += timeSpent;
        
        // Add reflection
        if (reflection) {
            progress.reflections.push({
                date: new Date().toISOString().split('T')[0],
                abilityId: abilityId,
                text: reflection
            });
        }
        
        // Check badges
        this.checkBadges(progress);
        
        // Save
        localStorage.setItem('userProgress', JSON.stringify(progress));
        return progress;
    },
    
    // Check badges
    checkBadges: function(progress) {
        const completedCount = progress.completedExercises.length;
        
        if (completedCount >= 3 && !progress.badges.includes('cultivator')) {
            progress.badges.push('cultivator');
        }
        
        if (completedCount >= 5 && !progress.badges.includes('guardian')) {
            progress.badges.push('guardian');
        }
        
        if (completedCount >= 8 && !progress.badges.includes('beacon')) {
            progress.badges.push('beacon');
        }
    }
};

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadAbilities();
        });
    });
    
    // Exercise timer
    const startBtn = document.getElementById('start-exercise');
    const timerDisplay = document.getElementById('exercise-timer');
    const skipBtn = document.getElementById('skip-exercise');
    const completeBtn = document.getElementById('complete-exercise');
    const feedbackSection = document.getElementById('exercise-feedback');
    const feedbackResult = document.getElementById('feedback-result');
    const saveReflectionBtn = document.getElementById('save-reflection');
    const skipReflectionBtn = document.getElementById('skip-reflection');
    
    let timerInterval;
    let timeLeft = 300; // 5 minutes in seconds
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            this.style.display = 'none';
            if (skipBtn) skipBtn.style.display = 'none';
            timerDisplay.style.display = 'block';
            
            timerInterval = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                document.getElementById('timer-display').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    document.getElementById('timer-display').textContent = "Time's up!";
                    if (completeBtn) completeBtn.disabled = false;
                }
            }, 1000);
        });
    }
    
    if (completeBtn) {
        completeBtn.addEventListener('click', function() {
            clearInterval(timerInterval);
            const timeSpent = 300 - timeLeft;
            
            // Store exercise completion info
            window.exerciseCompletion = {
                abilityId: window.currentExercise?.abilityId || 1,
                exerciseId: Math.floor(Math.random() * 1000),
                timeSpent: timeSpent,
                abilityName: window.currentExercise?.category?.split(' ')[0] + ' ' + window.currentExercise?.category?.split(' ')[1] || 'Embodied Empathy'
            };
            
            // Show feedback form
            timerDisplay.style.display = 'none';
            if (feedbackSection) feedbackSection.style.display = 'block';
        });
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            loadExercises(); // Load a new random exercise
        });
    }
    
    // Save reflection
    if (saveReflectionBtn) {
        saveReflectionBtn.addEventListener('click', function() {
            const reflection = document.getElementById('reflection-text')?.value.trim();
            
            if (reflection && reflection.length > 10) {
                // Update user progress
                UserProgress.updateProgress(
                    window.exerciseCompletion.abilityId,
                    window.exerciseCompletion.exerciseId,
                    window.exerciseCompletion.timeSpent,
                    reflection
                );
                
                // Show success message
                document.getElementById('ability-name').textContent = window.exerciseCompletion.abilityName;
                document.getElementById('total-completed').textContent = 
                    UserProgress.getProgress().completedExercises.length;
                
                if (feedbackSection) feedbackSection.style.display = 'none';
                if (feedbackResult) feedbackResult.style.display = 'block';
                
                // Update progress display
                updateProgressDisplay();
                
                // Reset after 3 seconds
                setTimeout(() => {
                    if (feedbackResult) feedbackResult.style.display = 'none';
                    if (startBtn) startBtn.style.display = 'inline-block';
                    if (skipBtn) skipBtn.style.display = 'inline-block';
                    timeLeft = 300;
                    document.getElementById('timer-display').textContent = "05:00";
                    if (document.getElementById('reflection-text')) {
                        document.getElementById('reflection-text').value = '';
                    }
                    
                    // Load new exercise
                    loadExercises();
                }, 3000);
            } else {
                alert("Please write a meaningful reflection (at least 10 characters) before saving.");
            }
        });
    }
    
    // Skip reflection
    if (skipReflectionBtn) {
        skipReflectionBtn.addEventListener('click', function() {
            // Still update progress without reflection
            UserProgress.updateProgress(
                window.exerciseCompletion.abilityId,
                window.exerciseCompletion.exerciseId,
                window.exerciseCompletion.timeSpent,
                null
            );
            
            // Show minimal success message
            if (feedbackSection) feedbackSection.style.display = 'none';
            
            // Reset UI
            if (startBtn) startBtn.style.display = 'inline-block';
            if (skipBtn) skipBtn.style.display = 'inline-block';
            timeLeft = 300;
            document.getElementById('timer-display').textContent = "05:00";
            if (document.getElementById('reflection-text')) {
                document.getElementById('reflection-text').value = '';
            }
            
            // Update progress display
            updateProgressDisplay();
            
            // Load new exercise
            loadExercises();
        });
    }
    
    // Signature submission
    const submitSignatureBtn = document.getElementById('submit-signature');
    if (submitSignatureBtn) {
        submitSignatureBtn.addEventListener('click', function() {
            const name = document.getElementById('user-name')?.value.trim();
            const location = document.getElementById('user-location')?.value.trim();
            const commitment = document.getElementById('user-commitment')?.value.trim();
            
            if (!name) {
                alert("Please enter your name or pseudonym.");
                return;
            }
            
            // Create signature element
            const container = document.getElementById('signatures-container');
            if (container) {
                const item = document.createElement('div');
                item.className = 'signature-item';
                item.innerHTML = `
                    <div class="signature-name">${name}</div>
                    <div class="signature-location">${location || 'Anonymous location'}</div>
                    <div class="signature-commitment">"${commitment || 'Committed to human empowerment'}"</div>
                `;
                
                // Add to beginning
                container.insertBefore(item, container.firstChild);
                
                // Clear form
                if (document.getElementById('user-name')) document.getElementById('user-name').value = '';
                if (document.getElementById('user-location')) document.getElementById('user-location').value = '';
                if (document.getElementById('user-commitment')) document.getElementById('user-commitment').value = '';
                
                // Update stats
                updateStats(0, 0, 1);
                
                alert("Thank you for joining our community of cultivators!");
            }
        });
    }
    
    // Save reflection in progress section
    const saveReflectionBtn2 = document.getElementById('save-reflection-btn');
    if (saveReflectionBtn2) {
        saveReflectionBtn2.addEventListener('click', function() {
            const reflection = document.getElementById('reflection-input')?.value.trim();
            
            if (!reflection || reflection.length < 10) {
                alert("Please write a meaningful reflection (at least 10 characters) before saving.");
                return;
            }
            
            // In a real implementation, would save to user's progress
            UserProgress.updateProgress(0, 0, 0, reflection);
            alert("Reflection saved to your personal journal!");
            document.getElementById('reflection-input').value = '';
            
            // Update stats
            updateStats(0, 1, 0);
            
            // Update progress display
            updateProgressDisplay();
        });
    }
    
    // Pilot project buttons
    document.getElementById('start-data-cleansing')?.addEventListener('click', function() {
        alert("AI Training Data Cleansing pilot coming soon! This will allow you to tag high-quality content to improve AI training data.");
    });
    
    document.getElementById('try-algorithm-tool')?.addEventListener('click', function() {
        alert("Algorithm Transparency Tool demo coming soon! You'll be able to adjust algorithm parameters and see how they affect your information environment.");
    });
    
    document.getElementById('join-dialog')?.addEventListener('click', function() {
        alert("Public Dialogue Experiment coming soon! Participate in structured rational conversations about important topics with other community members.");
    });
}

// Global functions
function startAbilityExercise(abilityId) {
    // Find the ability
    let ability;
    for (const dimension in abilitiesData) {
        const found = abilitiesData[dimension].find(a => a.id === abilityId);
        if (found) {
            ability = found;
            break;
        }
    }
    
    if (ability) {
        // Scroll to exercise section
        document.getElementById('daily-exercise')?.scrollIntoView({ behavior: 'smooth' });
        
        // Update exercise to match this ability
        document.getElementById('exercise-category').textContent = ability.category;
        document.getElementById('exercise-title').textContent = `${ability.title} Practice`;
        document.getElementById('exercise-description').textContent = 
            `Focus on developing your ${ability.title.toLowerCase()} through intentional practice. Set aside 10 minutes for focused cultivation of this ability.`;
        
        // Store as current exercise
        window.currentExercise = {
            category: ability.category,
            title: `${ability.title} Practice`,
            description: `Focus on developing your ${ability.title.toLowerCase()} through intentional practice.`,
            duration: "10 min",
            abilityId: ability.id
        };
    }
}

function learnMore(abilityId) {
    // Find the ability
    let ability;
    for (const dimension in abilitiesData) {
        const found = abilitiesData[dimension].find(a => a.id === abilityId);
        if (found) {
            ability = found;
            break;
        }
    }
    
    if (ability) {
        // Create a modal or alert with detailed information
        const modalContent = `
            <h3>${ability.title}</h3>
            <p><strong>Category:</strong> ${ability.category}</p>
            <p><strong>Description:</strong> ${ability.description}</p>
            <p><strong>AI Limitation:</strong> ${ability.aiLimitation}</p>
            <p><strong>Philosophical Basis:</strong> ${ability.philosophicalBasis}</p>
            ${ability.example ? `<p><strong>Example:</strong> ${ability.example}</p>` : ''}
        `;
        
        // Create a modal dialog
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${ability.title}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${modalContent}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary close-modal">Close</button>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(modal);
        
        // Add styles if not already present
        if (!document.querySelector('#modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }
                .modal-content {
                    background-color: white;
                    border-radius: 12px;
                    max-width: 600px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #eee;
                }
                .modal-header h2 {
                    margin: 0;
                    color: var(--primary-color);
                }
                .close-modal {
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: var(--gray-color);
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .modal-body h3 {
                    margin-bottom: 1rem;
                    color: var(--dark-color);
                }
                .modal-body p {
                    margin-bottom: 1rem;
                    color: var(--text-dark);
                    line-height: 1.6;
                }
                .modal-body strong {
                    color: var(--dark-color);
                }
                .modal-footer {
                    padding: 1.5rem;
                    border-top: 1px solid #eee;
                    text-align: right;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add close functionality
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}

function updateStats(exercises = 0, reflections = 0, signatures = 0) {
    // Update the displayed stats
    const cultivatorsEl = document.getElementById('total-cultivators');
    const exercisesEl = document.getElementById('total-exercises');
    const signaturesEl = document.getElementById('total-signatures');
    
    // Parse current values and update
    if (cultivatorsEl) {
        let currentCultivators = parseInt(cultivatorsEl.textContent.replace(/,/g, ''));
        cultivatorsEl.textContent = (currentCultivators + 1).toLocaleString();
    }
    
    if (exercisesEl) {
        let currentExercises = parseInt(exercisesEl.textContent.replace(/,/g, ''));
        exercisesEl.textContent = (currentExercises + exercises).toLocaleString();
    }
    
    if (signaturesEl) {
        let currentSignatures = parseInt(signaturesEl.textContent.replace(/,/g, ''));
        signaturesEl.textContent = (currentSignatures + signatures).toLocaleString();
    }
}

function updateLiveStats() {
    // Simulate live updates
    const exercisesEl = document.getElementById('total-exercises');
    const signaturesEl = document.getElementById('total-signatures');
    
    if (exercisesEl) {
        let currentExercises = parseInt(exercisesEl.textContent.replace(/,/g, ''));
        const exerciseIncrease = Math.floor(Math.random() * 3);
        exercisesEl.textContent = (currentExercises + exerciseIncrease).toLocaleString();
    }
    
    if (signaturesEl) {
        let currentSignatures = parseInt(signaturesEl.textContent.replace(/,/g, ''));
        const signatureIncrease = Math.floor(Math.random() * 2);
        signaturesEl.textContent = (currentSignatures + signatureIncrease).toLocaleString();
    }
}

function updateProgressDisplay() {
    const progress = UserProgress.getProgress();
    
    // Update badges display
    const badgeContainer = document.getElementById('badge-container');
    if (badgeContainer) {
        const badges = [
            { id: 'sprout', name: 'Sprout', icon: 'fas fa-seedling', earned: progress.badges.includes('sprout') },
            { id: 'cultivator', name: 'Cultivator', icon: 'fas fa-leaf', earned: progress.badges.includes('cultivator') },
            { id: 'guardian', name: 'Guardian', icon: 'fas fa-shield-alt', earned: progress.badges.includes('guardian') },
            { id: 'beacon', name: 'Beacon', icon: 'fas fa-star', earned: progress.badges.includes('beacon') }
        ];
        
        badgeContainer.innerHTML = '';
        badges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = `badge ${badge.earned ? 'earned' : ''}`;
            badgeEl.innerHTML = `
                <i class="${badge.icon}"></i>
                <span>${badge.name}</span>
            `;
            badgeContainer.appendChild(badgeEl);
        });
    }
    
    // Update the progress chart with new data
    initProgressChart();
}
