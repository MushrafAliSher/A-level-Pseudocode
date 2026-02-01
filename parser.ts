
import { Token, ASTNode, TokenType } from '../types';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek() { return this.tokens[this.pos]; }
  private peekNext() { return this.tokens[this.pos + 1]; }

  private consume(type: TokenType, value: string | null = null) {
    const token = this.tokens[this.pos];
    if (!token || token.type !== type || (value && token.value !== value)) {
      throw new Error(`Expected ${value || type} at line ${token ? token.line : 'EOF'}`);
    }
    this.pos++;
    return token;
  }

  private consumeType(): string {
    const token = this.peek();
    if (token && (token.type === TokenType.KEYWORD || token.type === TokenType.IDENTIFIER)) {
      this.pos++;
      return token.value;
    }
    throw new Error(`Expected data type at line ${token ? token.line : 'EOF'}`);
  }

  public parse(): ASTNode {
    const body: ASTNode[] = [];
    while (this.pos < this.tokens.length) {
      body.push(this.parseTopLevel());
    }
    return { type: 'Program', body };
  }

  private parseTopLevel(): ASTNode {
    const token = this.peek();
    if (!token) return { type: 'Literal', value: null };
    
    if (token.type === TokenType.KEYWORD) {
      if (token.value === 'PROCEDURE') return this.parseProcedure();
      if (token.value === 'FUNCTION') return this.parseFunction();
      if (token.value === 'TYPE') return this.parseType();
    }
    
    return this.parseStatement();
  }

  private parseProcedure(): ASTNode {
    this.consume(TokenType.KEYWORD, 'PROCEDURE');
    const name = this.consume(TokenType.IDENTIFIER).value;
    const params = this.parseParams();
    const body: ASTNode[] = [];
    while (this.peek() && this.peek().value !== 'ENDPROCEDURE') {
      body.push(this.parseStatement());
    }
    this.consume(TokenType.KEYWORD, 'ENDPROCEDURE');
    return { type: 'Procedure', name, params, body };
  }

  private parseFunction(): ASTNode {
    this.consume(TokenType.KEYWORD, 'FUNCTION');
    const name = this.consume(TokenType.IDENTIFIER).value;
    const params = this.parseParams();
    this.consume(TokenType.KEYWORD, 'RETURNS');
    const returnType = this.consumeType();
    const body: ASTNode[] = [];
    while (this.peek() && this.peek().value !== 'ENDFUNCTION') {
      body.push(this.parseStatement());
    }
    this.consume(TokenType.KEYWORD, 'ENDFUNCTION');
    return { type: 'Function', name, params, returnType, body };
  }

  private parseParams() {
    const params = [];
    if (this.peek()?.value === '(') {
      this.consume(TokenType.PUNCTUATION, '(');
      while (this.peek() && this.peek().value !== ')') {
        let byRef = false;
        if (this.peek()?.value === 'BYREF') { this.consume(TokenType.KEYWORD); byRef = true; }
        else if (this.peek()?.value === 'BYVAL') { this.consume(TokenType.KEYWORD); }
        const pName = this.consume(TokenType.IDENTIFIER).value;
        this.consume(TokenType.PUNCTUATION, ':');
        const pType = this.consumeType();
        params.push({ name: pName, type: pType, byRef });
        if (this.peek()?.value === ',') this.consume(TokenType.PUNCTUATION, ',');
      }
      this.consume(TokenType.PUNCTUATION, ')');
    }
    return params;
  }

  private parseType(): ASTNode {
    this.consume(TokenType.KEYWORD, 'TYPE');
    const name = this.consume(TokenType.IDENTIFIER).value;
    const fields: { name: string, type: string }[] = [];
    while (this.peek() && !['ENDTYPE', 'END'].includes(this.peek().value)) {
      if (this.peek().value === 'DECLARE') {
        this.consume(TokenType.KEYWORD);
        const fNames = [this.consume(TokenType.IDENTIFIER).value];
        while (this.peek()?.value === ',') {
          this.consume(TokenType.PUNCTUATION, ',');
          fNames.push(this.consume(TokenType.IDENTIFIER).value);
        }
        this.consume(TokenType.PUNCTUATION, ':');
        const fType = this.consumeType();
        fNames.forEach(fn => fields.push({ name: fn, type: fType }));
      } else {
        this.pos++;
      }
    }
    if (this.peek()?.value === 'ENDTYPE' || this.peek()?.value === 'END') {
       this.consume(TokenType.KEYWORD);
    }
    return { type: 'TypeDecl', name, fields };
  }

  private parseStatement(): ASTNode {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of input");

    if (token.type === TokenType.KEYWORD) {
      switch (token.value) {
        case 'DECLARE': return this.parseDeclare();
        case 'CONSTANT': return this.parseConstant();
        case 'OUTPUT': return this.parseOutput();
        case 'INPUT': return this.parseInput();
        case 'IF': return this.parseIf();
        case 'WHILE': return this.parseWhile();
        case 'REPEAT': return this.parseRepeat();
        case 'CASE': return this.parseCase();
        case 'FOR': return this.parseFor();
        case 'CALL': 
          this.consume(TokenType.KEYWORD);
          return this.parseCall();
        case 'RETURN':
          this.consume(TokenType.KEYWORD);
          return { type: 'Return', value: this.parseExpression() };
        default: throw new Error(`Unknown keyword ${token.value}`);
      }
    } else if (token.type === TokenType.IDENTIFIER) {
      const next = this.peekNext();
      if (next?.type === TokenType.ASSIGN) return this.parseAssignment();
      if (next?.value === '[') return this.parseArrayAssignment();
      if (next?.value === '.') return this.parseFieldAssignment();
      return this.parseCall();
    }
    throw new Error(`Unexpected token ${token.value} at line ${token.line}`);
  }

  private parseConstant(): ASTNode {
    this.consume(TokenType.KEYWORD, 'CONSTANT');
    const name = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.ASSIGN);
    const value = this.parseExpression();
    return { type: 'Constant', name, value };
  }

  private parseDeclare(): ASTNode {
    this.consume(TokenType.KEYWORD, 'DECLARE');
    const names = [this.consume(TokenType.IDENTIFIER).value];
    while (this.peek()?.value === ',') {
      this.consume(TokenType.PUNCTUATION, ',');
      names.push(this.consume(TokenType.IDENTIFIER).value);
    }
    this.consume(TokenType.PUNCTUATION, ':');
    
    if (this.peek()?.value === 'ARRAY') {
      this.consume(TokenType.KEYWORD);
      this.consume(TokenType.PUNCTUATION, '[');
      const lower = this.parseExpression();
      this.consume(TokenType.PUNCTUATION, ':');
      const upper = this.parseExpression();
      this.consume(TokenType.PUNCTUATION, ']');
      this.consume(TokenType.KEYWORD, 'OF');
      const dataType = this.consumeType();
      return { type: 'DeclareArray', name: names[0], lower, upper, dataType };
    }
    const dataType = this.consumeType();
    return { type: 'Declare', names, dataType };
  }

  private parseAssignment(): ASTNode {
    const name = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.ASSIGN);
    return { type: 'Assign', name, value: this.parseExpression() };
  }

  private parseFieldAssignment(): ASTNode {
    const name = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.PUNCTUATION, '.');
    const field = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.ASSIGN);
    return { type: 'Assign', name, field, value: this.parseExpression() };
  }

  private parseArrayAssignment(): ASTNode {
    const name = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.PUNCTUATION, '[');
    const index = this.parseExpression();
    this.consume(TokenType.PUNCTUATION, ']');
    this.consume(TokenType.ASSIGN);
    return { type: 'ArrayAssign', name, index, value: this.parseExpression() };
  }

  private parseCall(): ASTNode {
    const name = this.consume(TokenType.IDENTIFIER).value;
    const args = [];
    if (this.peek()?.value === '(') {
      this.consume(TokenType.PUNCTUATION, '(');
      while (this.peek() && this.peek().value !== ')') {
        args.push(this.parseExpression());
        if (this.peek()?.value === ',') this.consume(TokenType.PUNCTUATION, ',');
      }
      this.consume(TokenType.PUNCTUATION, ')');
    }
    return { type: 'Call', name, args };
  }

  private parseOutput(): ASTNode {
    this.consume(TokenType.KEYWORD, 'OUTPUT');
    const exprs = [this.parseExpression()];
    while (this.peek()?.value === ',') {
      this.consume(TokenType.PUNCTUATION, ',');
      exprs.push(this.parseExpression());
    }
    return { type: 'Output', exprs };
  }

  private parseInput(): ASTNode {
    this.consume(TokenType.KEYWORD, 'INPUT');
    return { type: 'Input', name: this.consume(TokenType.IDENTIFIER).value };
  }

  private parseIf(): ASTNode {
    this.consume(TokenType.KEYWORD, 'IF');
    const condition = this.parseExpression();
    this.consume(TokenType.KEYWORD, 'THEN');
    const thenBlock: ASTNode[] = [];
    const elseBlock: ASTNode[] = [];
    while (this.peek() && !['ENDIF', 'ELSE'].includes(this.peek().value)) {
      thenBlock.push(this.parseStatement());
    }
    if (this.peek()?.value === 'ELSE') {
      this.consume(TokenType.KEYWORD, 'ELSE');
      while (this.peek() && this.peek().value !== 'ENDIF') {
        elseBlock.push(this.parseStatement());
      }
    }
    this.consume(TokenType.KEYWORD, 'ENDIF');
    return { type: 'If', condition, thenBlock, elseBlock };
  }

  private parseWhile(): ASTNode {
    this.consume(TokenType.KEYWORD, 'WHILE');
    const condition = this.parseExpression();
    this.consume(TokenType.KEYWORD, 'DO');
    const body: ASTNode[] = [];
    while (this.peek() && this.peek().value !== 'ENDWHILE') {
      body.push(this.parseStatement());
    }
    this.consume(TokenType.KEYWORD, 'ENDWHILE');
    return { type: 'While', condition, body };
  }

  private parseRepeat(): ASTNode {
    this.consume(TokenType.KEYWORD, 'REPEAT');
    const body: ASTNode[] = [];
    while (this.peek() && this.peek().value !== 'UNTIL') {
      body.push(this.parseStatement());
    }
    this.consume(TokenType.KEYWORD, 'UNTIL');
    const condition = this.parseExpression();
    return { type: 'Repeat', body, condition };
  }

  private parseFor(): ASTNode {
    this.consume(TokenType.KEYWORD, 'FOR');
    const variable = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.ASSIGN);
    const start = this.parseExpression();
    this.consume(TokenType.KEYWORD, 'TO');
    const end = this.parseExpression();
    let step: ASTNode = { type: 'Literal', value: 1 };
    if (this.peek()?.value === 'STEP') {
      this.consume(TokenType.KEYWORD);
      step = this.parseExpression();
    }
    const body: ASTNode[] = [];
    while (this.peek() && this.peek().value !== 'NEXT') {
      body.push(this.parseStatement());
    }
    this.consume(TokenType.KEYWORD, 'NEXT');
    if (this.peek()?.type === TokenType.IDENTIFIER) this.consume(TokenType.IDENTIFIER);
    return { type: 'For', variable, start, end, step, body };
  }

  private parseCase(): ASTNode {
    this.consume(TokenType.KEYWORD, 'CASE');
    this.consume(TokenType.KEYWORD, 'OF');
    const variable = this.consume(TokenType.IDENTIFIER).value;
    const cases: { val: ASTNode; stmt: ASTNode }[] = [];
    let otherwise: ASTNode[] = [];
    while (this.peek() && !['ENDCASE', 'OTHERWISE'].includes(this.peek().value)) {
      const val = this.parseExpression();
      this.consume(TokenType.PUNCTUATION, ':');
      cases.push({ val, stmt: this.parseStatement() });
    }
    if (this.peek()?.value === 'OTHERWISE') {
      this.consume(TokenType.KEYWORD, 'OTHERWISE');
      while (this.peek() && this.peek().value !== 'ENDCASE') {
        otherwise.push(this.parseStatement());
      }
    }
    this.consume(TokenType.KEYWORD, 'ENDCASE');
    return { type: 'Case', variable, cases, otherwise };
  }

  private parseExpression(): ASTNode { return this.parseLogicalOr(); }

  private parseLogicalOr(): ASTNode {
    let left = this.parseLogicalAnd();
    while (this.peek()?.value === 'OR') {
      this.consume(TokenType.KEYWORD);
      left = { type: 'BinaryOp', op: 'OR', left, right: this.parseLogicalAnd() };
    }
    return left;
  }

  private parseLogicalAnd(): ASTNode {
    let left = this.parseEquality();
    while (this.peek()?.value === 'AND') {
      this.consume(TokenType.KEYWORD);
      left = { type: 'BinaryOp', op: 'AND', left, right: this.parseEquality() };
    }
    return left;
  }

  private parseEquality(): ASTNode {
    let left = this.parseAdditive();
    const ops = ['=', '<>', '<', '>', '<=', '>='];
    while (this.peek() && ops.includes(this.peek().value)) {
      const op = this.consume(this.peek().type).value;
      left = { type: 'BinaryOp', op, left, right: this.parseAdditive() };
    }
    return left;
  }

  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative();
    while (this.peek() && ['+', '-', '&'].includes(this.peek().value)) {
      const op = this.consume(this.peek().type).value;
      left = { type: 'BinaryOp', op, left, right: this.parseMultiplicative() };
    }
    return left;
  }

  private parseMultiplicative(): ASTNode {
    let left = this.parseFactor();
    while (this.peek() && ['*', '/', 'DIV', 'MOD', '^'].includes(this.peek().value)) {
      const op = this.consume(this.peek().type).value;
      left = { type: 'BinaryOp', op, left, right: this.parseFactor() };
    }
    return left;
  }

  private parseFactor(): ASTNode {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression");

    // Unary Operators: NOT and Minus
    if (token.value === 'NOT') {
      this.consume(TokenType.KEYWORD);
      return { type: 'UnaryOp', op: 'NOT', operand: this.parseFactor() };
    }
    if (token.value === '-') {
      this.consume(TokenType.OP);
      return { type: 'UnaryOp', op: '-', operand: this.parseFactor() };
    }

    if (token.type === TokenType.INTEGER_LITERAL) { this.pos++; return { type: 'Literal', value: parseInt(token.value) }; }
    if (token.type === TokenType.REAL_LITERAL) { this.pos++; return { type: 'Literal', value: parseFloat(token.value) }; }
    if (token.type === TokenType.STRING_LITERAL) { this.pos++; return { type: 'Literal', value: token.value.replace(/['"]/g, '') }; }
    if (token.value === 'TRUE') { this.pos++; return { type: 'Literal', value: true }; }
    if (token.value === 'FALSE') { this.pos++; return { type: 'Literal', value: false }; }
    if (token.type === TokenType.IDENTIFIER) {
      if (this.peekNext()?.value === '[') {
        this.pos++; this.consume(TokenType.PUNCTUATION, '[');
        const idx = this.parseExpression();
        this.consume(TokenType.PUNCTUATION, ']');
        return { type: 'ArrayAccess', name: token.value, index: idx };
      }
      if (this.peekNext()?.value === '(') {
        this.pos++; return this.parseCallArgs(token.value);
      }
      if (this.peekNext()?.value === '.') {
        this.pos++; this.consume(TokenType.PUNCTUATION, '.');
        return { type: 'Var', name: token.value, field: this.consume(TokenType.IDENTIFIER).value };
      }
      this.pos++; return { type: 'Var', name: token.value };
    }
    if (token.value === '(') {
      this.consume(TokenType.PUNCTUATION, '(');
      const expr = this.parseExpression();
      this.consume(TokenType.PUNCTUATION, ')');
      return expr;
    }
    throw new Error(`Unexpected ${token.value} in expression`);
  }

  private parseCallArgs(name: string): ASTNode {
    const args = [];
    this.consume(TokenType.PUNCTUATION, '(');
    while (this.peek() && this.peek().value !== ')') {
      args.push(this.parseExpression());
      if (this.peek()?.value === ',') this.consume(TokenType.PUNCTUATION, ',');
    }
    this.consume(TokenType.PUNCTUATION, ')');
    return { type: 'Call', name, args };
  }
}
