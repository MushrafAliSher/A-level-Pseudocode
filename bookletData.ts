
export const WHOLE_BOOKLET_TEXT = `
CAMBRIDGE INTERNATIONAL AS & A LEVEL COMPUTER SCIENCE (9618)
PAPER 2 (AS) HANDBOOK / NOTES (Complete)
By ꧁༒♛ 𝔐𝔲𝔰𝔥𝔯𝔞𝔣♛༒꧂

--- 9.1 Computational Thinking Skills ---
Computational thinking is used to study a problem and formulate an effective solution that can be provided using a computer. It is a logical approach to analyzing a problem, producing a solution that can be understood by humans and used by computers.
Techniques:
1. Abstraction: Filtering out information that is not necessary to solve a problem. It gives the power to deal with complexity by focusing on essential information while ignoring what is not relevant.
2. Decomposition: Breaking a complex problem into smaller parts until each part is easy to examine and understand. This leads to identifying program modules (subroutines).
3. Algorithms: A sequence of finite steps to solve a problem.
4. Pattern recognition.
Advantages of Decomposition: Easier to understand and solve; smaller problems are easier to program, test and maintain; sub-problems can be assigned to different programmers or teams.

--- 9.2 Algorithms & Pseudocode ---
An algorithm is a solution to a problem expressed as a sequence of defined steps.
Documentation methods:
1. Structured English: A subset of the English language consisting of command statements.
2. Program flowchart: Visual or diagrammatic representation using special symbols (Process, Input/Output, Decision, Terminal, etc.).
3. Pseudo-code: Simplified form of programming code using common keywords without strict syntax rules.

--- Identifier Naming Conventions ---
Identifiers name constants, variables, procedures, functions, arrays, etc.
Rules:
- Meaningful without being too long.
- Use mixed case (CamelCase or PascalCase), e.g., NumberOfPlayers.
- Spaces must not be used. Underscore (_) can join words.
- Must begin with a letter (not a digit).
- Must be unique and not a reserved keyword (e.g., Output, While, Input, For).
- Case insensitive in 9618 (Countdown and COUNTDOWN are the same).

--- Atomic Data Types ---
- INTEGER: A whole number (e.g., 5, -3).
- REAL: A number with a fractional/decimal part. At least one digit on either side of the decimal point (e.g., 4.7, 0.0).
- CHAR: A single character in single quotes (e.g., 'x', 'C', '@').
- STRING: A sequence of zero or more characters in double quotes (e.g., "This is a string", "").
- BOOLEAN: The logical values TRUE and FALSE.
- DATE: A valid calendar date, normally dd/mm/yyyy (e.g., 22/10/2015).

--- Declarations & Assignments ---
- DECLARE <identifier> : <data type> (e.g., DECLARE Counter : INTEGER).
- CONSTANT <identifier> = <value> (e.g., CONSTANT HourlyRate = 6.50). Only literals can be values.
- Assignments use the ← operator (e.g., <identifier> ← <value>).
- Swapping values: Requires a temporary variable (Temp ← X; X ← Y; Y ← Temp).

--- Stages of an Algorithm ---
1. Input: Getting values from user (INPUT <identifier>) or reading from file.
2. Process: Includes assignments, calculations, built-in functions, concatenation.
3. Output: Displaying on screen (OUTPUT <value(s)>) or writing to file.

--- Transferable Skills ---
Knowledge/experience of one programming language can be applied to another. It helps recognize control structures and learn new languages faster.

--- Control Structures (Selection) ---
- IF condition THEN ... ENDIF: Single path if true.
- IF condition THEN ... ELSE ... ENDIF: Choose between two actions.
- Nested IF: An IF inside another IF for multiple levels of checking.
- CASE OF <identifier> ... OTHERWISE ... ENDCASE: Selects one of many actions based on the value of a variable. Tests clauses in sequence.

--- Control Structures (Iteration / Loops) ---
- FOR <identifier> ← <val1> TO <val2> STEP <inc> ... NEXT <identifier>: Count-controlled. Use when the number of iterations is fixed/predetermined.
- WHILE <condition> DO ... ENDWHILE: Pre-conditional. Continues as long as condition is TRUE. Might not run at all if condition is false initially. Increment must be manual.
- REPEAT ... UNTIL <condition>: Post-conditional. Repeats until condition is TRUE (executes when FALSE). Runs at least once.

--- Standard Methods of Solution ---
- Counting: Initialize counter to 0 (Count ← 0), increment inside loop (Count ← Count + 1).
- Totaling (Accumulator): Running total of values (Total ← Total + Number). Initialize to 0 outside loop.
- Average: Total / Count. (Ensure Count > 0 to avoid division by zero).
- Max/Min: Initialize with the first value (Max ← Arr[1]), then compare each subsequent value (IF Arr[i] > Max THEN Max ← Arr[i]).
- Linear Search: Checking each item one by one until a target is found or all checked. Use a Boolean flag (Found ← FALSE).

--- Built-in Functions ---
- String: LEFT(str, x), RIGHT(str, x), MID(str, start, x), LENGTH(str), TO_UPPER(x), TO_LOWER(x), NUM_TO_STR(x), STR_TO_NUM(x), IS_NUM(x), ASC(char), CHR(int).
- Numeric: INT(x) (integer part), RAND(x) (random 0 to x-1).
- Date: DAY(date), MONTH(date), YEAR(date), TODAY().
- Text Files: EOF(filename).

--- Operators ---
- Arithmetic: +, -, *, /, DIV (integer division), MOD (remainder), ^ (exponentiation).
- Logical: AND, OR, NOT.
- Comparison: =, <>, <, >, <=, >=.
- String: & (concatenation).

--- Arrays (10.2) ---
Fixed-length structures of elements of identical data type, accessible by consecutive index numbers.
- 1D Array: DECLARE <name> : ARRAY[<lower>:<upper>] OF <type>.
- 2D Array: DECLARE <name> : ARRAY[<l1>:<u1>, <l2>:<u2>] OF <type> (Rows and Columns).
- Benefits: Easier searching/organizing, fewer identifiers, loop-controlled access.

--- Bubble Sort ---
Simple sorting algorithm that compares adjacent pairs and swaps them if in the wrong order.
- Inefficient: Continues comparisons after list is sorted.
- Efficient: Use a Boolean flag (SwapMade) and reduce the inner loop limit (n - Pass) after each outer pass.

--- Structured Programming (11.3) ---
Decomposing problems into subroutines (Functions and Procedures).
- Benefits: Reusability, shorter overall code, easier testing/debugging, changes only needed in one place.
- Procedure: Performs a task, no return value. Called with CALL <name>(args).
- Function: Returns a single value. Called as part of an expression. Includes RETURNS <type> in header and RETURN <val> in body.
- Parameters:
  - BYVAL: Copy is passed; original variable is unchanged.
  - BYREF: Address is passed; changes to parameter affect original variable.
- Scope:
  - Global: Declared outside, accessible everywhere.
  - Local: Declared inside a subroutine, accessible only within that block.

--- Text Files ---
- Modes: READ, WRITE (creates new/overwrites), APPEND (adds to end).
- Commands: OPENFILE, READFILE, WRITEFILE, CLOSEFILE.
- EOF(<FileID>) returns TRUE if the pointer is at the end.

--- Record Data Type ---
User-defined composite type.
- Declaration: TYPE <TypeName> ... DECLARE <Field> : <Type> ... ENDTYPE.
- Usage: DECLARE <Var> : <TypeName>. Access fields via dot notation (Var.Field).

--- Abstract Data Types (ADT) ---
Collection of data and associated operations.
1. Stack: LIFO (Last-In First-Out). Operations: Push, Pop. Uses one pointer (Top).
2. Queue: FIFO (First-In First-Out). Operations: Enqueue, Dequeue. Uses two pointers (Front, Rear). Can be Linear or Circular (wrap-around).
3. Linked List: Each node contains data and a pointer to the next node. Flexible insertion/deletion. Uses StartPointer and FreePointer.

--- Software Development (PDLC) ---
Stages: Analysis, Design, Coding, Testing, Maintenance.
- Models:
  1. Waterfall: Linear/Sequential. No working software until late.
  2. Iterative: Cyclic/Incremental. Early working models.
  3. RAD (Rapid App Dev): Prototyping and user feedback.

--- Testing & Maintenance ---
- Error Types: Syntax (rule violation), Logical (wrong output), Run-time (crash during execution).
- Strategies:
  - Dry Run: Manual tracing using a table.
  - Walk-through: Formal team review.
  - White-Box: Tests internal logic/paths.
  - Black-Box: Tests results against requirements without analyzing code.
  - Alpha: In-house testing.
  - Beta: Selected external users.
  - Acceptance: Final check by client.
  - Stub Testing: Using dummy modules to test dependent components before they are built.
- Test Data: Normal (valid), Boundary (edges), Erroneous (invalid).
`;