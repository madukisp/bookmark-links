const fs = require('fs');
const path = require('path');

// Function to get directories, excluding specific folders
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .map(file => path.join(srcpath, file))
        .filter(p => fs.statSync(p).isDirectory())
        .filter(dir => !['.git', '.github', 'node_modules'].includes(path.basename(dir)));
}

// Function to create or update the menu file in each directory
function updateMenuFiles(directories) {
    directories.forEach(dir => {
        const menuFileName = `${dir}-menu.md`;
        const menuFilePath = path.join(dir, menuFileName);

        // Gather .md files within the directory, excluding the menu file itself
        const mdFiles = fs.readdirSync(dir)
            .filter(file => file.endsWith('.md') && file !== menuFileName)
            .map(file => `- [${file.replace('.md', '')}](${dir}/${file})`) // Ensure the link points to the file within its directory
            .join('\n');

        // If there are no markdown files other than the menu, add a placeholder
        const menuContent = mdFiles.length > 0
            ? `# Menu for ${dir}\n\n${mdFiles}`
            : `# Menu for ${dir}\n\nNo additional documentation available.`;

        // Write the menu content or overwrite the existing menu file
        fs.writeFileSync(menuFilePath, menuContent);
    });
}

// Main function to update README and menu files
function updateReadmeAndMenus() {
    const directories = getDirectories('./');
    updateMenuFiles(directories); // Ensure all menu files exist and are updated
}

// Run the main function
updateReadmeAndMenus();
