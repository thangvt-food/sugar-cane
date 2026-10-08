// Toàn bộ mô tả gốc trong phiếu thực hành — chép lại để làm bài không cần mở PDF.
export const EXPERIMENTS = [
  {
    id: "exp1",
    path: "/exp1",
    no: 1,
    short: "Độ Brix",
    title: "Experiment 1: Degrees Brix",
    intro:
      "Degrees Brix (°Bx) is a measure of the dissolved solids in a liquid, and is commonly used to measure dissolved sugar content of an aqueous solution. One degree Brix is 1 gram of sucrose in 100 grams of solution and represents the strength of the solution as percentage by mass. If the solution contains dissolved solids other than pure sucrose, then the °Bx only approximates the dissolved solid content.",
    sections: [
      "1.1 Calculate the quantity of water / sugar and take the concentration of solution (°Bx) (100g solution)",
      "1.2 Define the equations which express the correlation between concentration (%) and (°Bx)",
      "1.3 The brief comment",
      "1.4 Draw the graphs which express the correlation between concentration (%) and (°Bx)",
      "1.5 The brief comment",
    ],
  },
  {
    id: "exp2",
    path: "/exp2",
    no: 2,
    short: "Ép nước mía",
    title: "Experiment 2: Sugarcane juice extraction",
    intro:
      "Juice extraction by milling is the process of squeezing the juice from the cane under a set of mills using high pressure between heavy iron rollers. Those mills can have from 3 up to 6 rolls; every set of mills is called a tandem mill or mill train.",
    sections: [
      "2.1 Evaluation of the juice (0–10 marks in proportion to the sensory quality) extracted from … kgs of sugarcane",
      "2.2 The brief comment (using descriptive statistics)",
      "2.3 Compare the Brix of sugarcane juice with table 1.1",
      "2.4 Evaluation of the juice 1 extracted from the bagasse (using water : bagasse = 1/1)",
      "2.5 Compare the Brix of juice 1 with table 1.1",
    ],
  },
  {
    id: "exp3",
    path: "/exp3",
    no: 3,
    short: "Làm trong",
    title: "Experiment 3: Clarification of sugarcane juice for syrup production",
    intro:
      "The clarification process required to reduce particles in sugarcane juice before heating to produce syrup, in this work, analyze the turbidity, pH, °Bx to determine the clarification effect due to the clarifying agents.",
    sections: [
      "3.1 Determine the clarification of sugarcane juice by using Ca(OH)₂ 20% (105°C / 60 minutes) (0–10 marks in the turbidity) (2000g sugarcane juice from 2.1)",
      "3.2 Using the data from other groups (for the repeat) and give the brief comment (using descriptive statistics)",
    ],
  },
  {
    id: "exp4",
    path: "/exp4",
    no: 4,
    short: "Cô đặc syrup",
    title: "Experiment 4: Concentration of the syrup",
    intro:
      "The concentration of the syrup (clear juice) that sugarcane juice obtains after the process of clarification operation is 15.0 ~ 17.0° of Bx, and water content is 83.0 ~ 85.0%. Boiling sugarcane juice, removes a large amount of moisture, is condensed into the syrup of 60.0 ~ 65.0° of Bx, then sends to and boil sugar.",
    sections: [
      "4.1 Degrees Brix and the weight of syrup during concentration (… g from 3.1)",
      "4.2 Define the equations which express the correlation between time and °Bx / weight",
      "4.3 The brief comment (using inferential statistics)",
      "4.4 Draw the graphs which express the correlation between time and °Bx",
      "4.5 The brief comment",
      "4.6 Draw the graphs which express the correlation between time and weight",
      "4.7 The brief comment",
    ],
  },
  {
    id: "exp5",
    path: "/exp5",
    no: 5,
    short: "Kết tinh",
    title: "Experiment 5: Crystallization of sugar",
    intro:
      "Crystallization is the (natural or artificial) process of formation of solid crystals precipitating from a solution. The formation of the crystalline phase from supersaturated solutions can occur by either a spontaneous or a forced nucleation mechanism.",
    sections: [
      "5.1 Using syrup of 4.1, carry out the crystallization process and record",
      "5.2 The brief comment",
    ],
  },
  {
    id: "exp6",
    path: "/exp6",
    no: 6,
    short: "Sản phẩm",
    title: "Experiment 6: Processing the product from sugar",
    intro:
      "Objectives: Upon completion of the experiment, you will be able to: (1) Discuss the relationship between the influence of factors and the quality of product; (2) Compare the advantages and disadvantages of the use of the processing technology; (3) Evaluate the product.",
    sections: [
      "6.1 Name of the product",
      "6.2 Describe the product",
      "6.3 Describe the process chart",
      "6.4 Compare the advantages and disadvantages of the use of the processing technology",
      "6.5 Discuss the factors which act on the quality of product",
    ],
  },
];

export const EXP1_CONC = [5, 10, 15, 20, 25, 30, 40, 50, 60];

export const EXP2_PARAMS = [
  "Juice (gr)",
  "Bagasse (gr)",
  "Juice (%)",
  "Juice (norm)",
  "°Bx",
  "pH",
  "Colour",
  "Flavour",
  "Taste",
  "Clarity",
  "State",
];

export const EXP2_J1_PARAMS = ["Juice (gr)", "Bagasse (gr)", "Juice (%)", "°Bx", "pH"];

export const EXP3_PARAMS = ["Juice (gr)", "Mud (gr)", "Mud (%)", "°Bx", "pH"];
export const EXP3_COLS = [
  { key: "control", label: "Control (0%)" },
  { key: "g1", label: "Lime-water / juice (group 1: 5%)" },
  { key: "g2", label: "Lime-water / juice (group 2: 10%)" },
  { key: "g3", label: "Lime-water / juice (group 3: 15%)" },
];
