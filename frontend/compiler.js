import * as chevrotain from "chevrotain";
const { createToken, EmbeddedActionsParser } = chevrotain;

const Find = createToken({ name: "find", pattern: /find/ });
const Add = createToken({ name: "add", pattern: /add/ });
const Colon = createToken({ name: "lt", pattern: /:/ });
const Lt = createToken({ name: "lt", pattern: /</ });
const Gt = createToken({ name: "gt", pattern: />/ });
const Comma = createToken({ name: "comma", pattern: /,/ });
const FieldAccess = createToken({ name: "fieldAccess", pattern: /\.\w*/ });
const OpenParen = createToken({ name: "openParen", pattern: /\(/ });
const CloseParen = createToken({ name: "closeParen", pattern: /\)/ });
const ObjectName = createToken({ name: "objectName", pattern: /[A-Z]\w*/ });
const Identifier = createToken({ name: "identifier", pattern: /[a-z]\w*/ });
const String = createToken({ name: "string", pattern: /"([^"]|\\")*"/ });
const Number = createToken({ name: "number", pattern: /-?\d+/ });
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
  Colon,
  Gt,
  OpenParen,
  CloseParen,
  String,
  Number,
];
const ApricotLexer = new chevrotain.Lexer(TOKENS);

class ApricotParser extends EmbeddedActionsParser {
  constructor() {
    super(TOKENS);
    const $ = this;

    $.RULE("parseObjectLiteral", () => {
      let objectName = $.CONSUME(ObjectName).image;
      let args = {};
      $.CONSUME(OpenParen);
      $.MANY_SEP({
        SEP: Comma,
        DEF: () => {
          let key = $.CONSUME(Identifier).image;
          $.CONSUME(Colon);
          let arg = $.SUBRULE($.expression);
          args[key] = arg;
        },
      });
      $.CONSUME(CloseParen);

      return {
        object: {
          objectName,
          args,
        },
      };
    });

    $.RULE("parseString", () => {
      let string = $.CONSUME(String).image;
      return {
        string,
      };
    });

    $.RULE("parseNumber", () => {
      let number = $.CONSUME(Number).image;
      return {
        number,
      };
    });

    $.RULE("parseFind", () => {
      $.CONSUME(Find);
      let objectName = $.CONSUME(ObjectName).image;
      return {
        find: {
          objectName,
        },
      };
    });

    $.RULE("parseFieldAccess", () => {
      let fieldAccess = $.CONSUME(FieldAccess).image.substring(1);
      return {
        fieldAccess,
      };
    });

    $.RULE("parsePipes", () => {
      let pipes = [];
      $.AT_LEAST_ONE_SEP({
        SEP: Pipe,
        DEF: () => {
          $.OR([
            {
              ALT: () => {
                let find = $.SUBRULE($.parseFind);
                pipes.push(find);
              },
            },
            {
              ALT: () => {
                let fieldAccess = $.SUBRULE($.parseFieldAccess);
                pipes.push(fieldAccess);
              },
            },
            {
              ALT: () => {
                let objectLiteral = $.SUBRULE($.parseObjectLiteral);
                pipes.push(objectLiteral);
              },
            },
            {
              ALT: () => {
                let string = $.SUBRULE($.parseString);
                pipes.push(string);
              },
            },
            {
              ALT: () => {
                let number = $.SUBRULE($.parseNumber);
                pipes.push(number);
              },
            },
          ]);
        },
      });
      if (pipes.length === 1) {
        return pipes[0];
      } else {
        return {
          pipes,
        };
      }
    });

    $.RULE("expression", () => {
      return $.SUBRULE($.parsePipes);
    });

    // $.RULE("program", () => {
    //   let program = [];
    //   $.MANY(() => {
    //     let expression = $.SUBRULE($.expression);
    //     program.push(expression);
    //   });
    //   return program;
    // });

    this.performSelfAnalysis();
  }
}

// only ever one instance of the parser
const parserInstance = new ApricotParser();

export function parse(input) {
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

// export function compile(input) {
//   return parse(input);
// }

const ID = "_id";

const store = [];

// TODO: this is broken. Multiple pipes don't work.
function evaluate(ast) {
  if (ast.pipes) {
    return ast.pipes.reduce((inputs, expr) => {
      if (expr.fieldAccess) {
        return inputs.map((obj) => obj[expr.fieldAccess]);
      } else {
        return evaluate(expr);
      }
    }, []);
  } else if (ast.find) {
    return store[ast.find.objectName] || [];
  } else if (ast.object) {
    return [ast.object];
  } else if (ast.string) {
    return [ast.string];
  } else if (ast.number) {
    return [ast.number];
  } else {
    throw new Error("Unknown expression");
  }
}

function potentiallySaveResult(result) {
  if (result.objectName && !result.args[ID]) {
    console.log(result);
    let newArgs = {};
    for (const [field, arg] of Object.entries(result.args)) {
      let newArg = potentiallySaveResult(arg);
      newArgs[field] = newArg;
    }
    if (!store[result.objectName]) store[result.objectName] = [];
    let id = Math.round(Math.random() * 10 ** 10);
    result.args[ID] = id;
    store[result.objectName].push(result.args);
    store[id] = result.args;
    return id;
  } else {
    return result;
  }
}

export function evaluate_and_save(ast) {
  let results = evaluate(ast);
  results.map(potentiallySaveResult);
  return results;
}
