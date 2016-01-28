## Sigma & Libratone 360 degree video landing page

We're using a forked version of the ([Gulp](https://github.com/gulpjs/gulp)-based) Google [Web Starter Kit](https://github.com/google/web-starter-kit/) for development. This repo is the contents of the working directory (/app/ in WSK).

Should be perfectly usable with other build tools like Grunt, etc as well. The only initial requirement is a CSS pre-processor as we're using SCSS.

### Getting started:

1. Clone https://github.com/google/web-starter-kit/ 
2. With terminal/CLI navigate to the cloned directory and run `npm install`
3. If you're familiar with Gulp, set it up to your liking; delete the contents of /app/ and replace them contents of this repo (or from the /app/ directory run`git clone (this repo url).git .` to clone the repo directly.
4. If you're not familiar with Gulp, replace WSK's gulpfile.babel.js with this gist: https://gist.github.com/tjallen/f629eba4953316679b10 which comments out some potential issues with the image/styles tasks. 
5. Use the commands below or add your own to the Gulpfile

### Common WSK gulp commands:

`gulp serve` starts a local connect web server with livereload, etc - changes to markup, styles, scripts in the working directory should trigger a reload or get injected directly.

`gulp` builds production files to the /dist/ directory (minified styles, uglified js etc)

There are other commands but see the WSK readme for that.

### Notes:

- Stylesheets are set up to use the [7-1 pattern](http://sass-guidelin.es/#the-7-1-pattern). See the readmes in each styles subdirectory for what should go where.

