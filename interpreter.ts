
import { ASTNode, MemoryValue } from '../types';

export class Interpreter {
  public memory: Record<string, MemoryValue> = {};
  public types: Record<string, { name: string, fields: { name: string, type: string }[] }> = {};
  public subroutines: Record<string, ASTNode> = {};
  public files: Record<string, string[]> = {}; 
  
  private inputCallback: (name: string) => Promise<string>;
  private outputCallback: (msg: string) => void;
  private isReturning: boolean = false;
  private currentReturnValue: any = null;

  constructor(inputCallback: (name: string) => Promise<string>, outputCallback: (msg: string) => void) {
    this.inputCallback = inputCallback;
    this.outputCallback = outputCallback;
  }

  private formatVal(val: any): string {
    if (typeof val === 'boolean') return val ? "TRUE" : "FALSE";
    return String(val);
  }

  public async run(ast: ASTNode): Promise<any> {
    this.memory = {};
    this.types = {};
    this.subroutines = {};
    this.files = {};
    this.isReturning = false;
    this.currentReturnValue = null;

    if (ast.type === 'Program') {
      for (const node of ast.body) {
        if (node.type === 'TypeDecl') this.types[node.name.toUpperCase()] = node;
        if (node.type === 'Procedure' || node.type === 'Function') this.subroutines[node.name.toUpperCase()] = node;
      }
      for (const node of ast.body) {
        if (!['TypeDecl', 'Procedure', 'Function'].includes(node.type)) await this.execute(node);
      }
    }
  }

  private async evaluate(expr: ASTNode, localMem?: Record<string, MemoryValue>): Promise<any> {
    if (!expr) return null;
    if (expr.type === 'Literal') return expr.value;
    
    if (expr.type === 'Var') {
      const nameKey = expr.name.toUpperCase();
      const mem = (localMem && localMem[nameKey]) ? localMem[nameKey] : this.memory[nameKey];
      if (!mem) throw new Error(`RUNTIME ERROR: Variable '${expr.name}' not declared.`);
      if (expr.field) {
        const fieldKey = expr.field.toUpperCase();
        if (!mem.fields || !mem.fields[fieldKey]) throw new Error(`RUNTIME ERROR: Field '${expr.field}' not found in record '${expr.name}'.`);
        return mem.fields[fieldKey].value;
      }
      return mem.value;
    }

    if (expr.type === 'UnaryOp') {
      const val = await this.evaluate(expr.operand, localMem);
      if (expr.op === 'NOT') return !val;
      if (expr.op === '-') return -Number(val);
      return val;
    }

    if (expr.type === 'ArrayAccess') {
      const nameKey = expr.name.toUpperCase();
      const arr = (localMem && localMem[nameKey]) ? localMem[nameKey] : this.memory[nameKey];
      const idx = await this.evaluate(expr.index, localMem);
      if (!arr || arr.type !== 'ARRAY') throw new Error(`RUNTIME ERROR: '${expr.name}' is not an array.`);
      if (idx < arr.lower! || idx > arr.upper!) throw new Error(`RUNTIME ERROR: Array index ${idx} out of bounds.`);
      return arr.data![idx];
    }

    if (expr.type === 'BinaryOp') {
      const l = await this.evaluate(expr.left, localMem);
      const r = await this.evaluate(expr.right, localMem);
      switch (expr.op) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return l / r;
        case 'DIV': return Math.floor(Number(l) / Number(r));
        case 'MOD': return Number(l) % Number(r);
        case '^': return Math.pow(Number(l), Number(r));
        case '&': return String(l) + String(r);
        case '=': return l === r;
        case '<>': return l !== r;
        case '>': return l > r;
        case '<': return l < r;
        case '>=': return l >= r;
        case '<=': return l <= r;
        case 'AND': return !!(l && r);
        case 'OR': return !!(l || r);
        default: return null;
      }
    }

