const axios = require('axios');

// Test the language detection with simple questions
const testQuestions = [
    "bonjour",
    "hello",
    "comment allez-vous?",
    "how are you?",
    "combien d'attestations?",
    "how many attestations?"
];

async function testLanguageDetection() {
    console.log('Testing improved language detection...\n');

    for (const question of testQuestions) {
        try {
            console.log(`Question: "${question}"`);

            const response = await axios.post('http://localhost:8080/api/chatbot/ask', {
                question: question
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(`Response: "${response.data.answer}"`);
            console.log('---\n');

            // Wait a bit between requests
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            if (error.response?.status === 401) {
                console.log(`Question: "${question}" - Requires authentication (expected)`);
                console.log('---\n');
            } else {
                console.error(`Error testing question "${question}":`, error.response?.data || error.message);
                console.log('---\n');
            }
        }
    }
}

testLanguageDetection(); 