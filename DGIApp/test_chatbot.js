const axios = require('axios');

// Test questions in different languages
const testQuestions = [
    "Bonjour, comment allez-vous?",
    "Hello, how are you?",
    "Combien d'attestations avez-vous?",
    "How many attestations do you have?",
    "Quel est le statut de la demande?",
    "What is the status of the request?",
    "Montrez-moi les utilisateurs",
    "Show me the users"
];

async function testChatbot() {
    console.log('Testing chatbot language detection...\n');

    for (const question of testQuestions) {
        try {
            console.log(`Question: ${question}`);

            const response = await axios.post('http://localhost:8080/api/chatbot/ask', {
                question: question
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(`Response: ${response.data.answer}\n`);
            console.log('---\n');

            // Wait a bit between requests
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`Error testing question "${question}":`, error.response?.data || error.message);
            console.log('---\n');
        }
    }
}

testChatbot(); 