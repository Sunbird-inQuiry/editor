// Character data extracted from @project-sunbird/ckeditor-build-classic
// Same characters and categories as the old Angular editor's SpecialCharacters plugin

export interface SpecialChar { char: string; title: string; }

export const SPECIAL_CHAR_GROUPS: Record<string, SpecialChar[]> = {
  "Currency": [
    {
      "char": "$",
      "title": "Dollar sign"
    },
    {
      "char": "\u20ac",
      "title": "Euro sign"
    },
    {
      "char": "\u00a5",
      "title": "Yen sign"
    },
    {
      "char": "\u00a3",
      "title": "Pound sign"
    },
    {
      "char": "\u00a2",
      "title": "Cent sign"
    },
    {
      "char": "\u20a0",
      "title": "Euro-currency sign"
    },
    {
      "char": "\u20a1",
      "title": "Colon sign"
    },
    {
      "char": "\u20a2",
      "title": "Cruzeiro sign"
    },
    {
      "char": "\u20a3",
      "title": "French franc sign"
    },
    {
      "char": "\u20a4",
      "title": "Lira sign"
    },
    {
      "char": "\u00a4",
      "title": "Currency sign"
    },
    {
      "char": "\u20bf",
      "title": "Bitcoin sign"
    },
    {
      "char": "\u20a5",
      "title": "Mill sign"
    },
    {
      "char": "\u20a6",
      "title": "Naira sign"
    },
    {
      "char": "\u20a7",
      "title": "Peseta sign"
    },
    {
      "char": "\u20a8",
      "title": "Rupee sign"
    },
    {
      "char": "\u20a9",
      "title": "Won sign"
    },
    {
      "char": "\u20aa",
      "title": "New sheqel sign"
    },
    {
      "char": "\u20ab",
      "title": "Dong sign"
    },
    {
      "char": "\u20ad",
      "title": "Kip sign"
    },
    {
      "char": "\u20ae",
      "title": "Tugrik sign"
    },
    {
      "char": "\u20af",
      "title": "Drachma sign"
    },
    {
      "char": "\u20b0",
      "title": "German penny sign"
    },
    {
      "char": "\u20b1",
      "title": "Peso sign"
    },
    {
      "char": "\u20b2",
      "title": "Guarani sign"
    },
    {
      "char": "\u20b3",
      "title": "Austral sign"
    },
    {
      "char": "\u20b4",
      "title": "Hryvnia sign"
    },
    {
      "char": "\u20b5",
      "title": "Cedi sign"
    },
    {
      "char": "\u20b6",
      "title": "Livre tournois sign"
    },
    {
      "char": "\u20b7",
      "title": "Spesmilo sign"
    },
    {
      "char": "\u20b8",
      "title": "Tenge sign"
    },
    {
      "char": "\u20b9",
      "title": "Indian rupee sign"
    },
    {
      "char": "\u20ba",
      "title": "Turkish lira sign"
    },
    {
      "char": "\u20bb",
      "title": "Nordic mark sign"
    },
    {
      "char": "\u20bc",
      "title": "Manat sign"
    },
    {
      "char": "\u20bd",
      "title": "Ruble sign"
    }
  ],
  "Text": [
    {
      "char": "\u00a9",
      "title": "Copyright sign"
    },
    {
      "char": "\u00ae",
      "title": "Registered sign"
    },
    {
      "char": "\u2122",
      "title": "Trade mark sign"
    },
    {
      "char": "\u2120",
      "title": "Service mark"
    },
    {
      "char": "\u2116",
      "title": "Numero sign"
    },
    {
      "char": "\u2030",
      "title": "Per mille sign"
    },
    {
      "char": "\u2031",
      "title": "Per ten thousand sign"
    },
    {
      "char": "!!",
      "title": "Double exclamation mark"
    },
    {
      "char": "?!",
      "title": "Exclamation question mark"
    },
    {
      "char": "!?",
      "title": "Question exclamation mark"
    },
    {
      "char": "??",
      "title": "Double question mark"
    },
    {
      "char": "\u203d",
      "title": "Interrobang"
    },
    {
      "char": "\u204b",
      "title": "Reversed pilcrow sign"
    },
    {
      "char": "\u00a7",
      "title": "Section sign"
    },
    {
      "char": "\u00b6",
      "title": "Pilcrow sign"
    },
    {
      "char": "\u00b7",
      "title": "Middle dot"
    },
    {
      "char": "\u2020",
      "title": "Dagger"
    },
    {
      "char": "\u2021",
      "title": "Double dagger"
    },
    {
      "char": "\u2023",
      "title": "Triangular bullet"
    },
    {
      "char": "\u2713",
      "title": "Check mark"
    },
    {
      "char": "\u2717",
      "title": "Ballot x"
    },
    {
      "char": "\u2026",
      "title": "Horizontal ellipsis"
    },
    {
      "char": "\u201e",
      "title": "Double low-9 quotation mark"
    },
    {
      "char": "\u201c",
      "title": "Left double quotation mark"
    },
    {
      "char": "\u201d",
      "title": "Right double quotation mark"
    },
    {
      "char": "\u2018",
      "title": "Left single quotation mark"
    },
    {
      "char": "\u2019",
      "title": "Right single quotation mark"
    }
  ],
  "Mathematical": [
    {
      "char": "<",
      "title": "Less-than sign"
    },
    {
      "char": ">",
      "title": "Greater-than sign"
    },
    {
      "char": "\u2264",
      "title": "Less-than or equal to"
    },
    {
      "char": "\u2265",
      "title": "Greater-than or equal to"
    },
    {
      "char": "\u2013",
      "title": "En dash"
    },
    {
      "char": "\u2014",
      "title": "Em dash"
    },
    {
      "char": "\u00af",
      "title": "Macron"
    },
    {
      "char": "\u203e",
      "title": "Overline"
    },
    {
      "char": "\u00b0",
      "title": "Degree sign"
    },
    {
      "char": "\u2212",
      "title": "Minus sign"
    },
    {
      "char": "\u00b1",
      "title": "Plus-minus sign"
    },
    {
      "char": "\u00f7",
      "title": "Division sign"
    },
    {
      "char": "\u2044",
      "title": "Fraction slash"
    },
    {
      "char": "\u00d7",
      "title": "Multiplication sign"
    },
    {
      "char": "\u0192",
      "title": "Latin small letter f with hook"
    },
    {
      "char": "\u222b",
      "title": "Integral"
    },
    {
      "char": "\u2211",
      "title": "N-ary summation"
    },
    {
      "char": "\u221e",
      "title": "Infinity"
    },
    {
      "char": "\u221a",
      "title": "Square root"
    },
    {
      "char": "\u223c",
      "title": "Tilde operator"
    },
    {
      "char": "\u2245",
      "title": "Approximately equal to"
    },
    {
      "char": "\u2248",
      "title": "Almost equal to"
    },
    {
      "char": "\u2260",
      "title": "Not equal to"
    },
    {
      "char": "\u2261",
      "title": "Identical to"
    },
    {
      "char": "\u2208",
      "title": "Element of"
    },
    {
      "char": "\u2209",
      "title": "Not an element of"
    },
    {
      "char": "\u220b",
      "title": "Contains as member"
    },
    {
      "char": "\u220f",
      "title": "N-ary product"
    },
    {
      "char": "\u2227",
      "title": "Logical and"
    },
    {
      "char": "\u2228",
      "title": "Logical or"
    },
    {
      "char": "\u00ac",
      "title": "Not sign"
    },
    {
      "char": "\u2229",
      "title": "Intersection"
    },
    {
      "char": "\u222a",
      "title": "Union"
    },
    {
      "char": "\u2202",
      "title": "Partial differential"
    },
    {
      "char": "\u2200",
      "title": "For all"
    },
    {
      "char": "\u2203",
      "title": "There exists"
    },
    {
      "char": "\u2205",
      "title": "Empty set"
    },
    {
      "char": "\u2207",
      "title": "Nabla"
    },
    {
      "char": "\u2217",
      "title": "Asterisk operator"
    },
    {
      "char": "\u221d",
      "title": "Proportional to"
    },
    {
      "char": "\u2220",
      "title": "Angle"
    },
    {
      "char": "\u00bc",
      "title": "Vulgar fraction one quarter"
    },
    {
      "char": "\u00bd",
      "title": "Vulgar fraction one half"
    },
    {
      "char": "\u00be",
      "title": "Vulgar fraction three quarters"
    }
  ],
  "Arrows": [
    {
      "char": "\u21d0",
      "title": "Leftwards double arrow"
    },
    {
      "char": "\u21d2",
      "title": "Rightwards double arrow"
    },
    {
      "char": "\u21d1",
      "title": "Upwards double arrow"
    },
    {
      "char": "\u21d3",
      "title": "Downwards double arrow"
    },
    {
      "char": "\u21e0",
      "title": "Leftwards dashed arrow"
    },
    {
      "char": "\u21e2",
      "title": "Rightwards dashed arrow"
    },
    {
      "char": "\u21e1",
      "title": "Upwards dashed arrow"
    },
    {
      "char": "\u21e3",
      "title": "Downwards dashed arrow"
    },
    {
      "char": "\u21e4",
      "title": "Leftwards arrow to bar"
    },
    {
      "char": "\u21e5",
      "title": "Rightwards arrow to bar"
    },
    {
      "char": "\u2912",
      "title": "Upwards arrow to bar"
    },
    {
      "char": "\u2913",
      "title": "Downwards arrow to bar"
    },
    {
      "char": "\u21a8",
      "title": "Up down arrow with base"
    },
    {
      "char": "\ud83d\udd19",
      "title": "Back with leftwards arrow above"
    },
    {
      "char": "\ud83d\udd1a",
      "title": "End with leftwards arrow above"
    },
    {
      "char": "\ud83d\udd1b",
      "title": "On with exclamation mark with left right arrow above"
    },
    {
      "char": "\ud83d\udd1c",
      "title": "Soon with rightwards arrow above"
    },
    {
      "char": "\ud83d\udd1d",
      "title": "Top with upwards arrow above"
    }
  ],
  "Latin": [
    {
      "char": "\u0100",
      "title": "Latin capital letter a with macron"
    },
    {
      "char": "\u0101",
      "title": "Latin small letter a with macron"
    },
    {
      "char": "\u0102",
      "title": "Latin capital letter a with breve"
    },
    {
      "char": "\u0103",
      "title": "Latin small letter a with breve"
    },
    {
      "char": "\u0104",
      "title": "Latin capital letter a with ogonek"
    },
    {
      "char": "\u0105",
      "title": "Latin small letter a with ogonek"
    },
    {
      "char": "\u0106",
      "title": "Latin capital letter c with acute"
    },
    {
      "char": "\u0107",
      "title": "Latin small letter c with acute"
    },
    {
      "char": "\u0108",
      "title": "Latin capital letter c with circumflex"
    },
    {
      "char": "\u0109",
      "title": "Latin small letter c with circumflex"
    },
    {
      "char": "\u010a",
      "title": "Latin capital letter c with dot above"
    },
    {
      "char": "\u010b",
      "title": "Latin small letter c with dot above"
    },
    {
      "char": "\u010c",
      "title": "Latin capital letter c with caron"
    },
    {
      "char": "\u010d",
      "title": "Latin small letter c with caron"
    },
    {
      "char": "\u010e",
      "title": "Latin capital letter d with caron"
    },
    {
      "char": "\u010f",
      "title": "Latin small letter d with caron"
    },
    {
      "char": "\u0110",
      "title": "Latin capital letter d with stroke"
    },
    {
      "char": "\u0111",
      "title": "Latin small letter d with stroke"
    },
    {
      "char": "\u0112",
      "title": "Latin capital letter e with macron"
    },
    {
      "char": "\u0113",
      "title": "Latin small letter e with macron"
    },
    {
      "char": "\u0114",
      "title": "Latin capital letter e with breve"
    },
    {
      "char": "\u0115",
      "title": "Latin small letter e with breve"
    },
    {
      "char": "\u0116",
      "title": "Latin capital letter e with dot above"
    },
    {
      "char": "\u0117",
      "title": "Latin small letter e with dot above"
    },
    {
      "char": "\u0118",
      "title": "Latin capital letter e with ogonek"
    },
    {
      "char": "\u0119",
      "title": "Latin small letter e with ogonek"
    },
    {
      "char": "\u011a",
      "title": "Latin capital letter e with caron"
    },
    {
      "char": "\u011b",
      "title": "Latin small letter e with caron"
    },
    {
      "char": "\u011c",
      "title": "Latin capital letter g with circumflex"
    },
    {
      "char": "\u011d",
      "title": "Latin small letter g with circumflex"
    },
    {
      "char": "\u011e",
      "title": "Latin capital letter g with breve"
    },
    {
      "char": "\u011f",
      "title": "Latin small letter g with breve"
    },
    {
      "char": "\u0120",
      "title": "Latin capital letter g with dot above"
    },
    {
      "char": "\u0121",
      "title": "Latin small letter g with dot above"
    },
    {
      "char": "\u0122",
      "title": "Latin capital letter g with cedilla"
    },
    {
      "char": "\u0123",
      "title": "Latin small letter g with cedilla"
    },
    {
      "char": "\u0124",
      "title": "Latin capital letter h with circumflex"
    },
    {
      "char": "\u0125",
      "title": "Latin small letter h with circumflex"
    },
    {
      "char": "\u0126",
      "title": "Latin capital letter h with stroke"
    },
    {
      "char": "\u0127",
      "title": "Latin small letter h with stroke"
    },
    {
      "char": "\u0128",
      "title": "Latin capital letter i with tilde"
    },
    {
      "char": "\u0129",
      "title": "Latin small letter i with tilde"
    },
    {
      "char": "\u012a",
      "title": "Latin capital letter i with macron"
    },
    {
      "char": "\u012b",
      "title": "Latin small letter i with macron"
    },
    {
      "char": "\u012c",
      "title": "Latin capital letter i with breve"
    },
    {
      "char": "\u012d",
      "title": "Latin small letter i with breve"
    },
    {
      "char": "\u012e",
      "title": "Latin capital letter i with ogonek"
    },
    {
      "char": "\u012f",
      "title": "Latin small letter i with ogonek"
    },
    {
      "char": "\u0130",
      "title": "Latin capital letter i with dot above"
    },
    {
      "char": "\u0131",
      "title": "Latin small letter dotless i"
    },
    {
      "char": "\u0132",
      "title": "Latin capital ligature ij"
    },
    {
      "char": "\u0133",
      "title": "Latin small ligature ij"
    },
    {
      "char": "\u0134",
      "title": "Latin capital letter j with circumflex"
    },
    {
      "char": "\u0135",
      "title": "Latin small letter j with circumflex"
    },
    {
      "char": "\u0136",
      "title": "Latin capital letter k with cedilla"
    },
    {
      "char": "\u0137",
      "title": "Latin small letter k with cedilla"
    },
    {
      "char": "\u0138",
      "title": "Latin small letter kra"
    },
    {
      "char": "\u0139",
      "title": "Latin capital letter l with acute"
    },
    {
      "char": "\u013a",
      "title": "Latin small letter l with acute"
    },
    {
      "char": "\u013b",
      "title": "Latin capital letter l with cedilla"
    },
    {
      "char": "\u013c",
      "title": "Latin small letter l with cedilla"
    },
    {
      "char": "\u013d",
      "title": "Latin capital letter l with caron"
    },
    {
      "char": "\u013e",
      "title": "Latin small letter l with caron"
    },
    {
      "char": "\u013f",
      "title": "Latin capital letter l with middle dot"
    },
    {
      "char": "\u0140",
      "title": "Latin small letter l with middle dot"
    },
    {
      "char": "\u0141",
      "title": "Latin capital letter l with stroke"
    },
    {
      "char": "\u0142",
      "title": "Latin small letter l with stroke"
    },
    {
      "char": "\u0143",
      "title": "Latin capital letter n with acute"
    },
    {
      "char": "\u0144",
      "title": "Latin small letter n with acute"
    },
    {
      "char": "\u0145",
      "title": "Latin capital letter n with cedilla"
    },
    {
      "char": "\u0146",
      "title": "Latin small letter n with cedilla"
    },
    {
      "char": "\u0147",
      "title": "Latin capital letter n with caron"
    },
    {
      "char": "\u0148",
      "title": "Latin small letter n with caron"
    },
    {
      "char": "\u0149",
      "title": "Latin small letter n preceded by apostrophe"
    },
    {
      "char": "\u014a",
      "title": "Latin capital letter eng"
    },
    {
      "char": "\u014b",
      "title": "Latin small letter eng"
    },
    {
      "char": "\u014c",
      "title": "Latin capital letter o with macron"
    },
    {
      "char": "\u014d",
      "title": "Latin small letter o with macron"
    },
    {
      "char": "\u014e",
      "title": "Latin capital letter o with breve"
    },
    {
      "char": "\u014f",
      "title": "Latin small letter o with breve"
    },
    {
      "char": "\u0150",
      "title": "Latin capital letter o with double acute"
    },
    {
      "char": "\u0151",
      "title": "Latin small letter o with double acute"
    },
    {
      "char": "\u0152",
      "title": "Latin capital ligature oe"
    },
    {
      "char": "\u0153",
      "title": "Latin small ligature oe"
    },
    {
      "char": "\u0154",
      "title": "Latin capital letter r with acute"
    },
    {
      "char": "\u0155",
      "title": "Latin small letter r with acute"
    },
    {
      "char": "\u0156",
      "title": "Latin capital letter r with cedilla"
    },
    {
      "char": "\u0157",
      "title": "Latin small letter r with cedilla"
    },
    {
      "char": "\u0158",
      "title": "Latin capital letter r with caron"
    },
    {
      "char": "\u0159",
      "title": "Latin small letter r with caron"
    },
    {
      "char": "\u015a",
      "title": "Latin capital letter s with acute"
    },
    {
      "char": "\u015b",
      "title": "Latin small letter s with acute"
    },
    {
      "char": "\u015c",
      "title": "Latin capital letter s with circumflex"
    },
    {
      "char": "\u015d",
      "title": "Latin small letter s with circumflex"
    },
    {
      "char": "\u015e",
      "title": "Latin capital letter s with cedilla"
    },
    {
      "char": "\u015f",
      "title": "Latin small letter s with cedilla"
    },
    {
      "char": "\u0160",
      "title": "Latin capital letter s with caron"
    },
    {
      "char": "\u0161",
      "title": "Latin small letter s with caron"
    },
    {
      "char": "\u0162",
      "title": "Latin capital letter t with cedilla"
    },
    {
      "char": "\u0163",
      "title": "Latin small letter t with cedilla"
    },
    {
      "char": "\u0164",
      "title": "Latin capital letter t with caron"
    },
    {
      "char": "\u0165",
      "title": "Latin small letter t with caron"
    },
    {
      "char": "\u0166",
      "title": "Latin capital letter t with stroke"
    },
    {
      "char": "\u0167",
      "title": "Latin small letter t with stroke"
    },
    {
      "char": "\u0168",
      "title": "Latin capital letter u with tilde"
    },
    {
      "char": "\u0169",
      "title": "Latin small letter u with tilde"
    },
    {
      "char": "\u016a",
      "title": "Latin capital letter u with macron"
    },
    {
      "char": "\u016b",
      "title": "Latin small letter u with macron"
    },
    {
      "char": "\u016c",
      "title": "Latin capital letter u with breve"
    },
    {
      "char": "\u016d",
      "title": "Latin small letter u with breve"
    },
    {
      "char": "\u016e",
      "title": "Latin capital letter u with ring above"
    },
    {
      "char": "\u016f",
      "title": "Latin small letter u with ring above"
    },
    {
      "char": "\u0170",
      "title": "Latin capital letter u with double acute"
    },
    {
      "char": "\u0171",
      "title": "Latin small letter u with double acute"
    },
    {
      "char": "\u0172",
      "title": "Latin capital letter u with ogonek"
    },
    {
      "char": "\u0173",
      "title": "Latin small letter u with ogonek"
    },
    {
      "char": "\u0174",
      "title": "Latin capital letter w with circumflex"
    },
    {
      "char": "\u0175",
      "title": "Latin small letter w with circumflex"
    },
    {
      "char": "\u0176",
      "title": "Latin capital letter y with circumflex"
    },
    {
      "char": "\u0177",
      "title": "Latin small letter y with circumflex"
    },
    {
      "char": "\u0178",
      "title": "Latin capital letter y with diaeresis"
    },
    {
      "char": "\u0179",
      "title": "Latin capital letter z with acute"
    },
    {
      "char": "\u017a",
      "title": "Latin small letter z with acute"
    },
    {
      "char": "\u017b",
      "title": "Latin capital letter z with dot above"
    },
    {
      "char": "\u017c",
      "title": "Latin small letter z with dot above"
    },
    {
      "char": "\u017d",
      "title": "Latin capital letter z with caron"
    },
    {
      "char": "\u017e",
      "title": "Latin small letter z with caron"
    },
    {
      "char": "\u017f",
      "title": "Latin small letter long s"
    }
  ]
};

export const ALL_CATEGORIES = ['All', ...Object.keys(SPECIAL_CHAR_GROUPS)] as const;
export type CharCategory = typeof ALL_CATEGORIES[number];
