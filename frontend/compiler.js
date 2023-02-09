import * as chevrotain from "chevrotain";
const { createToken, CstParser } = chevrotain;

const Find = createToken({ name: "find", pattern: /find/ });
const Add = createToken({ name: "add", pattern: /add/ });
const Lt = createToken({ name: "lt", pattern: /</ });
const Gt = createToken({ name: "gt", pattern: />/ });
const Comma = createToken({ name: "comma", pattern: /,/ });
const FieldAccess = createToken({ name: "fieldAccess", pattern: /\.\w*/ });
const OpenParen = createToken({ name: "openParen", pattern: /\(/ });
const CloseParen = createToken({ name: "closeParen", pattern: /\)/ });
const ObjectName = createToken({ name: "objectName", pattern: /[A-Z]\w*/ });
const Identifier = createToken({ name: "identifier", pattern: /[a-z]\w*/ });
const Pipe = createToken({ name: "pipe", pattern: /\|/ });
const Whitespace = createToken({
  name: "whitespace",
  pattern: /[\s\t\n]+/,
  group: chevrotain.Lexer.SKIPPED,
});

const TOKENS = [
  Find,
  Add,
  ObjectName,
  Identifier,
  Pipe,
  FieldAccess,
  Comma,
  Whitespace,
  Lt,
  Gt,
  OpenParen,
  CloseParen,
];
const ApricotLexer = new chevrotain.Lexer(TOKENS);

class ApricotCstParserSingleton extends CstParser {
  constructor() {
    super(TOKENS);
    const $ = this;

    $.RULE("findClause", () => {
      $.CONSUME(Find);
      $.CONSUME(ObjectName);
    });

    $.RULE("fieldAccessClause", () => {
      $.CONSUME(FieldAccess);
    });

    $.RULE("pipes", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: Pipe,
        DEF: () => {
          $.OR([
            {
              ALT: () => {
                $.SUBRULE($.findClause);
              },
            },
            {
              ALT: () => {
                $.SUBRULE($.fieldAccessClause);
              },
            },
          ]);
        },
      });
    });

    $.RULE("expression", () => {
      $.SUBRULE($.pipes);
    });

    $.RULE("program", () => {
      $.MANY(() => {
        $.SUBRULE($.expression);
      });
    });

    this.performSelfAnalysis();
  }
}

// only ever one instance of the parser
const ApricotCSTParser = new ApricotCstParserSingleton();

export function compile(input) {
  let lexResult = ApricotLexer.tokenize(input);
  if (lexResult.errors) return { lexErrors: lexResult.errors };
  parser.input = lexResult.tokens;
  parser.program();
}
