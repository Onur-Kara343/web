// API Configuration
const API_BASE = window.location.origin;

// State
let currentExam = null;
let userAnswers = [];
let examSubmitted = false;
let uploadedDocuments = [];

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const fileListContainer = document.getElementById('fileListContainer');
const generateExamBtn = document.getElementById('generateExamBtn');
const clearFilesBtn = document.getElementById('clearFilesBtn');
const manualScriptBtn = document.getElementById('manualScriptBtn');
const examContainer = document.getElementById('examContainer');
const gradingPanel = document.getElementById('gradingPanel');
const parseStatus = document.getElementById('parseStatus');
const docCountSpan = document.getElementById('docCount');

// Load documents on page load
async function loadDocuments() {
    try {
        const response = await fetch(`${API_BASE}/api/documents`);
        const data = await response.json();
        if (data.documents) {
            uploadedDocuments = data.documents;
            updateFileListUI();
        }
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Update file list UI
function updateFileListUI() {
    if (!uploadedDocuments || uploadedDocuments.length === 0) {
        fileListContainer.innerHTML = '<div class="empty-state-small">📭 No files or scripts uploaded</div>';
        docCountSpan.textContent = '0 documents';
        return;
    }

    docCountSpan.textContent = `${uploadedDocuments.length} document(s)`;
    
    let html = '';
    uploadedDocuments.forEach((doc, idx) => {
        const preview = doc.contentPreview || (doc.content ? doc.content.substring(0, 70) : 'No preview');
        html += `
            <div class="file-item" data-id="${doc.id}">
                <div>
                    <div class="file-name">📄 ${escapeHtml(doc.name)}</div>
                    <div class="file-preview">${escapeHtml(preview)}...</div>
                </div>
                <button class="remove-file" data-id="${doc.id}" data-remove="${idx}">✖</button>
            </div>
        `;
    });
    fileListContainer.innerHTML = html;
    
    // Add remove event listeners
    document.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            // For demo, we need to clear via backend
            await clearAllContent();
            await loadDocuments();
            currentExam = null;
            renderExam();
            gradingPanel.style.display = 'none';
        });
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle file upload
async function uploadFiles(files) {
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    for (const file of files) {
        formData.append('files', file);
    }
    
    parseStatus.innerHTML = '📤 Uploading and processing files...';
    parseStatus.style.color = '#2c7da0';
    
    try {
        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            parseStatus.innerHTML = `✅ ${data.files.length} file(s) processed successfully!`;
            await loadDocuments();
            setTimeout(() => {
                parseStatus.innerHTML = '';
            }, 3000);
        } else {
            parseStatus.innerHTML = `❌ Error: ${data.error}`;
        }
    } catch (error) {
        console.error('Upload error:', error);
        parseStatus.innerHTML = '❌ Upload failed. Please try again.';
    }
}

// Add manual script
async function addManualScript() {
    const title = prompt('Enter a title for this script:', 'Study Notes');
    if (title === null) return;
    
    const content = prompt('📝 Enter your script/study notes (minimum 10 characters):', 
        'JavaScript Promises are essential for async programming. The event loop handles callbacks. Understanding closures helps with module patterns.');
    
    if (!content || content.trim().length < 10) {
        alert('Please enter at least 10 characters of content.');
        return;
    }
    
    parseStatus.innerHTML = '📝 Adding manual script...';
    
    try {
        const response = await fetch(`${API_BASE}/api/script`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title || 'Manual Script', content: content })
        });
        
        const data = await response.json();
        
        if (data.success) {
            parseStatus.innerHTML = '✅ Manual script added successfully!';
            await loadDocuments();
            setTimeout(() => {
                parseStatus.innerHTML = '';
            }, 2000);
        } else {
            parseStatus.innerHTML = `❌ Error: ${data.error}`;
        }
    } catch (error) {
        console.error('Error adding script:', error);
        parseStatus.innerHTML = '❌ Failed to add script.';
    }
}

// Generate exam
async function generateExam() {
    parseStatus.innerHTML = '🧠 Generating exam from your materials...';
    
    try {
        const response = await fetch(`${API_BASE}/api/generate-exam`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numQuestions: 8 })
        });
        
        const data = await response.json();
        
        if (data.success && data.questions && data.questions.length > 0) {
            currentExam = { questions: data.questions };
            userAnswers = new Array(currentExam.questions.length).fill(null);
            examSubmitted = false;
            renderExam();
            gradingPanel.style.display = 'none';
            parseStatus.innerHTML = `✨ Exam generated with ${data.questions.length} questions from ${data.sourceDocuments} source(s)!`;
            setTimeout(() => {
                parseStatus.innerHTML = '';
            }, 3000);
        } else {
            parseStatus.innerHTML = `❌ ${data.error || 'Could not generate exam. Add more content.'}`;
        }
    } catch (error) {
        console.error('Generate exam error:', error);
        parseStatus.innerHTML = '❌ Failed to generate exam. Please try again.';
    }
}

