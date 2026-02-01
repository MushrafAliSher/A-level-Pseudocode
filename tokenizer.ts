
import { Token, TokenType } from '../types';

export function tokenize(code: string): Token[] {
  const tokenSpecs: [TokenType, RegExp][] = [
    [TokenType.WHITESPACE, /^\s+/],
    [TokenType.COMMENT, /^\/\/.*|^\/\*[\s\S]*?\*\//],
    [TokenType.STRING_LITERAL, /^"([^"]*)"|^'([^']*)'/],
    [TokenType.REAL_LITERAL, /^\d+\.\d+/],
    [TokenType.INTEGER_LITERAL, /^\d+/],
    // Expanded Keywords for full 9618 compliance
    [TokenType.KEYWORD, /^(DECLARE|CONSTANT|TYPE|ENDTYPE|INPUT|OUTPUT|IF|THEN|ELSE|ENDIF|CASE|OF|OTHERWISE|ENDCASE|FOR|TO|STEP|NEXT|WHILE|DO|ENDWHILE|REPEAT|UNTIL|PROCEDURE|ENDPROCEDURE|FUNCTION|RETURNS|RETURN|CALL|BYREF|BYVAL|ARRAY|OF|INTEGER|REAL|STRING|BOOLEAN|CHAR|DATE|MOD|DIV|AND|OR|NOT|TRUE|FALSE)\b/i],
    [TokenType.IDENTIFIER, /^[a-zA-Z_][a-zA-Z0-9_]*/],
    [TokenType.ASSIGN, /^(←|<-)/], // Support both standard and alt assignment
    [TokenType.COMP_OP, /^(<>|<=|>=|<|>|=)/],
    [TokenType.OP, /^[+\-*/&^]/],
    [TokenType.PUNCTUATION, /^[:,()[\]\.]/]
  ];

  let tokens: Token[] = [];
  let line = 1, col = 1;
  let cursor = 0;

  while (cursor < code.length) {
    let char = code.slice(cursor);
    let matched = false;

    for (let [type, regex] of tokenSpecs) {
      const match = char.match(regex);
      if (match) {
        matched = true;
        if (type !== TokenType.WHITESPACE && type !== TokenType.COMMENT) {
          let val = match[0];
          if (type === TokenType.KEYWORD) val = val.toUpperCase();
          if (type === TokenType.ASSIGN) val = "←"; // Normalize
          tokens.push({ type, value: val, line, col });
        }
        
        const lines = match[0].split('\n');
        if (lines.length > 1) {
          line += lines.length - 1;
          col = lines[lines.length - 1].length + 1;
        } else {
          col += match[0].length;
        }
        cursor += match[0].length;
        break;
      }
    }
    if (!matched) throw new Error(`Syntax Error: Unexpected symbol '${char[0]}' at Line ${line}, Col ${col}`);
  }
  return tokens;
}
