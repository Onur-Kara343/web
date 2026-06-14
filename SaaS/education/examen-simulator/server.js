const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and TXT files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory storage for uploaded content (for demo)
let uploadedContent = [];

// Helper: Extract text from PDF buffer
async function extractTextFromPDF(buffer) {
    try {
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to parse PDF');
    }
}

// Routes

// Upload files endpoint
app.post('/api/upload', upload.array('files', 5), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const results = [];

        for (const file of files) {
            let textContent = '';
            
            if (file.mimetype === 'application/pdf') {
                const buffer = fs.readFileSync(file.path);
                textContent = await extractTextFromPDF(buffer);
            } else if (file.mimetype === 'text/plain') {
                textContent = fs.readFileSync(file.path, 'utf8');
            }

            // Store content
            const contentItem = {
                id: Date.now() + '-' + Math.random(),
                name: file.originalname,
                content: textContent,
                type: file.mimetype,
                uploadedAt: new Date()
            };
            
            uploadedContent.push(contentItem);
            results.push({
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
                contentLength: textContent.length
            });

            // Clean up temp file
            fs.unlinkSync(file.path);
        }

        res.json({ 
            success: true, 
            files: results,
            totalDocuments: uploadedContent.length
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add manual script/text
app.post('/api/script', (req, res) => {
    const { title, content } = req.body;
    
    if (!content || content.trim().length < 10) {
        return res.status(400).json({ error: 'Content must be at least 10 characters' });
    }

    const scriptItem = {
        id: Date.now() + '-' + Math.random(),
        name: title || `Manual Script ${uploadedContent.length + 1}`,
        content: content,
        type: 'text/plain',
        uploadedAt: new Date(),
        isManual: true
    };

    uploadedContent.push(scriptItem);
    res.json({ success: true, document: scriptItem, totalDocuments: uploadedContent.length });
});

// Generate exam from all uploaded content
app.post('/api/generate-exam', (req, res) => {
    const { numQuestions = 8 } = req.body;
    
    if (uploadedContent.length === 0) {
        return res.status(400).json({ error: 'No content available. Please upload PDFs or scripts first.' });
    }

    // Combine all content
    let corpus = '';
    uploadedContent.forEach(doc => {
        corpus += doc.content + '\n\n';
    });

    if (corpus.trim().length < 100) {
        return res.status(400).json({ error: 'Not enough content. Minimum 100 characters required.' });
    }

    // Generate questions using NLP-like heuristics
    const questions = generateQuestions(corpus, Math.min(12, Math.max(5, numQuestions)));
    
    if (questions.length < 3) {
        return res.status(400).json({ error: 'Could not generate sufficient questions. Add more diverse content.' });
    }

    res.json({ 
        success: true, 
        questions: questions,
        totalQuestions: questions.length,
        sourceDocuments: uploadedContent.length
    });
});

// Get all uploaded documents
app.get('/api/documents', (req, res) => {
    const docs = uploadedContent.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        uploadedAt: doc.uploadedAt,
        contentPreview: doc.content.substring(0, 100)
    }));
    res.json({ documents: docs });
});

// Clear all content
app.delete('/api/clear', (req, res) => {
    uploadedContent = [];
    res.json({ success: true, message: 'All content cleared' });
});

// Helper: Generate intelligent questions from corpus
function generateQuestions(corpus, targetCount) {
    // Extract sentences
    const sentences = corpus.match(/[^.!?]+[.!?]+/g) || [corpus];
    const validSentences = sentences.filter(s => s.trim().length > 30 && s.trim().length < 300);
    
    // Extract key terms (words that appear frequently)
    const words = corpus.toLowerCase().split(/\s+/);
    const wordFreq = {};
    words.forEach(w => {
        if (w.length > 4 && !['there', 'these', 'those', 'would', 'could', 'should', 'their', 'about', 'which', 'from', 'have', 'with'].includes(w)) {
            wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
    });
    
    const keyTerms = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(entry => entry[0]);
    
    const selectedSentences = validSentences.slice(0, targetCount);
    const questions = [];
    
    for (let i = 0; i < selectedSentences.length && questions.length < targetCount; i++) {
        const sentence = selectedSentences[i];
        
        // Find a key term from the sentence
        let correctAnswer = keyTerms.find(term => sentence.toLowerCase().includes(term));
        if (!correctAnswer && keyTerms.length > 0) {
            correctAnswer = keyTerms[Math.floor(Math.random() * keyTerms.length)];
        }
        if (!correctAnswer) continue;
        
        // Create question stem
        const displaySentence = sentence.length > 150 ? sentence.substring(0, 147) + '...' : sentence;
        const questionText = `Based on your material: "${displaySentence}"\n\nWhat is the key concept or term being discussed?`;
        
        // Generate distractors
        const otherTerms = keyTerms.filter(t => t !== correctAnswer).slice(0, 3);
        while (otherTerms.length < 3) {
            otherTerms.push('Implementation', 'Framework', 'Analysis', 'Component', 'Architecture');
        }
        
        let options = [correctAnswer, ...otherTerms.slice(0, 3)];
        // Shuffle options
        for (let j = options.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [options[j], options[k]] = [options[k], options[j]];
        }
        
        const correctIndex = options.indexOf(correctAnswer);
        const explanation = `The term "${correctAnswer}" is directly relevant to the context: "${sentence.substring(0, 100)}". Understanding this concept is crucial for mastering the material.`;
        
        questions.push({
            id: i,
            text: questionText,
            options: options.map((opt, idx) => `${String.fromCharCode(65+idx)}. ${opt}`),
            correctIndex: correctIndex,
            explanation: explanation,
            concept: correctAnswer
        });
    }
    
    return questions;
}

// Serve the main HTML for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Exam Simulator SaaS running on http://localhost:${PORT}`);
    console.log(`📚 Ready to generate exams from PDFs and scripts`);
});