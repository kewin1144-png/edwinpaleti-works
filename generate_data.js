const fs = require('fs');
const path = require('path');

const worksDir = path.join(__dirname, 'works');
const outputDataFile = path.join(__dirname, 'data.json');

const brandsData = {};

try {
    const brands = fs.readdirSync(worksDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const brand of brands) {
        const brandDir = path.join(worksDir, brand);
        const files = fs.readdirSync(brandDir, { withFileTypes: true })
            .filter(dirent => dirent.isFile() && !dirent.name.startsWith('.'))
            .map(dirent => dirent.name);
        
        brandsData[brand] = files.map(file => `works/${brand}/${file}`);
    }

    fs.writeFileSync(outputDataFile, JSON.stringify(brandsData, null, 2));
    console.log(`Successfully generated data.json with ${Object.keys(brandsData).length} brands.`);
} catch (error) {
    console.error('Error generating data.json:', error);
}
