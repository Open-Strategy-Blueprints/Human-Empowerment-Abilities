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
    
    // Setup event listeners
    setupEventListeners();
    
    // Update stats periodically
    setInterval(updateLiveStats, 30000);
}

// Abilities Data
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
            completed: 0
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
            completed: 0
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
            completed: 0
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
            completed: 0
        },
        {
            id: 5,
            number: "05",
            category: "Cognitive & Creative",
            title: "Tragic Choice Bearing",
            description: "Making and carrying the ethical burden of choices between incommensurable values.",
            aiLimitation: "Its choices are optimal solutions based on weight calculations, unable to experience eternal regret and life texture.",
            icon: "fas fa-balance-scale",
            color: "#b5179e",
            exercises: 4,
            completed: 0
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
            completed: 0
        }
    ],
    "practical": [
        {
            id: 7,
            number: "07",
            category: "Practical & Historical",
            title: "Historical Self-Reinvention",
            description: "Reinterpreting the past to gain new identity and future direction. History as a 'living textbook'.",
            aiLimitation: "History for it is a closed dataset for analysis, unable to engage in self-changing 'horizon fusion' with it.",
            icon: "fas fa-history",
            color: "#560bad",
            exercises: 5,
            completed: 0
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
            completed: 0
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
            completed: 0
        }
    ]
};

