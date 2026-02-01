import { HandbookSection } from './types';

export const HANDBOOK: HandbookSection[] = [
  {
    id: "9.1",
    title: "Computational Thinking",
    content: "Covers Abstraction (filtering unnecessary details) and Decomposition (breaking problems into sub-tasks).",
    examples: [
      { 
        title: "Simple Abstraction", 
        code: "DECLARE Status : STRING\nStatus ← \"Active\"\nIF Status = \"Active\" THEN\n  OUTPUT \"System: Online\"\nENDIF" 
      },
      {
        title: "Decomposition Task",
        code: "DECLARE Total, Count : INTEGER\nDECLARE Avg : REAL\nTotal ← 500\nCount ← 5\n// Sub-task: Calculate Average\nAvg ← Total / Count\nOUTPUT \"Average Score: \", Avg"
      },
      {
        title: "Essential Logic",
        code: "DECLARE IsAuthenticated : BOOLEAN\nIsAuthenticated ← TRUE\n// Abstracting complex login to a boolean\nIF IsAuthenticated = TRUE THEN\n  OUTPUT \"Access Granted\"\nENDIF"
      }
    ]
  },
  {
    id: "9.2",
    title: "Algorithms & Pseudocode",
    content: "An algorithm is a finite sequence of defined steps. Assignment: ←.",
    examples: [
      { 
        title: "Arithmetic Check", 
        code: "DECLARE Num : INTEGER\nNum ← 10\nOUTPUT \"Result: \", Num * 2 + 5" 
      },
      {
        title: "Value Swap",
        code: "DECLARE A, B, Temp : INTEGER\nA ← 5\nB ← 10\nTemp ← A\nA ← B\nB ← Temp\nOUTPUT \"A: \", A, \" B: \", B"
      },
      {
        title: "Constant Usage",
        code: "CONSTANT PI ← 3.14\nDECLARE Radius : REAL\nRadius ← 5.0\nOUTPUT \"Approx Area: \", PI * Radius * Radius"
      }
    ]
  },
  {
    id: "11.1",
    title: "Arithmetic & Logic",
    content: "Basic math and logical comparisons.",
    examples: [
      { 
        title: "DIV & MOD Logic", 
        code: "DECLARE x : INTEGER\nDECLARE y : INTEGER\nx ← 10\ny ← 3\nOUTPUT \"10 DIV 3 = \", x DIV y\nOUTPUT \"10 MOD 3 = \", x MOD y" 
      },
      {
        title: "Boolean Logic",
        code: "DECLARE Rain, Umbrella : BOOLEAN\nRain ← TRUE\nUmbrella ← FALSE\nIF Rain AND (NOT Umbrella) THEN\n  OUTPUT \"You will get wet!\"\nENDIF"
      },
      {
        title: "Concatenation",
        code: "DECLARE First, Last, Full : STRING\nFirst ← \"Tutor\"\nLast ← \"Mushraf\"\nFull ← First & \" \" & Last\nOUTPUT \"User: \", Full"
      }
    ]
  },
  {
    id: "11.2",
    title: "Control Constructs",
    content: "Selection (IF, CASE) and Iteration (FOR, WHILE, REPEAT).",
    examples: [
      { 
        title: "CASE Selector", 
        code: "DECLARE Choice : INTEGER\nChoice ← 2\nCASE OF Choice\n  1 : OUTPUT \"First\"\n  2 : OUTPUT \"Second\"\n  OTHERWISE OUTPUT \"Default\"\nENDCASE" 
      },
      { 
        title: "Counted Loop", 
        code: "DECLARE i : INTEGER\nFOR i ← 1 TO 5\n  OUTPUT \"Count: \", i\nNEXT i" 
      },
      {
        title: "Conditional Loop",
        code: "DECLARE Password : STRING\nPassword ← \"9618\"\nWHILE Password <> \"9618\" DO\n  OUTPUT \"Retrying...\"\nENDWHILE\nOUTPUT \"Unlocked\""
      }
    ]
  },
  {
    id: "std_methods",
    title: "Standard Methods",
    content: "Standard patterns for 9618 algorithms.",
    examples: [
      { 
        title: "Linear Search", 
        code: "DECLARE MyList : ARRAY[1:5] OF INTEGER\nDECLARE Found : BOOLEAN\nDECLARE i : INTEGER\n\nMyList[1] ← 10\nMyList[2] ← 20\nMyList[3] ← 30\nMyList[4] ← 40\nMyList[5] ← 50\n\nFound ← FALSE\nFOR i ← 1 TO 5\n  IF MyList[i] = 30 THEN\n    Found ← TRUE\n  ENDIF\nNEXT i\n\nIF Found = TRUE THEN\n  OUTPUT \"Value Found!\"\nELSE\n  OUTPUT \"Not Found\"\nENDIF" 
      },
      {
        title: "Finding Maximum",
        code: "DECLARE Arr : ARRAY[1:3] OF INTEGER\nDECLARE Max, i : INTEGER\nArr[1] ← 45\nArr[2] ← 92\nArr[3] ← 18\nMax ← Arr[1]\nFOR i ← 2 TO 3\n  IF Arr[i] > Max THEN\n    Max ← Arr[i]\n  ENDIF\nNEXT i\nOUTPUT \"Highest: \", Max"
      },
      {
        title: "Totaling Array",
        code: "DECLARE Data : ARRAY[1:3] OF INTEGER\nDECLARE Sum, i : INTEGER\nData[1] ← 10\nData[2] ← 20\nData[3] ← 30\nSum ← 0\nFOR i ← 1 TO 3\n  Sum ← Sum + Data[i]\nNEXT i\nOUTPUT \"Total Sum: \", Sum"
      }
    ]
  },
  {
    id: "10.2",
    title: "Arrays",
    content: "Fixed length indexed structures with lower:upper bounds.",
    examples: [
      { 
        title: "Array Filling", 
        code: "DECLARE MyArr : ARRAY[1:3] OF INTEGER\nDECLARE i : INTEGER\nFOR i ← 1 TO 3\n  MyArr[i] ← i * 100\nNEXT i\nOUTPUT \"Index 2: \", MyArr[2]" 
      },
      {
        title: "Search & Update",
        code: "DECLARE Vals : ARRAY[1:3] OF INTEGER\nVals[1] ← 5\nVals[2] ← 10\nVals[3] ← 15\nIF Vals[2] = 10 THEN\n  Vals[2] ← 20\nENDIF\nOUTPUT \"Updated: \", Vals[2]"
      }
    ]
  },
  {
    id: "11.3",
    title: "Subroutines",
    content: "Procedures and Functions. Subroutines promote modularity.",
    examples: [
      { 
        title: "Greet Procedure", 
        code: "PROCEDURE GreetUser(Name : STRING)\n  OUTPUT \"Hello, \", Name\nENDPROCEDURE\n\nCALL GreetUser(\"Mushraf\")" 
      },
      {
        title: "Math Procedure",
        code: "PROCEDURE Multiply(A : INTEGER, B : INTEGER)\n  OUTPUT \"Product: \", A * B\nENDPROCEDURE\n\nCALL Multiply(10, 5)"
      },
      {
        title: "Status Update",
        code: "PROCEDURE LogSystem(Msg : STRING)\n  OUTPUT \"[SYSTEM] \", Msg\nENDPROCEDURE\n\nCALL LogSystem(\"Neural link active\")"
      }
    ]
  },
  {
    id: "record",
    title: "Record Types",
    content: "Custom composite data types using TYPE...ENDTYPE.",
    examples: [
      { 
        title: "Student Record", 
        code: "TYPE Student\n  DECLARE Name : STRING\n  DECLARE Age : INTEGER\nENDTYPE\n\nDECLARE s1 : Student\ns1.Name ← \"Mushraf\"\ns1.Age ← 20\nOUTPUT \"Name: \", s1.Name" 
      },
      {
        title: "Product Detail",
        code: "TYPE Product\n  DECLARE ID : STRING\n  DECLARE Price : REAL\nENDTYPE\n\nDECLARE p1 : Product\np1.ID ← \"A101\"\np1.Price ← 19.99\nOUTPUT \"Price of \", p1.ID, \" is \", p1.Price"
      },
      {
        title: "Car Type",
        code: "TYPE Car\n  DECLARE Model : STRING\n  DECLARE Year : INTEGER\nENDTYPE\n\nDECLARE myCar : Car\nmyCar.Model ← \"Vision\"\nmyCar.Year ← 2025\nOUTPUT \"Car Model: \", myCar.Model"
      }
    ]
  }
];