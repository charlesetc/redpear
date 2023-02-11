import * as chevrotain from "chevrotain";
const { createToken, EmbeddedActionsParser } = chevrotain;

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

class ApricotParser extends EmbeddedActionsParser {
  constructor() {
    super(TOKENS);
    const $ = this;

    $.RULE("findClause", () => {
      $.CONSUME(Find);
      let objectName = $.CONSUME(ObjectName).image;
      return {
        find: {
          objectName,
        },
      };
    });

    $.RULE("fieldAccessClause", () => {
      let fieldAccess = $.CONSUME(FieldAccess).image;
      return {
        fieldAccess,
      };
    });

    $.RULE("pipes", () => {
      let pipes = [];
      $.AT_LEAST_ONE_SEP({
        SEP: Pipe,
        DEF: () => {
          $.OR([
            {
              ALT: () => {
                let find = $.SUBRULE($.findClause);
                pipes.push(find);
              },
            },
            {
              ALT: () => {
                let fieldAccess = $.SUBRULE($.fieldAccessClause);
                pipes.push(fieldAccess);
              },
            },
          ]);
        },
      });
      return {
        pipes,
      };
    });

    $.RULE("expression", () => {
      return $.SUBRULE($.pipes);
    });

    $.RULE("program", () => {
      let program = [];
      $.MANY(() => {
        let expression = $.SUBRULE($.expression);
        program.push(expression);
      });
      return program;
    });

    this.performSelfAnalysis();
  }
}

// only ever one instance of the parser
const parserInstance = new ApricotParser();

function parse(input) {
  let lexResult = ApricotLexer.tokenize(input);
  if (lexResult.errors.length > 0) {
    return { lexErrors: lexResult.errors };
  }
  parserInstance.input = lexResult.tokens;
  const ast = parserInstance.expression();
  if (parserInstance.errors.length > 0) {
    return { parseErrors: parserInstance.errors };
  }
  console.log(ast);
  return { success: ast };
}

export function compile(input) {
  return parse(input);
}