    if (expr.type === 'Call') {
      const name = expr.name.toUpperCase();
      const args = [];
      for (const a of expr.args) {
        args.push(await this.evaluate(a, localMem));
      }
      
      switch (name) {
        case 'INT': return Math.floor(args[0]);
        case 'LENGTH': return String(args[0]).length;
        default:
          const sub = this.subroutines[name];
          if (!sub || sub.type !== 'Function') throw new Error(`RUNTIME ERROR: Function '${expr.name}' not found.`);
          return await this.runSubroutine(sub, args);
      }
    }
    return null;
  }

  private async runSubroutine(sub: any, args: any[]): Promise<any> {
    const localMemory: Record<string, MemoryValue> = {};
    sub.params.forEach((p: any, i: number) => {
      localMemory[p.name.toUpperCase()] = { type: p.type, value: args[i] };
    });
    
    const oldReturning = this.isReturning;
    const oldReturnVal = this.currentReturnValue;
    this.isReturning = false;
    this.currentReturnValue = null;

    for (const s of sub.body) {
      await this.execute(s, localMemory);
      if (this.isReturning) break;
    }
    
    const result = this.currentReturnValue;
    this.isReturning = oldReturning;
    this.currentReturnValue = oldReturnVal;
    return result;
  }

  private async execute(stmt: ASTNode, localMem?: Record<string, MemoryValue>): Promise<void> {
    if (!stmt || this.isReturning) return;

    const targetMem = localMem || this.memory;

    switch (stmt.type) {
      case 'Declare':
        const typeKey = stmt.dataType.toUpperCase();
        stmt.names.forEach(name => {
          const nameKey = name.toUpperCase();
          if (this.types[typeKey]) {
            const fields: Record<string, MemoryValue> = {};
            this.types[typeKey].fields.forEach(f => fields[f.name.toUpperCase()] = { type: f.type, value: this.getDefault(f.type) });
            targetMem[nameKey] = { type: stmt.dataType, fields };
          } else {
            targetMem[nameKey] = { type: stmt.dataType, value: this.getDefault(stmt.dataType) };
          }
        });
        break;
      case 'Constant':
        targetMem[stmt.name.toUpperCase()] = { type: 'CONSTANT', value: await this.evaluate(stmt.value, localMem) };
        break;
      case 'DeclareArray':
        const arrNameKey = stmt.name.toUpperCase();
        const l = await this.evaluate(stmt.lower, localMem);
        const u = await this.evaluate(stmt.upper, localMem);
        targetMem[arrNameKey] = { type: 'ARRAY', lower: l, upper: u, data: new Array(u + 1).fill(this.getDefault(stmt.dataType)) };
        break;
      case 'Assign':
        const assignNameKey = stmt.name.toUpperCase();
        const target = targetMem[assignNameKey] || this.memory[assignNameKey];
        if (!target) throw new Error(`RUNTIME ERROR: '${stmt.name}' not declared.`);
        if (target.type === 'CONSTANT') throw new Error(`RUNTIME ERROR: Cannot reassign CONSTANT '${stmt.name}'.`);
        if (stmt.field) target.fields![stmt.field.toUpperCase()].value = await this.evaluate(stmt.value, localMem);
        else target.value = await this.evaluate(stmt.value, localMem);
        break;
      case 'ArrayAssign':
        const aaNameKey = stmt.name.toUpperCase();
        const arr = targetMem[aaNameKey] || this.memory[aaNameKey];
        const idx = await this.evaluate(stmt.index, localMem);
        if (!arr) throw new Error(`RUNTIME ERROR: '${stmt.name}' not declared.`);
        arr.data![idx] = await this.evaluate(stmt.value, localMem);
        break;
      case 'Output':
        const outputValues = [];
        for (const e of stmt.exprs) {
          outputValues.push(this.formatVal(await this.evaluate(e, localMem)));
        }
        this.outputCallback(outputValues.join(""));
        break;
      case 'Input':
        const inp = await this.inputCallback(stmt.name);
        const inpNameKey = stmt.name.toUpperCase();
        const inpTarget = targetMem[inpNameKey] || this.memory[inpNameKey];
        if (inpTarget) inpTarget.value = isNaN(Number(inp)) ? inp : Number(inp);
        break;
      case 'Call':
        const sub = this.subroutines[stmt.name.toUpperCase()];
        if (sub) {
          const args = [];
          for (const a of stmt.args) {
            args.push(await this.evaluate(a, localMem));
          }
          await this.runSubroutine(sub, args);
        }
        break;
      case 'Return':
        this.currentReturnValue = await this.evaluate(stmt.value, localMem);
        this.isReturning = true;
        break;
      case 'If':
        if (await this.evaluate(stmt.condition, localMem)) { 
          for (const s of stmt.thenBlock) await this.execute(s, localMem); 
        } else { 
          for (const s of stmt.elseBlock) await this.execute(s, localMem); 
        }
        break;
      case 'While':
        while (await this.evaluate(stmt.condition, localMem)) { 
          for (const s of stmt.body) await this.execute(s, localMem); 
        }
        break;
      case 'Repeat':
        do { 
          for (const s of stmt.body) await this.execute(s, localMem); 
        } while (!(await this.evaluate(stmt.condition, localMem)));
        break;
      case 'For':
        const startVal = await this.evaluate(stmt.start, localMem);
        targetMem[stmt.variable.toUpperCase()] = { type: 'INTEGER', value: startVal };
        const stepVal = await this.evaluate(stmt.step, localMem);
        
        while (true) {
          const curr = targetMem[stmt.variable.toUpperCase()].value;
          const endLimit = await this.evaluate(stmt.end, localMem);
          
          if ((stepVal > 0 && curr > endLimit) || (stepVal < 0 && curr < endLimit)) break;
          
          for (const s of stmt.body) await this.execute(s, localMem);
          if (this.isReturning) break;
          
          targetMem[stmt.variable.toUpperCase()].value += stepVal;
        }
        break;
      case 'Case':
        const checkVal = await this.evaluate({type: 'Var', name: stmt.variable}, localMem);
        let found = false;
        for (const c of stmt.cases) {
          if (await this.evaluate(c.val, localMem) === checkVal) {
            await this.execute(c.stmt, localMem);
            found = true;
            break;
          }
        }
        if (!found) { 
          for (const s of stmt.otherwise) await this.execute(s, localMem); 
        }
        break;
    }
  }

  private getDefault(type: string) {
    const t = type.toUpperCase();
    if (t === 'INTEGER' || t === 'REAL') return 0;
    if (t === 'BOOLEAN') return false;
    return "";
  }
}