// Render exam
function renderExam() {
    if (!currentExam || !currentExam.questions || currentExam.questions.length === 0) {
        examContainer.innerHTML = `
            <div class="empty-state">
                📖 No active exam<br>
                Upload PDFs/scripts and click "Generate Exam"
            </div>
        `;
        return;
    }
    
    const questions = currentExam.questions;
    let html = `<div><h3 style="margin-bottom: 1rem;">📋 Exam (${questions.length} questions)</h3>`;
    
    questions.forEach((q, idx) => {
        const selectedVal = userAnswers[idx] !== null ? userAnswers[idx] : '';
        html += `
            <div class="question-card" data-qid="${idx}">
                <div class="question-text">${idx + 1}. ${escapeHtml(q.text)}</div>
                <div class="options">
        `;
        
        q.options.forEach((opt, optIdx) => {
            const isChecked = (userAnswers[idx] === optIdx);
            html += `
                <label class="option">
                    <input type="radio" name="q${idx}" value="${optIdx}" ${isChecked ? 'checked' : ''}>
                    <span>${escapeHtml(opt)}</span>
                </label>
            `;
        });
        
        html += `</div></div>`;
    });
    
    html += `
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button id="submitExamBtn" class="btn btn-primary">✅ Submit Exam & Grade</button>
            <button id="resetExamBtn" class="btn btn-secondary">🔄 Reset All Answers</button>
        </div>
    `;
    
    examContainer.innerHTML = html;
    
    // Add event listeners
    questions.forEach((_, idx) => {
        const radios = document.querySelectorAll(`input[name="q${idx}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (!examSubmitted) {
                    userAnswers[idx] = parseInt(e.target.value);
                } else {
                    alert('Exam already graded. Generate a new exam to retake.');
                }
            });
        });
    });
    
    document.getElementById('submitExamBtn')?.addEventListener('click', evaluateExam);
    document.getElementById('resetExamBtn')?.addEventListener('click', () => {
        if (!currentExam) return;
        userAnswers.fill(null);
        examSubmitted = false;
        renderExam();
        gradingPanel.style.display = 'none';
    });
}

// Evaluate exam
function evaluateExam() {
    if (!currentExam) return;
    
    const questions = currentExam.questions;
    let score = 0;
    const results = [];
    
    for (let i = 0; i < questions.length; i++) {
        const userChoice = userAnswers[i];
        const isCorrect = (userChoice !== null && userChoice === questions[i].correctIndex);
        if (isCorrect) score++;
        
        results.push({
            correct: isCorrect,
            correctAnswer: questions[i].options[questions[i].correctIndex],
            explanation: questions[i].explanation,
            userChoice: userChoice !== null ? questions[i].options[userChoice] : 'Not answered'
        });
    }
    
    const percentage = (score / questions.length) * 100;
    let gradeText = '';
    let gradeEmoji = '';
    
    if (percentage >= 90) { gradeEmoji = '🏆'; gradeText = 'Excellent! Mastery level'; }
    else if (percentage >= 75) { gradeEmoji = '🎉'; gradeText = 'Very Good! Strong understanding'; }
    else if (percentage >= 60) { gradeEmoji = '👍'; gradeText = 'Good, but review weak areas'; }
    else if (percentage >= 45) { gradeEmoji = '📚'; gradeText = 'Fair, needs more study'; }
    else { gradeEmoji = '📖'; gradeText = 'Needs improvement, review materials'; }
    
    let feedbackHtml = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <div class="score-badge">${gradeEmoji} ${score}/${questions.length} (${percentage.toFixed(1)}%)</div>
            <div class="feedback-text">${gradeText}</div>
        </div>
        <button id="regenerateFromGradeBtn" class="btn btn-outline full-width" style="margin-bottom: 1rem;">
            🔄 Generate New Exam
        </button>
        <hr style="margin: 1rem 0; border-color: #cbdde6;">
        <div style="max-height: 350px; overflow-y: auto;">
    `;
    
    results.forEach((res, idx) => {
        feedbackHtml += `
            <div class="result-item ${res.correct ? 'result-correct' : 'result-incorrect'}">
                <div><strong>Q${idx + 1}</strong> ${res.correct ? '✅ Correct' : '❌ Incorrect'}</div>
                <div style="margin-top: 6px; font-size: 0.8rem;">
                    <div>📌 Your answer: ${escapeHtml(res.userChoice)}</div>
                    <div>✓ Correct: ${escapeHtml(res.correctAnswer)}</div>
                    <div style="margin-top: 6px; color: #2c7da0;">💡 ${escapeHtml(res.explanation)}</div>
                </div>
            </div>
        `;
    });
    
    feedbackHtml += `</div>`;
    gradingPanel.innerHTML = feedbackHtml;
    gradingPanel.style.display = 'block';
    examSubmitted = true;
    
    document.getElementById('regenerateFromGradeBtn')?.addEventListener('click', () => {
        generateExam();
    });
}

// Clear all content
async function clearAllContent() {
    try {
        const response = await fetch(`${API_BASE}/api/clear`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            uploadedDocuments = [];
            updateFileListUI();
            currentExam = null;
            renderExam();
            gradingPanel.style.display = 'none';
            parseStatus.innerHTML = '🗑 All content cleared.';
            setTimeout(() => {
                parseStatus.innerHTML = '';
            }, 2000);
        }
    } catch (error) {
        console.error('Clear error:', error);
    }
}

// Event Listeners
uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async (e) => {
    await uploadFiles(Array.from(e.target.files));
    fileInput.value = '';
});

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#2c7da0';
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '#bdd9e7';
});

uploadZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '#bdd9e7';
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
});

generateExamBtn.addEventListener('click', generateExam);
clearFilesBtn.addEventListener('click', clearAllContent);
manualScriptBtn.addEventListener('click', addManualScript);

// Initialize
loadDocuments();