const Configuration = {
  /*
   * Referenced packages must be installed
   */
  extends: ['@commitlint/config-conventional'],
  /*
   * Functions that return true if commitlint should ignore the given message.
   */
  /*
   * Any rules defined here will override rules from @commitlint/config-conventional
   */
  rules: {
    'subject-case': [2, 'always', 'sentence-case'],
    'type-empty': [2, 'never']
  },
  ignores: [(commit) => commit === ''],
  /*
   * Whether commitlint uses the default ignore rules.
   */
  defaultIgnores: true,
  /*
   * Custom URL to show upon failure
   */
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
  /*
   * Custom prompt configs
   */
  prompt: {
    alias: {},
    messages: {
      type: "Select the type of change that you're committing:",
      scope: 'Denote the SCOPE of this change (optional):',
      customScope: 'Denote the SCOPE of this change:',
      subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
      body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
      breaking: 'List any BREAKING CHANGES (optional). Use "|" to break new line:\n',
      footerPrefixesSelect: 'Select the ISSUES type of changeList by this change (optional):',
      customFooterPrefix: 'Input ISSUES prefix:',
      footer: 'List any ISSUES by this change. E.g.: #31, #34:\n',
      generatingByAI: 'Generating your AI commit subject...',
      generatedSelectByAI: 'Select suitable subject by AI generated:',
      confirmCommit: 'Are you sure you want to proceed with the commit above?'
    },
    types: [
      { value: 'feat', name: 'feat:     ✨  A new feature', emoji: ':sparkles:' },
      { value: 'fix', name: 'fix:      🐞  A bug fix', emoji: ':lady_beetle:' },
      { value: 'docs', name: 'docs:    📚  Documentation only changes', emoji: ':books:' },
      {
        value: 'style',
        name: 'style:    💄  Changes that do not affect the meaning of the code',
        emoji: ':lipstick:'
      },
      {
        value: 'refactor',
        name: 'refactor:    ♻️   A code change that neither fixes a bug nor adds a feature',
        emoji: ':recycle:'
      },
      {
        value: 'perf',
        name: 'perf:    ⚡️  A code change that improves performance',
        emoji: ':zap:'
      },
      {
        value: 'test',
        name: 'test:    ✅  Adding missing tests or correcting existing tests',
        emoji: ':white_check_mark:'
      },
      {
        value: 'build',
        name: 'build:    📦️   Changes that affect the build system or external dependencies',
        emoji: ':package:'
      },
      {
        value: 'ci',
        name: 'ci:       🎡  Changes to our CI configuration files and scripts',
        emoji: ':ferris_wheel:'
      },
      {
        value: 'chore',
        name: "chore:    🔨  Other changes that don't modify src or test files",
        emoji: ':hammer:'
      },
      {
        value: 'revert',
        name: 'revert:   ⏪️  Reverts a previous commit',
        emoji: ':rewind:'
      }
    ],
    useEmoji: true,
    emojiAlign: 'center',
    useAI: false,
    aiNumber: 1,
    themeColorCode: '',
    scopes: ['Site', 'Component', 'Process', 'Services', 'Topology', 'Shared', 'Core', 'Core UI', 'General'],
    allowCustomScopes: false,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'Leave Empty',
    upperCaseSubject: true,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [{ value: 'closed', name: 'closed:   ISSUES has been processed' }],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: Infinity,
    maxSubjectLength: 60,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: ''
  }
};

module.exports = Configuration;
