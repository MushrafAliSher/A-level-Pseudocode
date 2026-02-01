
export enum TokenType {
  WHITESPACE = 'WHITESPACE',
  COMMENT = 'COMMENT',
  STRING_LITERAL = 'STRING_LITERAL',
  REAL_LITERAL = 'REAL_LITERAL',
  INTEGER_LITERAL = 'INTEGER_LITERAL',
  KEYWORD = 'KEYWORD',
  IDENTIFIER = 'IDENTIFIER',
  ASSIGN = 'ASSIGN',
  COMP_OP = 'COMP_OP',
  OP = 'OP',
  PUNCTUATION = 'PUNCTUATION'
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

export type ASTNode = 
  | { type: 'Program'; body: ASTNode[] }
  | { type: 'Declare'; names: string[]; dataType: string }
  | { type: 'Constant'; name: string; value: ASTNode }
  | { type: 'TypeDecl'; name: string; fields: { name: string, type: string }[] }
  | { type: 'DeclareArray'; name: string; lower: ASTNode; upper: ASTNode; dataType: string }
  | { type: 'Assign'; name: string; value: ASTNode; field?: string }
  | { type: 'ArrayAssign'; name: string; index: ASTNode; value: ASTNode }
  | { type: 'Output'; exprs: ASTNode[] }
  | { type: 'Input'; name: string }
  | { type: 'If'; condition: ASTNode; thenBlock: ASTNode[]; elseBlock: ASTNode[] }
  | { type: 'While'; condition: ASTNode; body: ASTNode[] }
  | { type: 'Repeat'; body: ASTNode[]; condition: ASTNode }
  | { type: 'For'; variable: string; start: ASTNode; end: ASTNode; step: ASTNode; body: ASTNode[] }
  | { type: 'Case'; variable: string; cases: { val: ASTNode; stmt: ASTNode }[]; otherwise: ASTNode[] }
  | { type: 'Procedure'; name: string; params: { name: string, type: string, byRef: boolean }[]; body: ASTNode[] }
  | { type: 'Function'; name: string; params: { name: string, type: string, byRef: boolean }[]; returnType: string; body: ASTNode[] }
  | { type: 'Call'; name: string; args: ASTNode[] }
  | { type: 'Return'; value: ASTNode }
  | { type: 'BinaryOp'; op: string; left: ASTNode; right: ASTNode }
  | { type: 'UnaryOp'; op: string; operand: ASTNode }
  | { type: 'Literal'; value: any }
  | { type: 'Var'; name: string; field?: string }
  | { type: 'ArrayAccess'; name: string; index: ASTNode };

export interface MemoryValue {
  type: string;
  value?: any;
  lower?: number;
  upper?: number;
  data?: any[];
  fields?: Record<string, MemoryValue>;
}

export interface HandbookSection {
  id: string;
  title: string;
  content: string;
  examples: { title: string; code: string }[];
}
