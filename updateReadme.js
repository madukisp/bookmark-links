const fs = require('fs');
const path = require('path');

// Function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to get directories, excluding specific folders
function getDirectories(srcpath) {
  return fs.readdirSync(srcpath)
    .map(file => path.join(srcpath, file))
    .filter(p => fs.statSync(p).isDirectory())
    .filter(dir => !['.git', '.github', 'node_modules'].includes(path.basename(dir))); // Exclude specific directories
}

// Function to create or update the menu file in each directory
function updateMenuFiles(directories) {
  directories.forEach(dir => {
    const menuFileName = `${dir}-menu.md`;
    const menuFilePath = path.join(dir, menuFileName);
    const mdFiles = fs.readdirSync(dir)
      .filter(file => file.endsWith('.md') && file !== menuFileName)
      .map(file => `- [${capitalize(file.replace('.md', '').replace(/-/g, ' '))}](${file})`)
      .join('\n');

    const menuContent = `# Menu for ${capitalize(path.basename(dir))}\n\n${mdFiles}`;
    fs.writeFileSync(menuFilePath, menuContent);
  });
}

// Function to create the index with links to menu files
function createIndex(directories) {
  return directories.map(dir => {
    const name = path.basename(dir);
    const menuFile = `${name}/${name}-menu.md`; // Build the path to the menu file
    return `- [${capitalize(name)}](${menuFile})`;
  }).join('\n');
}

// Main function to update README and menu files
function updateReadmeAndMenus() {
  const directories = getDirectories('./');
  updateMenuFiles(directories); // Ensure all menu files exist and are updated
  const index = createIndex(directories);

  // Replace the Index section of the README.md file
  const readmeContent = fs.readFileSync('README.md', 'utf8');
  const startIndex = readmeContent.indexOf('## Index\n');
  const endIndex = readmeContent.indexOf('\n', startIndex + 1);
  const beforeIndex = readmeContent.substring(0, startIndex);
  const afterIndex = readmeContent.substring(endIndex);

  // Construct the updated README content
  const updatedReadme = `${beforeIndex}## Index\n${index}\n${afterIndex}`;

  // Write the updated README back to the file
  fs.writeFileSync('README.md', updatedReadme);
}

// Run the main function
updateReadmeAndMenus();