async function loadAbilities() {
    const container = document.getElementById('abilities-container');
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.dimension || 'emotional';
    
    container.innerHTML = '';
    
    abilitiesData[activeTab].forEach(ability => {
        const card = document.createElement('div');
        card.className = 'ability-card';
        card.innerHTML = `
            <div class="ability-header">
                <div class="ability-number">${ability.number}</div>
                <span class="ability-category">${ability.category}</span>
            </div>
            <h3 class="ability-title">${ability.title}</h3>
            <p class="ability-description">${ability.description}</p>
            <div class="ability-meta">
                <p><strong>AI Limitation:</strong> ${ability.aiLimitation}</p>
            </div>
            <div class="ability-footer">
                <div class="ability-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(ability.completed / ability.exercises) * 100}%"></div>
                    </div>
                    <span>${ability.completed}/${ability.exercises} exercises</span>
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
        }
    ];
    
    // Randomly select today's exercise
    const todayExercise = exercises[Math.floor(Math.random() * exercises.length)];
    
    document.getElementById('exercise-category').textContent = todayExercise.category;
    document.getElementById('exercise-title').textContent = todayExercise.title;
    document.getElementById('exercise-description').textContent = todayExercise.description;
    document.getElementById('exercise-duration').textContent = todayExercise.duration;
}

async function loadSignatures() {
    const container = document.getElementById('signatures-container');
    
    // Sample signatures - in real implementation would fetch from community/signatures.md
    const signatures = [
        { name: "Alex Chen", location: "Taipei", commitment: "Committing to daily embodied empathy practice." },
        { name: "Maria Rodriguez", location: "Barcelona", commitment: "Protecting human creativity in an algorithmic world." },
        { name: "Kofi Mensah", location: "Accra", commitment: "Teaching the next generation to value tragic choice bearing." },
        { name: "Sakura Tanaka", location: "Kyoto", commitment: "Cultivating reverence for nature in all interactions." },
        { name: "Liam O'Connor", location: "Dublin", commitment: "Preserving soul-transforming dialogue in digital spaces." }
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
    
    // Sample progress data
    const progressData = {
        labels: ['Empathy', 'Meaning', 'Love', 'Intuition', 'Choice', 'Consciousness', 'History', 'Reverence', 'Dialogue'],
        datasets: [{
            label: 'Your Development',
            data: [65, 40, 30, 75, 50, 35, 60, 45, 55],
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
    
    new Chart(ctx, {
        type: 'radar',
        data: progressData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
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
    
    // Initialize badges
    const badgeContainer = document.getElementById('badge-container');
    const badges = [
        { id: 'sprout', name: 'Sprout', icon: 'fas fa-seedling', earned: true },
        { id: 'cultivator', name: 'Cultivator', icon: 'fas fa-leaf', earned: false },
        { id: 'guardian', name: 'Guardian', icon: 'fas fa-shield-alt', earned: false },
        { id: 'beacon', name: 'Beacon', icon: 'fas fa-star', earned: false }
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
    
    let timerInterval;
    let timeLeft = 300; // 5 minutes in seconds
    
    startBtn.addEventListener('click', function() {
        this.style.display = 'none';
        skipBtn.style.display = 'none';
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
            }
        }, 1000);
    });
    
    completeBtn.addEventListener('click', function() {
        clearInterval(timerInterval);
        alert("Exercise completed! Your reflection has been saved to your progress journal.");
        timerDisplay.style.display = 'none';
        startBtn.style.display = 'inline-block';
        skipBtn.style.display = 'inline-block';
        timeLeft = 300;
        document.getElementById('timer-display').textContent = "05:00";
        
        // Update stats
        updateStats(1, 0, 0);
    });
    
    skipBtn.addEventListener('click', function() {
        loadExercises(); // Load a new random exercise
    });
    
    // Signature submission
    document.getElementById('submit-signature').addEventListener('click', function() {
        const name = document.getElementById('user-name').value.trim();
        const location = document.getElementById('user-location').value.trim();
        const commitment = document.getElementById('user-commitment').value.trim();
        
        if (!name) {
            alert("Please enter your name or pseudonym.");
            return;
        }
        
        // Create signature element
        const container = document.getElementById('signatures-container');
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
        document.getElementById('user-name').value = '';
        document.getElementById('user-location').value = '';
        document.getElementById('user-commitment').value = '';
        
        // Update stats
        updateStats(0, 0, 1);
        
        // In a real implementation, would save to community/signatures.md
        alert("Thank you for joining our community of cultivators!");
    });
    
    // Save reflection
    document.getElementById('save-reflection').addEventListener('click', function() {
        const reflection = document.getElementById('reflection-input').value.trim();
        
        if (!reflection) {
            alert("Please write a reflection before saving.");
            return;
        }
        
        // In a real implementation, would save to user's local storage or account
        alert("Reflection saved to your personal journal!");
        document.getElementById('reflection-input').value = '';
        
        // Update stats
        updateStats(0, 1, 0);
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
        document.getElementById('daily-exercise').scrollIntoView({ behavior: 'smooth' });
        
        // Update exercise to match this ability (simplified)
        document.getElementById('exercise-category').textContent = ability.title;
        document.getElementById('exercise-title').textContent = `${ability.title} Practice`;
        document.getElementById('exercise-description').textContent = 
            `Focus on developing your ${ability.title.toLowerCase()} through intentional practice. Set aside 10 minutes for focused cultivation of this ability.`;
    }
}

function learnMore(abilityId) {
    // In a real implementation, would navigate to ability detail page
    alert(`Detailed information and exercises for this ability would be displayed on a separate page. Ability ID: ${abilityId}`);
}

function updateStats(exercises = 0, reflections = 0, signatures = 0) {
    // Update the displayed stats
    const cultivatorsEl = document.getElementById('total-cultivators');
    const exercisesEl = document.getElementById('total-exercises');
    const signaturesEl = document.getElementById('total-signatures');
    
    // Parse current values and update
    let currentExercises = parseInt(exercisesEl.textContent.replace(/,/g, ''));
    let currentSignatures = parseInt(signaturesEl.textContent.replace(/,/g, ''));
    
    exercisesEl.textContent = (currentExercises + exercises).toLocaleString();
    signaturesEl.textContent = (currentSignatures + signatures).toLocaleString();
}

function updateLiveStats() {
    // Simulate live updates
    const exercisesEl = document.getElementById('total-exercises');
    const signaturesEl = document.getElementById('total-signatures');
    
    let currentExercises = parseInt(exercisesEl.textContent.replace(/,/g, ''));
    let currentSignatures = parseInt(signaturesEl.textContent.replace(/,/g, ''));
    
    // Random small increases to simulate community activity
    const exerciseIncrease = Math.floor(Math.random() * 3);
    const signatureIncrease = Math.floor(Math.random() * 2);
    
    exercisesEl.textContent = (currentExercises + exerciseIncrease).toLocaleString();
    signaturesEl.textContent = (currentSignatures + signatureIncrease).toLocaleString();
}
