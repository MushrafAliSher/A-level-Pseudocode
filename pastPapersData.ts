export interface PaperContent {
  questions: string[];
  markingKey: string[];
}

export interface PastPaper {
  id: string;
  year: string;
  title: string;
  type: 'Paper 1' | 'Paper 2';
  content: PaperContent;
}

export const PAST_PAPERS: PastPaper[] = [
  {
    id: '9618-p2-specimen',
    year: '2021 Specimen',
    title: 'Fundamental Problem-solving and Programming Skills',
    type: 'Paper 2',
    content: {
      questions: [
        "Q1. Program variables: Today ('Tuesday'), WeekNumber (37), Revision ('C'), MaxWeight (60.5), LastBatch (TRUE). Give data types and evaluate expressions like MID(Today, 3, 2) & Revision & 'ape'.",
        "Q2. Structure Chart for Online Music Store. Identifiers for Checkout, Card payment, Account payment. Write function header for Card payment module.",
        "Q3. Stack ADT representation. Describe PUSH('Z') and MyVar = POP() operations with reference to TopOfStack pointer.",
        "Q4. Parameter passing: PROCEDURE MyProc(x : INTEGER). Compare results of passing by value vs by reference.",
        "Q5. Record Structure: StockItem (ProductCode, Price, NumberInStock). Write pseudocode to declare the record and modified element 20.",
        "Q6. Password Validation Function: ValidatePassword(Pass: STRING). Rules: 2 lowercase, 2 uppercase, 3 numeric, alphanumeric only.",
        "Q7. File Handling: Procedure LogEvents to add LogArray data to 'LoginFile.txt', skipping 'Empty' elements."
      ],
      markingKey: [
        "1(a) Category: STRING, DateSold: DATE, Cost/Price: REAL, InStock: BOOLEAN. (1 mark per row)",
        "1(b) Result <- CalculateTotal() [Assignment], WHILE IsClosed [Iteration], REPEAT...UNTIL [Assignment, Iteration], IF...ENDIF [Assignment, Selection], CASE...ENDCASE [Selection].",
        "2(a) Count-controlled loop (FOR) because number of iterations is known.",
        "3(a) POP: MyVar assigned value 'E', TopOfStack decrements to 102. PUSH: TopOfStack increments to 100, Address 100 assigned 'Z'.",
        "4(a) BYVAL: output 4 (original unchanged). BYREF: output 5 (original updated).",
        "5(a) TYPE StockItem ... DECLARE ProductCode: STRING ... ENDTYPE. (3 marks)",
        "6(a) MP1: Function heading/ending. MP2: Counter initialization. MP3: Loop for string length. MP4: Character classification logic. MP5: Final boolean return."
      ]
    }
  },
  {
    id: '9618-p1-as',
    year: 'AS Series',
    title: 'Theory Fundamentals',
    type: 'Paper 1',
    content: {
      questions: [
        "Q1. Bitmapped images: terms for smallest element, largest number of colours (8-bit), dots per inch.",
        "Q2. Binary addition: 11110101 + 10110001. Binary subtraction using two's complement.",
        "Q3. Assembly Language: Trace program using ACC and memory addresses 80-83. Instructions: LDD, INC, STO, LDI, CMP, JPE.",
        "Q4. Networking: Define 'private cloud'. Benefits of cloud storage.",
        "Q5. IP Addresses: Explain IPv4 vs IPv6 notation and structure.",
        "Q6. CPU Architecture: Role of PC, IX, SR. System buses (Data, Address, Control).",
        "Q7. Logic Gates: NAND, NOR, XOR operation descriptions. Draw circuit for X = NOT((A AND B) OR (C AND D)).",
        "Q8. Flash Memory: Logic gates used, transistors per cell, floating gate properties."
      ],
      markingKey: [
        "1(a) Pixel, 256 // 2^8, Screen resolution. (1 mark each)",
        "2(a) Binary Add result: (1) 1010 0110. Subtraction result: 0100 0110.",
        "3(a) MP: Correct trace of ACC values through jumps. Shaded sections indicate marks.",
        "5(a) IPv4: 4 groups of digits, 8 bits each, separated by full stops. IPv6: 8 groups, 16 bits each, uses colons.",
        "6(b) PC: store address of next instruction. IX: value added to address for indexing. SR: flags for arithmetic results/interrupts.",
        "7(c) Boolean Expression: X = ((A NOR B) AND (A OR B)) NAND (B AND C).",
        "8(a) Gates: NAND/NOR. Transistors: 2. Gate: Floating. Current: Control."
      ]
    }
  },
  {
    id: 'target-test-26',
    year: '2026 Target',
    title: 'Comprehensive AS Level Assessment',
    type: 'Paper 2',
    content: {
      questions: [
        "Q1. Refine an algorithm to input 100 numbers and total those between 30 and 70 inclusive.",
        "Q2. Sandwich Shop Program: Randomly select 2 fillings from array [1:35] and 1 bread from [1:10]. Output daily special message.",
        "Q4. Circular Queue ADT: Complete steps for AddTo() module including wrap-around logic.",
        "Q12. TestNum Function: Analyze 6-digit string for patterns (last 3 same, last 3 zero, first/last 3 same).",
        "Q14. Daylight Saving: AdjustClock(Year) function to find the 3rd Sunday in March.",
        "Q15. Message Stacking: ProcessMsg(Msg: STRING) to check DestinationID and route to Stack 1 or Stack 2."
      ],
      markingKey: [
        "1. Step 1: Initialize Total to 0. Step 2: Loop 100 times. Step 3: Input Num. Step 4: Check if 30-70. Step 5: Output Total.",
        "2(a) DECLARE Filling: ARRAY[1:35] OF STRING. (1 mark)",
        "4(b) Step 1: Check if NumItems = Max. Step 3: If EndOfQueue = Max then 1. Step 5: Set Array[EndOfQueue] to Value.",
        "12. Logic: Return 3 (highest priority) if first/last 3 match, else 2 if last 3 zero, else 1 if last 3 same/non-zero.",
        "15. MP1: Extract DestinationID (MID). MP2: Compare with MyID. MP3: Call StackMsg(Msg, 1 or 2)."
      ]
    }
  }
];