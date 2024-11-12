(function() {
    const vscode = acquireVsCodeApi();

    // Tab functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    // Progress tracker
    function updateProgress(step) {
        document.querySelectorAll('.progress-step').forEach(el => {
            if (parseInt(el.dataset.step) <= step) {
                el.classList.add('completed');
            }
        });
    }

    // Example prompts
    const examplePrompts = {
        simple: `prompt simpleGreeting {
    "Hello! I'm a Pando AI assistant. How can I help you today?"
}`,
        conditional: `prompt conditionalResponse {
    "Do you prefer cats or dogs?"
    preference = input()
    
    if preference contains "cat" {
        "Cats are independent and make great companions!"
    } else if preference contains "dog" {
        "Dogs are loyal and always excited to see you!"
    } else {
        "Both cats and dogs can make wonderful pets!"
    }
}`,
        nested: `prompt nestedExample {
    "Let's calculate the area of a shape. Do you want to calculate the area of a circle or a rectangle?"
    shape = input()
    
    if shape contains "circle" {
        prompt circleArea {
            "What's the radius of the circle?"
            radius = input()
            area = 3.14 * (radius * radius)
            "The area of the circle is approximately {area} square units."
        }
    } else if shape contains "rectangle" {
        prompt rectangleArea {
            "What's the length of the rectangle?"
            length = input()
            "What's the width of the rectangle?"
            width = input()
            area = length * width
            "The area of the rectangle is {area} square units."
        }
    } else {
        "I'm sorry, I can only calculate the area of circles or rectangles."
    }
}`
    };

    // Load example prompt
    document.getElementById('example-prompts').addEventListener('change', (event) => {
        const promptTextarea = document.getElementById('demo-prompt');
        promptTextarea.value = examplePrompts[event.target.value] || '';
    });

    // Demo functionality
    document.getElementById('run-demo').addEventListener('click', () => {
        const prompt = document.getElementById('demo-prompt').value;
        const resultElement = document.getElementById('demo-result');
        resultElement.innerHTML = '<div class="loading">Executing prompt...</div>';
        resultElement.className = '';
        vscode.postMessage({
            command: 'executePandoPrompt',
            prompt: prompt
        });
        updateProgress(3);
    });

    // Handle messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        const resultElement = document.getElementById('demo-result');
        switch (message.command) {
            case 'pandoPromptExecutionStart':
                resultElement.innerHTML = '<div class="loading">Executing prompt...</div>';
                resultElement.className = '';
                break;
            case 'pandoPromptResult':
                try {
                    const result = JSON.parse(message.result);
                    if (message.status === 'success') {
                        resultElement.innerHTML = `<pre class="success">${JSON.stringify(result, null, 2)}</pre>`;
                        resultElement.className = 'success';
                    } else {
                        resultElement.innerHTML = `<pre class="error">${result}</pre>`;
                        resultElement.className = 'error';
                    }
                } catch (error) {
                    resultElement.innerHTML = `<pre class="error">${message.result}</pre>`;
                    resultElement.className = 'error';
                }
                break;
        }
    });

    // Search functionality
    document.getElementById('search-bar').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.section').forEach(section => {
            const content = section.textContent.toLowerCase();
            section.style.display = content.includes(searchTerm) ? 'block' : 'none';
        });
    });

    document.getElementById('show-welcome').addEventListener('change', (event) => {
        vscode.postMessage({
            command: 'setShowWelcomePage',
            value: event.target.checked
        });
    });

    // Initialize
    updateProgress(1);
})();
