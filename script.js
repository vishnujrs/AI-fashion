// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const analyzeBtn = document.getElementById('analyzeBtn');
const suggestionsGrid = document.querySelector('.suggestions-grid');

// Upload functionality
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--secondary-color)';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'var(--primary-color)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.hidden = false;
            analyzeBtn.hidden = false;
        };
        reader.readAsDataURL(file);
    }
}

// Utility to hash a string (image data)
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Seeded shuffle utility
function seededShuffle(array, seed) {
    const arr = array.slice();
    let m = arr.length, t, i;
    let random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
    while (m) {
        i = Math.floor(random() * m--);
        t = arr[m];
        arr[m] = arr[i];
        arr[i] = t;
    }
    return arr;
}

// Function to analyze image and generate suggestions
async function analyzeImage(imageFile) {
    try {
        // Show loading state
        analyzeBtn.textContent = 'Analyzing...';
        analyzeBtn.disabled = true;

        // Create a loading indicator
        const suggestionsGrid = document.querySelector('.suggestions-grid');
        suggestionsGrid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Analyzing your image...</p>
            </div>
        `;

        // Simulate image analysis with a small delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get image data for analysis
        const imageData = await getImageData(imageFile);
        const gender = await detectGender(imageData);
        const seed = hashString(imageData);
        
        // Get suggestions based on detected gender
        const suggestions = gender === 'female' ? getFemaleSuggestions(seed) : getMaleSuggestions(seed);
        
        // Display the suggestions
        displaySuggestions(suggestions, gender);
        
        // Reset button state
        analyzeBtn.textContent = 'Analyze Image';
        analyzeBtn.disabled = false;
        
        // Scroll to suggestions
        document.querySelector('#suggestions').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error analyzing image:', error);
        alert('Error analyzing image. Please try again.');
    }
}

// Function to get image data
async function getImageData(imageFile) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.readAsDataURL(imageFile);
    });
}

// Improved gender detection function
async function detectGender(imageData) {
    // Create a temporary image element to analyze
    const img = new Image();
    img.src = imageData;
    
    return new Promise((resolve) => {
        img.onload = () => {
            // Here you would typically use a proper AI/ML model for gender detection
            // For demo purposes, we'll use some basic image analysis
            
            // Create a canvas to analyze the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // Get image data for analysis
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Simple analysis based on color patterns and image characteristics
            // This is a very basic example - in reality, you would use a proper ML model
            let brightness = 0;
            let colorVariation = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Calculate brightness
                brightness += (r + g + b) / 3;
                
                // Calculate color variation
                colorVariation += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
            }
            
            // Normalize values
            brightness = brightness / (data.length / 4);
            colorVariation = colorVariation / (data.length / 4);
            
            // Make a decision based on image characteristics
            // This is a simplified example - in reality, use proper ML
            const isFemale = brightness > 127 && colorVariation > 50;
            
            resolve(isFemale ? 'female' : 'male');
        };
    });
}

// Update getFemaleSuggestions and getMaleSuggestions to accept a seed
function getFemaleSuggestions(seed) {
    // All images are now real outfit/fashion images
    const allSuggestions = [
        {
            type: 'Elegant Casual',
            items: [
                'Floral Print Maxi Dress',
                'Light Denim Jacket',
                'White Sneakers',
                'Minimalist Gold Necklace'
            ],
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
            description: 'A perfect blend of comfort and style. The floral pattern and light colors complement your features.',
            platforms: {
                amazon: 'https://amazon.com/search?q=floral+maxi+dress',
                flipkart: 'https://flipkart.com/search?q=floral+maxi+dress',
                myntra: 'https://myntra.com/search?q=floral+maxi+dress'
            }
        },
        {
            type: 'Professional Look',
            items: [
                'Tailored Blazer',
                'Silk Blouse',
                'High-Waisted Pencil Skirt',
                'Pearl Earrings'
            ],
            image: 'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?w=500',
            description: 'Sophisticated office wear that enhances your professional appearance.',
            platforms: {
                amazon: 'https://amazon.com/search?q=women+blazer+blouse',
                flipkart: 'https://flipkart.com/search?q=women+blazer+blouse',
                myntra: 'https://myntra.com/search?q=women+blazer+blouse'
            }
        },
        {
            type: 'Weekend Style',
            items: [
                'Oversized Knit Sweater',
                'High-Waisted Jeans',
                'Ankle Boots',
                'Delicate Chain Bracelet'
            ],
            image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500',
            description: 'Comfortable yet stylish weekend wear that highlights your casual elegance.',
            platforms: {
                amazon: 'https://amazon.com/search?q=oversized+sweater+jeans',
                flipkart: 'https://flipkart.com/search?q=oversized+sweater+jeans',
                myntra: 'https://myntra.com/search?q=oversized+sweater+jeans'
            }
        },
        {
            type: 'Evening Glamour',
            items: [
                'Little Black Dress',
                'Statement Earrings',
                'Black Heeled Sandals',
                'Clutch Bag'
            ],
            image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500',
            description: 'Timeless elegance for special occasions. The classic LBD brings out your sophisticated style.',
            platforms: {
                amazon: 'https://amazon.com/search?q=little+black+dress',
                flipkart: 'https://flipkart.com/search?q=little+black+dress',
                myntra: 'https://myntra.com/search?q=little+black+dress'
            }
        },
        {
            type: 'Sporty Chic',
            items: [
                'Athleisure Hoodie',
                'Black Leggings',
                'Running Shoes',
                'Sport Watch'
            ],
            image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500',
            description: 'A sporty and comfortable look for active days.',
            platforms: {
                amazon: 'https://amazon.com/s?k=athleisure+hoodie',
                flipkart: 'https://flipkart.com/search?q=athleisure+hoodie',
                myntra: 'https://myntra.com/search?q=athleisure+hoodie'
            }
        }
    ];
    return seededShuffle(allSuggestions, seed).slice(0, 3);
}

function getMaleSuggestions(seed) {
    const allSuggestions = [
        {
            type: 'Smart Casual',
            items: [
                'Light Blue Oxford Shirt',
                'Khaki Chinos',
                'Brown Leather Loafers',
                'Minimalist Watch'
            ],
            image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=500',
            description: 'Perfect balance of casual and sophisticated. The light colors complement your features.',
            platforms: {
                amazon: 'https://amazon.com/search?q=oxford+shirt+chinos',
                flipkart: 'https://flipkart.com/search?q=oxford+shirt+chinos',
                myntra: 'https://myntra.com/search?q=oxford+shirt+chinos'
            }
        },
        {
            type: 'Business Professional',
            items: [
                'Navy Blue Suit',
                'White Dress Shirt',
                'Silk Tie',
                'Black Oxford Shoes'
            ],
            image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500',
            description: 'Classic business attire that enhances your professional appearance.',
            platforms: {
                amazon: 'https://amazon.com/search?q=navy+suit+white+shirt',
                flipkart: 'https://flipkart.com/search?q=navy+suit+white+shirt',
                myntra: 'https://myntra.com/search?q=navy+suit+white+shirt'
            }
        },
        {
            type: 'Weekend Casual',
            items: [
                'Graphic T-shirt',
                'Black Denim Jacket',
                'Slim Fit Jeans',
                'White Sneakers'
            ],
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
            description: 'Trendy and comfortable streetwear that matches your style.',
            platforms: {
                amazon: 'https://amazon.com/search?q=denim+jacket+graphic+tshirt',
                flipkart: 'https://flipkart.com/search?q=denim+jacket+graphic+tshirt',
                myntra: 'https://myntra.com/search?q=denim+jacket+graphic+tshirt'
            }
        },
        {
            type: 'Formal Evening',
            items: [
                'Black Tuxedo',
                'White Dress Shirt',
                'Black Bow Tie',
                'Patent Leather Shoes'
            ],
            image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=500',
            description: 'Elegant formal wear perfect for special occasions.',
            platforms: {
                amazon: 'https://amazon.com/search?q=black+tuxedo+formal',
                flipkart: 'https://flipkart.com/search?q=black+tuxedo+formal',
                myntra: 'https://myntra.com/search?q=black+tuxedo+formal'
            }
        },
        {
            type: 'Sporty Vibe',
            items: [
                'Athletic T-shirt',
                'Track Pants',
                'Running Shoes',
                'Sports Cap'
            ],
            image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=500',
            description: 'A sporty and comfortable look for active days.',
            platforms: {
                amazon: 'https://amazon.com/s?k=athletic+tshirt',
                flipkart: 'https://flipkart.com/search?q=athletic+tshirt',
                myntra: 'https://myntra.com/search?q=athletic+tshirt'
            }
        }
    ];
    return seededShuffle(allSuggestions, seed).slice(0, 3);
}

function displaySuggestions(suggestions, gender) {
    const suggestionsGrid = document.querySelector('.suggestions-grid');
    suggestionsGrid.innerHTML = `
        <div class="gender-header">
            <h2>Personalized Outfit Suggestions</h2>
            <p>Based on your style and features, here are some perfect outfit combinations for you</p>
        </div>
    `;

    suggestions.forEach(suggestion => {
        const suggestionCard = document.createElement('div');
        suggestionCard.className = 'suggestion-card';
        
        suggestionCard.innerHTML = `
            <div class="suggestion-image">
                <img src="${suggestion.image}" alt="${suggestion.type}">
            </div>
            <div class="suggestion-content">
                <h3>${suggestion.type}</h3>
                <p class="suggestion-description">${suggestion.description}</p>
                <div class="suggestion-items">
                    <h4>Complete Outfit:</h4>
                    <ul>
                        ${suggestion.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="platform-links">
                    <a href="${suggestion.platforms.amazon}" class="platform-link amazon" target="_blank">
                        <i class="fab fa-amazon"></i>
                        <span>Shop on Amazon</span>
                    </a>
                    <a href="${suggestion.platforms.flipkart}" class="platform-link flipkart" target="_blank">
                        <i class="fas fa-shopping-bag"></i>
                        <span>Shop on Flipkart</span>
                    </a>
                    <a href="${suggestion.platforms.myntra}" class="platform-link myntra" target="_blank">
                        <i class="fas fa-tshirt"></i>
                        <span>Shop on Myntra</span>
                    </a>
                </div>
            </div>
        `;

        suggestionsGrid.appendChild(suggestionCard);
    });
}

// Event listener for analyze button
document.getElementById('analyzeBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        analyzeImage(fileInput.files[0]);
    }
});

// Shopping cart functionality
let cart = [];

function addToCart(itemId) {
    // Add item to cart logic here
    console.log(`Added item ${itemId} to cart`);
    // Update cart UI
    updateCartUI();
}

function updateCartUI() {
    // Update cart display logic here
}

// Mobile navigation
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    nav.classList.toggle('active');
}); 