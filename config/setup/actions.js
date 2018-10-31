/* eslint-disable */

const prompt = require('prompt');
const { exec } = require('child_process');

// Constants
const { packages } = require('./packages');
const { schema } = require('./schema');

// Utilities
const {
  filesReadWriteAsync,
  bold,
  dim,
  error,
  highlight,
  isNo,
  isYes,
  underline,
  warn,
} = require('./utils');

// When you've exit the setup
const exited = () => {
  console.log(warn(`
        
🚧  Exited without doing anything
`));
};

/**
 * The finalizing step, when you finish up the setup
 * @param {object} project      The project data
 * @param {object} [variants]   The different variants based on what you've selected, or preconfigured
 * @returns {function}
 */
const finishSetup = (project, variants) => {
  const executeConfig = {
    git: variants && variants.git || false,
    install: variants && variants.install || true,
    preserveFolder: variants && variants.preserveFolder || false,
    removeSetup: variants && variants.removeSetup || true,
    removeGit: variants && variants.removeGit || false,
  };

  // If they don't want to add Git, but want to remove it.
  if (executeConfig.removeGit && !executeConfig.git) {
    exec('rm -rf .git');
  }

  // If they want to add git, then clone it down and replace the Boilerplates git.
  if (executeConfig.git && project && project.ownRepo) {
    exec(`rm -rf .git &&
    git clone --no-checkout ${project.ownRepo} .gitTemp &&
    mv ./.gitTemp/.git ./.git &&
    rm -rf .gitTemp`);
  }

  // Strings to replace in the project. like Project Title and Machine name in Like package.json / index.html
  filesReadWriteAsync([
    {
      match: '%project_title%',
      replace: project.title,
      file: 'public/index-full.html',
    },
    {
      match: 'project_title',
      replace: project.machine,
      file: 'package.json',
    },
  ]);

  // If the selected package have specific modules, make sure we'll install those
  if (executeConfig.install) {
    exec('yarn install');
  }

  // Remove setup folders
  if (executeConfig.removeSetup) {
    exec('rm -rf ./config/setup');
  }

  console.log(`
❤️  Great! We'll start setting up your project.
Thank you for using the boilerplate for your React project.

${bold('Here\'s some quick commands to get you started.')}
${underline('Development')}
yarn start 

${underline('Production Build')}
yarn build
`);
};

/**
 * Get Project Name
 * @param {object} project      The project data
 * @param {function} func       The function you want to be executed if successful.
 * @returns {function}
 */
const getProjectName = (project, func) => {
  console.log(bold('What\'s the name of your project?'));

  prompt.get(schema.name, (err, result) => {
    if (result) {

      if (result.machine) {
        // Save the machine name in the Project object
        project.machine = result.machine;
      }

      if (result.title) {
        // Save the project title in the Project object
        project.title = result.title;
      }

      // Save the name as a variable
      console.log(`
🙌 Great! We'll call your project ${highlight(result.name)}.
`);
      if (!!func) return func();
    } else {
      exited();
    }
  });
};

/**
 * Get Packages
 * @param {object} [project]    The project data
 * @param {function} func       The function you want to be executed if successful.
 * @returns {function}
 */
const getPackages = (project, func) => {
  console.log(`Now, this is the available packages:`);

  // Output Each Package
  packages.forEach(variant => {
    console.log(`${variant.id} ${variant.title}`);
  });

  console.log(`
${bold('Which package do you want to install?')} 
${dim('Select it by writing it\'s key [0-9]')}`);

  prompt.get(schema.packages, (err, result) => {
    if (result && result.package) {
      const activePackage = packages.find(variant => variant.id === result.package);
      if (!!activePackage && !!func) {

        // Checkout the selected branch
        exec(`git checkout ${activePackage.branch}`);

        console.log(`
📦 Amazing! You've select the ${highlight(activePackage.title)} package.
`);
        if (!!func) return func();
      } else {
        // If the key you've entered doesn't exist. Try again.
        console.log(error('The key you\'ve entered doesn\'t exists'));
        getPackages(project, func);
      }
    } else {
      exited();
    }
  });
};

/**
 * Setup the git configuration
 * @param {object} [project]    The project data
 * @param {function} func       The function you want to be executed if successful.
 * @returns {function}
 */
const setupGit = (project, func) => {
  console.log(bold('Awesome! Let\'s setup git, shall we?'));

  prompt.get(schema.git, (err, result) => {
    if (result) {

      // If you don't want to remove local git.
      if (isNo(result.removeLocal) && !isYes(result.addOwnRepo)) {
        console.log(highlight(`
Alright, we\'ll keep the boilerplate repository, and start setting up
`));
        return finishSetup(project);
      }

      // If you want to remove local git, but don't want to add your own.
      if (isYes(result.removeLocal) && isNo(result.addOwnRepo)) {
        console.log(highlight(`
Alright, we\'ll delete the boilerplate repository, and start setting up
`));
        return finishSetup(project, { removeGit: true });
      }

      // If you've removed local git and want to add your own
      if (isYes(result.addOwnRepo) && result.ownRepo.length > 0) {
        project.ownRepo = result.ownRepo;
        return func();
      }

    } else {
      exited();
    }
  });
};

// Exporting
module.exports = {
  finishSetup,
  getPackages,
  getProjectName,
  setupGit,
};