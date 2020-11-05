var chalk = require('chalk');
var fs = require('fs');

module.exports = {
  input: ['!*', 'App.js', 'src/**/*.{js,jsx}'],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['t', 'i18n.t'],
      extensions: ['.js', '.jsx'],
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx'],
      fallbackKey(ns, value) {
        return value;
      },
      acorn: {
        ecmaVersion: 10, // defaults to 10
        sourceType: 'module', // defaults to 'module'
        // Check out https://github.com/acornjs/acorn/tree/master/acorn#interface for additional options
      },
    },
    lngs: ['en'],
    ns: ['scanner'],
    defaultLng: 'en',
    defaultNs: 'scanner',
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      // TODO: Multiple namespaces do not work, so save the output of the strings to `scanner`
      loadPath: 'assets/languages/rauma/{{lng}}.json',
      savePath: 'assets/languages/{{ns}}/{{lng}}.json',
      jsonIndent: 2,
      lineEnding: 'auto',
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
    removeUnusedKeys: true,
    plural: true,
  },
  transform: function customTransform(file, enc, done) {
    'use strict';
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    parser.parseFuncFromString(content, { list: ['i18next._', 'i18next.__'] }, (key, options) => {
      parser.set(
        key,
        Object.assign({}, options, {
          nsSeparator: false,
          keySeparator: false,
        })
      );
      ++count;
    });

    if (count > 0) {
      console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`);
    }

    done();
  },
};
