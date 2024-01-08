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
    .filter(dir => !['.git', '.github', 'node_modules'].includes(path.basename(dir)));
}

// Function to create or update the menu file in each directory
function updateMenuFiles(directories) {
  directories.forEach(dir => {
    const menuFileName = `${dir}-menu.md`;
    const menuFilePath = path.join(dir, menuFileName);
    let mdFiles = fs.readdirSync(dir)
      .filter(file => file.endsWith('.md') && file !== menuFileName)
      .map(file => `- [${capitalize(file.replace('.md', ''))}](${dir}/${file})`)
      .join('\n');

    // If there are no markdown files other than the menu, add a placeholder
    if (!mdFiles) mdFiles = 'No additional documentation available.';

    const menuContent = `# Menu for ${capitalize(path.basename(dir))}\n\n## Index\n${mdFiles}\n`;
    fs.writeFileSync(menuFilePath, menuContent);
  });
}

// Function to create the index with links to menu files
function createIndex(directories) {
  const indexEntries = directories.map(dir => {
    const name = path.basename(dir);
    const menuFile = `${name}/${name}-menu.md`;
    return `- [${capitalize(name)}](${menuFile})`;
  });

  return `## Index\n${indexEntries.join('\n')}\n`;
}

// Main function to update README and menu files
function updateReadmeAndMenus() {
  const directories = getDirectories('./');
  updateMenuFiles(directories);
  const indexSection = createIndex(directories);

  let readmeContent = fs.readFileSync('README.md', 'utf8');
  // Use a regex to find the existing index section and replace it
  readmeContent = readmeContent.replace(/## Index\n(.|\n)*\n(?=## How to Contribute)/, indexSection);

  fs.writeFileSync('README.md', readmeContent);
}

updateReadmeAndMenus();
