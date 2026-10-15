/* DHS English Studio — The Landlady: 7 sections, ranges verified against the school's own PDF.
   Section 1 follows the teacher-supplied rubric. Sections 2–7 are DRAFT rubrics written by Claude from the
   story text and the school's question types: a tutor should check them before they are trusted.
   No story text is stored here: only short start/end phrases used to find the range in the student's own PDF. */

const R = String.raw;

const LANDLADY_SEGMENTS = [
  {
    id: "s1", scaffold: "full", title: "The window", modelDraft: false,
    tags: { A: "Global", B: "Literal", C: "Inferential" },
    covers: "Billy arrives in Bath on a cold evening, looks for lodgings, and is drawn towards a warm-looking Bed and Breakfast.",
    pages: "Page 1", start: "Billy Weaver", end: "more comfortable than The Bell and Dragon.",
    frame: "Billy seems ______. The ______ shows that ______. Also, the ______ suggests that ______.",
    gistPrompt: "In one complete sentence (about 20–35 words), explain what happens in this section.",
    detailPrompt: "Find ONE detail in this section that makes the house look welcoming. Copy the exact words from the text, then explain in your own words how it affects Billy.",
    inferencePrompt: "What impression do you get of Billy in this section? Support your answer with two details from the text and explain how each detail creates this impression.",
    rubric: {
      A: { minWords: 12, need: 2, core: R`window|notice|sign|bed and breakfast|b ?& ?b|stop(s|ped)?\b|closer|drawn|attract|fascinat|interest|inviting|peer|fire|dog|chrysanthemum|curtain|cosy|cozy|warm|welcoming|wants? to (look|stay|go in)`,
        groups: [R`billy`, R`arriv|train|bath|london|travel|came|walk`, R`window|notice|bed and breakfast|b ?& ?b|house|stop|closer|attract|fascinat|stay|room|lodging|hotel|look`],
        outOfRange: R`landlady|woman|door (opens|opened|swung)|\btea\b|guest.?book|stuffed`,
        outOfRangeMsg: "You included information that appears later in the story (for example, the landlady opening the door). Stay only within this section.",
        missing: "Your sentence stops too early. Add what Billy finds and does at the END of this section: he sees the BED AND BREAKFAST notice and the cosy room, and is drawn to it." },
      B: { relevant: R`fire|hearth|dog|dachshund|furniture|sofa|armchair|piano|curtain|chrysanthemum|notice|bed and breakfast|warm|comfortable|pleasant|cosy|cozy|parrot|animals`,
        function: R`show|suggest|because|so|make|mean|attract|draw|safe|welcom|inviting|comfort|decid`,
        irrelevant: "This detail is not the most important one. Look for what makes Billy stop and want to stay." },
      C: { ideas: R`young|naive|naïve|easily influenced|trusting|impressed by|hasty|careless|not careful|drawn|curious|gullible|inexperienced|eager|ambitious|impulsive|persuaded|influenced|grown.?up|immature`,
        feedbackIdea: "You have not yet given a clear impression of Billy. Try: Billy seems ______ (for example young, eager, easily influenced).",
        feedbackDetails: "You are missing specific evidence. Useful details: the warm fire, the sleeping dog, the pleasant furniture, the notice, or Billy trying to be “brisk”.",
        details: [
          { label: "the bright fire", re: R`fire|hearth` },
          { label: "the pleasant furniture", re: R`furniture|sofa|armchair|piano` },
          { label: "the sleeping dog", re: R`dog|dachshund` },
          { label: "the curtains / flowers", re: R`curtain|chrysanthemum` },
          { label: "the BED AND BREAKFAST notice", re: R`notice|bed and breakfast|sign` },
          { label: "“a pretty decent house” / animals are a good sign", re: R`good sign|decent house|more comfortable` },
          { label: "he stops and moves closer", re: R`stop(ped|s)? walking|moved? (a bit )?closer|went right up|peer` },
          { label: "he tries to be brisk like a businessman", re: R`brisk|businessm|big shots|new (coat|suit|hat|overcoat)|head office` }
        ] }
    },
    model: {
      gist: "Billy arrives in Bath on a cold evening, is looking for somewhere to stay, and becomes fascinated by a welcoming-looking bed-and-breakfast window.",
      detail: "a bright fire burning in the hearth",
      detailWhy: "It makes the room look warm and safe, so Billy feels the house is much more inviting than the cold street and wants to look closer.",
      parts: [
        ["Impression", "Billy seems young and easily influenced by appearances."],
        ["Detail 1 + link", "He sees the bright fire, the sleeping dog and the pleasant furniture and decides it would be “a pretty decent house”, which suggests that a cosy look is enough to reassure him."],
        ["Detail 2 + link", "He is trying to be “brisk” like the successful businessmen at Head Office, which shows he is young and eager to seem grown-up."]
      ]
    },
    tutorGuide: [
      "Accept any impression the section supports (young, eager, trusting, easily influenced). Check each detail against the PDF.",
      "Both details must come from THIS section (Billy Weaver … more comfortable than The Bell and Dragon).",
      "Marks: 1 precise impression · 1 two relevant details · 1 each detail linked to the impression."
    ]
  },
  {
    id: "s2", scaffold: "frame", title: "The pull of the notice", modelDraft: true,
    tags: { A: "Global", B: "Language use for impact", C: "Inferential" },
    covers: "Billy weighs the pub against a boarding-house, then feels the notice holding him and finds himself climbing the steps to ring the bell.",
    pages: "Pages 1–2", start: "On the other hand, a pub", end: "reaching for the bell.",
    frame: "The writer makes readers feel ______ because “______” suggests ______. Also, “______” shows ______.",
    gistPrompt: "In one complete sentence (about 20–35 words), explain what Billy is unsure about and what happens in the end.",
    detailPrompt: "Find the comparison that shows how the notice affects Billy. Copy the exact words, then explain in your own words what it suggests about the notice's power over him.",
    inferencePrompt: "What feeling does the writer create about the house in this section? Support your answer with two details and explain how each detail creates that feeling.",
    rubric: {
      A: { minWords: 12, need: 2, core: R`notice|sign|words|bell|door|steps|compel|hold|held|pull|forc|drawn|resist`,
        groups: [R`pub|bell and dragon|hesitat|dither|unsure|torn|not sure|decid|choos|mind|frighten|afraid`, R`notice|sign|bed and breakfast|words|eye`, R`compel|hold|held|pull|forc|drawn|attract|stare|resist|bell|door|steps|climb`],
        outOfRange: R`landlady|woman|door (opens|opened|swung)|\btea\b|guest.?book`,
        missing: "You missed the key point: Billy is unsure, but the notice seems to pull him to the door and he rings the bell." },
      B: { allowQuote: true, relevant: R`black eye|large black eye|staring|holding him|compelling|forcing`,
        function: R`control|force|power|resist|choice|hypnot|watch|trap|stare|pull|against his will|powerless|magnet|compel|alive|eye|cannot|can't`,
        irrelevant: "This is not the comparison that shows the notice's effect. Look for “like a large black eye”." },
      C: { ideas: R`uneasy|suspicious|sinister|eerie|creepy|ominous|menacing|danger|something (is )?(wrong|odd|strange|not right)|mysterious|worried|tense|suspense|trap|foreboding|unnatural|unsettl`,
        feedbackIdea: "Name the feeling first: the writer makes readers feel uneasy / suspicious about the house.",
        feedbackDetails: "Use specific details: the “large black eye”, the notice “holding” and “compelling” him, or that he moves to the door without really deciding.",
        details: [
          { label: "the notice like a “large black eye”", re: R`black eye|staring` },
          { label: "“holding him, compelling him”", re: R`holding|compelling|forcing|compel|forc` },
          { label: "he moves without deciding (“the next thing he knew”)", re: R`next thing he knew|without (deciding|thinking|choosing)|actually moving|turned to go|had decided to walk on|against his` },
          { label: "the words repeated again and again", re: R`repeat|again and again|over and over|bed and breakfast,? bed` },
          { label: "his earlier fear of boarding-houses", re: R`frighten|afraid|rapacious|kippers|watery cabbage` }
        ] }
    },
    model: {
      gist: "Billy is unsure whether to stay here or go to the pub, but the notice seems to hold him and he finds himself climbing the steps to ring the bell.",
      detail: "Each word was like a large black eye staring at him",
      detailWhy: "It suggests the notice is watching him and has power over him, so he cannot walk away by his own choice.",
      parts: [
        ["Feeling", "The writer makes readers feel uneasy about the house."],
        ["Detail 1 + link", "The notice is compared to “a large black eye staring at him”, which suggests that something is watching him and he is not in control."],
        ["Detail 2 + link", "It is “holding him, compelling him”, and the next thing he knew he was at the door, which shows he is being pulled in against his earlier doubts."]
      ]
    },
    tutorGuide: ["Accept any precise feeling (uneasy, suspicious, sinister) that two details support.", "Language question: the comparison must be quoted, but the explanation must be in the student's own words.", "Marks: 1 precise feeling · 1 two relevant details · 1 each detail linked."]
  },
  {
    id: "s3", scaffold: "frame", title: "The landlady opens the door", modelDraft: true,
    tags: { A: "Global", B: "Literal", C: "Inferential" },
    covers: "The door opens the instant Billy rings. The landlady welcomes him warmly, names a very low price, and he steps inside.",
    pages: "Pages 2–3", start: "He pressed the bell.", end: "stepped over the threshold.",
    frame: "I get the impression that the landlady is ______. The text says “______”, which suggests ______. Also, “______” shows ______.",
    gistPrompt: "In one complete sentence (about 20–35 words), explain what happens when Billy rings the bell.",
    detailPrompt: "Find ONE detail that shows the landlady is very eager or welcoming. Copy the exact words, then explain in your own words what it suggests about her.",
    inferencePrompt: "What impression do you get of the landlady in this section? Support your answer with two details and explain how each detail creates that impression.",
    rubric: {
      A: { minWords: 12, need: 3, core: R`landlady|woman|lady|she`,
        groups: [R`bell|door|knock|ring|rang|press`, R`landlady|woman|lady|she`, R`welcom|smile|invit|friendly|kind|nice|enter|inside|house|room|price|cheap|five and sixpence|cost|charge|stay|threshold`],
        outOfRange: R`\btea\b|guest.?book|stuffed|mulholland|temple|third floor`,
        missing: "Say that the landlady opens the door at once, welcomes Billy, and he goes in (and the price is very low)." },
      B: { relevant: R`jack.in.the.box|at once|instantly|immediately|popped|swung open|waiting|smile|welcom|pink face|gentle|blue eyes|cheap|reduce|egg|knew you would|mother|school.?friend|all ready`,
        function: R`waiting|eager|expect|ready|keen|desperate|want|welcom|kind|nice|friendly|motherly|trust|safe|too|strange|odd|unusual|suspicious|suggest|show|because` },
      C: { ideas: R`kind|friendly|welcoming|motherly|warm|gentle|generous|caring|eager|keen|desperate|odd|strange|suspicious|dotty|over.?friendly|harmless|sweet|too (nice|eager)`,
        feedbackIdea: "State your impression of her first: the landlady seems ______ (for example welcoming but a little too eager).",
        feedbackDetails: "Use specific details: the door opening at once, her smile, the very low price, “I knew you would”, or the mother of a school-friend.",
        details: [
          { label: "the door opens at once (“jack-in-the-box”)", re: R`jack.in.the.box|at once|instantly|immediately|as soon as|popped|half.minute` },
          { label: "her warm smile", re: R`smile` },
          { label: "her round pink face and gentle blue eyes", re: R`pink face|gentle blue eyes|blue eyes|round pink` },
          { label: "the very cheap price", re: R`cheap|price|five and sixpence|reduce|sixpence|egg` },
          { label: "“I knew you would” / “all ready for you”", re: R`knew you would|all ready for you|ready for you` },
          { label: "like the mother of his best school-friend", re: R`mother|school.?friend|christmas` }
        ] }
    },
    model: {
      gist: "Billy rings the bell and the landlady opens the door at once, welcomes him warmly, offers a very cheap price, and he steps inside.",
      detail: "the door swung open and a woman was standing there",
      detailWhy: "The door opened the moment he rang, which suggests she was waiting close by and is unusually eager for a guest.",
      parts: [
        ["Impression", "The landlady seems welcoming but a little too eager."],
        ["Detail 1 + link", "The door opened at once, “like a jack-in-the-box”, which suggests she had been waiting close by for someone to arrive."],
        ["Detail 2 + link", "She offers a very cheap price and says “I knew you would”, which shows she is keen for him to stay and perhaps too sure of him."]
      ]
    },
    tutorGuide: ["Accept “kind and motherly” as long as details support it; reward students who also notice how eager she is.", "Details must be about what she does, says or looks like.", "Marks: 1 precise impression · 1 two relevant details · 1 each detail linked."]
  },
  {
    id: "s4", scaffold: "frame", title: "Upstairs", modelDraft: true,
    tags: { A: "Global", B: "Language use for impact", C: "Inferential" },
    covers: "The landlady takes Billy upstairs. Her words and the bare hall hint that she has been waiting for exactly this kind of guest.",
    pages: "Pages 3–4", start: "Just hang it there", end: "closed the door.",
    frame: "The writer wants readers to suspect ______. The text says “______”, which suggests ______. Also, “______” shows ______.",
    gistPrompt: "In one complete sentence (about 20–35 words), explain what the landlady does and says as she takes Billy to his room.",
    detailPrompt: "Find ONE detail that shows how the landlady looks at Billy, or how she has prepared for him. Copy the exact words, then explain in your own words what it suggests.",
    inferencePrompt: "What does the writer want readers to suspect about the landlady or the house in this section? Support your answer with two details and explain how each detail creates the suspicion.",
    rubric: {
      A: { minWords: 12, need: 2, core: R`landlady|woman|she|her`,
        groups: [R`hat|coat|hall|stairs|upstairs|room|bedroom|floor|bed`, R`landlady|woman|she`, R`alone|only|nobody|no other|ourselves|guest|visitor|choosy|always ready|sign|book|worr|welcome|show|led|lead|prepared|ready`],
        outOfRange: R`\btea\b|stuffed|parrot|bitter|mulholland|temple|third floor`,
        missing: "Say that she takes him upstairs to a room that is already prepared, and tells him the house is empty and she is choosy." },
      B: { allowQuote: true, relevant: R`eyes? travelled|down the length|just exactly right|pale lips|all ready|no (other )?(hats|coats|umbrellas)|ourselves|nest|choosy|particular|always ready|bedclothes|turned back|water.?bottle|worried|perkins`,
        function: R`suggest|show|examin|inspect|judg|assess|study|choos|unusual|odd|strange|alone|isolated|nobody|prepar|plan|expect|wait|sinister|uneasy|predator|looking|checking|size` },
      C: { ideas: R`suspicious|uneasy|sinister|danger|something (is )?(wrong|odd|strange|not right)|odd|strange|creepy|eerie|trap|predator|planning|waiting|hiding|secret|isolated|too eager|obsessed|dangerous`,
        feedbackIdea: "State the suspicion first: the writer wants readers to suspect that the landlady is hiding something / waiting for victims.",
        feedbackDetails: "Use specific details: no other hats or coats, “we have it all to ourselves”, “always ready day and night”, “just exactly right”, her eyes travelling over his body, or the bed already turned back.",
        details: [
          { label: "no other hats, coats or umbrellas", re: R`no other hats|no (umbrellas|walking.?sticks)|hat|coat|hall` },
          { label: "“we have it all to ourselves”", re: R`ourselves|not very often|very often|visitor|nest` },
          { label: "“always ready day and night”", re: R`always ready|day and night|off.?chance|everything is` },
          { label: "“just exactly right” / choosy", re: R`choosy|particular|just exactly right|acceptable young gentleman` },
          { label: "her eyes travel down his body", re: R`eyes? travelled|down the length|pale lips|slowly` },
          { label: "the bed already turned back", re: R`bedclothes|turned back|ready for someone|bedspread|water.?bottle` },
          { label: "“I was beginning to get worried”", re: R`beginning to get worried|so glad you appeared|worried` }
        ] }
    },
    model: {
      gist: "The landlady takes Billy upstairs, tells him they have the house to themselves, says she is choosy, and leaves him in a room that is already prepared.",
      detail: "her blue eyes travelled slowly all the way down the length of Billy's body",
      detailWhy: "It suggests she is examining him like something she is judging, which is unsettling rather than motherly.",
      parts: [
        ["Suspicion", "The writer wants readers to suspect that the landlady has been waiting for a particular kind of guest."],
        ["Detail 1 + link", "There are no other hats or coats in the hall and she says “we have it all to ourselves”, which suggests the house has no other guests."],
        ["Detail 2 + link", "She says “everything is always ready” and the bed is already turned back, which shows she has been waiting for someone “just exactly right”."]
      ]
    },
    tutorGuide: ["Accept any precise suspicion (something wrong, a trap, she is waiting for victims) backed by two details.", "Do not credit details from the guest-book section.", "Marks: 1 precise suspicion · 1 two relevant details · 1 each detail linked."]
  },
  {
    id: "s5", scaffold: "none", title: "The guest book", modelDraft: true,
    tags: { A: "Global", B: "Literal", C: "Inferential" },
    covers: "Billy decides she is harmless, feels lucky, signs the guest book and notices two familiar-sounding names from over two years ago.",
    pages: "Pages 4–5", start: "Now, the fact that his landlady", end: "Churchill and Roosevelt",
    gistPrompt: "In one complete sentence (about 20–35 words), explain what Billy decides about the landlady and what he notices in the guest book.",
    detailPrompt: "Find ONE detail about the guest book that should make a careful reader suspicious. Copy the exact words, then explain in your own words why it is suspicious.",
    inferencePrompt: "What does this section show about Billy's judgement? Support your answer with two details and explain how each detail shows it.",
    rubric: {
      A: { minWords: 12, need: 2, core: R`guest.?book|names?|sign`,
        groups: [R`guest.?book|sign|name|entry|entries`, R`billy`, R`familiar|rings? a bell|remember|heard|dates|two years|only two|harmless|kind|trust|cosy|downstairs|living|sitting|lucky`],
        outOfRange: R`stuffed|parrot|bitter|never left|still here|third floor|seventeen`,
        missing: "Say that Billy decides she is harmless, signs the guest book and notices names that seem familiar." },
      B: { relevant: R`only two|two other|two years|three years|dates|over two|names|mulholland|temple|familiar|newspapers|last entry|so long|ago`,
        function: R`suspic|strange|odd|few|no (one|other)|nobody|not (had|been)|long time|wrong|happened|missing|disappear|mystery|danger|clue|worry|hint|suggest|show|because` },
      C: { ideas: R`naive|naïve|trusting|gullible|careless|foolish|unaware|inexperienced|fails to|ignores|overlooks|too trusting|does not realise|doesn.t realise|blind|innocent|unsuspecting|easily|complacent`,
        feedbackIdea: "State what this shows about Billy first: Billy is naive / too trusting.",
        feedbackDetails: "Use specific details: he thinks she is harmless and kind, he feels like a lucky fellow, the names ring a bell but he cannot place them, there are only two entries, or the dates are over two years old.",
        details: [
          { label: "he decides she is harmless and kind", re: R`harmless|kind and generous|lost a son|off her rocker|slightly dotty|kind|generous` },
          { label: "he feels lucky in the cosy room", re: R`lucky fellow|wonderfully warm|cosy|a bit of all right` },
          { label: "the names ring a bell but he cannot place them", re: R`rings? a bell|familiar|cannot place|can.t place|newspapers|heard (the|those)` },
          { label: "only two other entries", re: R`only two|two other (entries|names)` },
          { label: "the entries are over two years old", re: R`two years|three years|over two|dates|old entry|so long` },
          { label: "he thinks they were famous (Dempsey and Tunney)", re: R`dempsey|tunney|churchill|roosevelt|famous for the same` }
        ] }
    },
    model: {
      gist: "Billy decides the landlady is harmless, signs the guest book, and notices two other names that seem strangely familiar although the entries are over two years old.",
      detail: "This last entry is over two years old",
      detailWhy: "It suggests the house has had almost no guests for a long time, which makes readers wonder what happened to the others.",
      parts: [
        ["Judgement", "Billy is naive and trusts the landlady too easily."],
        ["Detail 1 + link", "He decides she is “harmless” and “a kind and generous soul” even though she seems “slightly dotty”, which shows he ignores the warning signs."],
        ["Detail 2 + link", "He sees that the only two other entries are years old but still thinks “I'm a lucky fellow”, which suggests he does not realise anything is wrong."]
      ]
    },
    tutorGuide: ["This section is about Billy's judgement, not the landlady's character.", "Reward answers that connect trust with ignoring clues (appearance vs reality).", "Marks: 1 precise judgement · 1 two relevant details · 1 each detail linked."]
  },
  {
    id: "s6", scaffold: "none", title: "“He never left”", modelDraft: true,
    tags: { A: "Global", B: "Language use for impact", C: "Inferential" },
    covers: "Over tea, the landlady speaks warmly of the two young men, then says they never left and are still on the third floor.",
    pages: "Pages 5–6", start: "How amusing", end: "baby’s",
    gistPrompt: "In one complete sentence (about 20–35 words), explain what the landlady reveals about the two young men.",
    detailPrompt: "Find the smells Billy notices coming from the landlady. Copy the exact words, then explain in your own words what they suggest.",
    inferencePrompt: "What does the way the landlady talks about Mr Mulholland and Mr Temple suggest to the reader? Support your answer with two details and explain how each detail leads to your answer.",
    rubric: {
      A: { minWords: 12, need: 2, core: R`landlady|she|woman|mulholland|temple|names|boys|young men`,
        groups: [R`tea|biscuit|sofa|smell|newspapers|names|remember`, R`landlady|woman|she`, R`never left|still here|third floor|upstairs|perfect age|seventeen|handsome|skin|baby|blemish|stay`],
        outOfRange: R`stuffed|parrot|dachshund|basil|bitter|only you`,
        missing: "Say that Billy tries to remember the names and the landlady reveals the two young men never left and are still upstairs." },
      B: { allowQuote: true, relevant: R`pickled walnuts|new leather|hospital|smell|whiff|peculiar|corridors`,
        function: R`preserv|chemical|death|dead|antiseptic|sick|medical|embalm|unnatural|unpleasant|clinical|suggest|show|sinister|danger|foreshadow|hint|something wrong|strange` },
      C: { ideas: R`obsess|unhealthy|killed|murder|harm|dead|danger|sinister|disturbing|creepy|unnatural|possessive|prey|victim|something (is )?(wrong|sinister)|suspicious|preserv|keeps? (them|young men)`,
        feedbackIdea: "State what it suggests: she may have harmed the young men / she is obsessed with young, handsome guests.",
        feedbackDetails: "Use specific details: “they never left”, “still here” on the third floor, “perfect age”, “just exactly like you”, their teeth or skin, or the strange smell.",
        details: [
          { label: "“handsome … just exactly like you”", re: R`handsome|just exactly like you|charming boys` },
          { label: "“he never left … he's still here”", re: R`never left|still here|third floor|together` },
          { label: "“it's the perfect age”", re: R`perfect age|also seventeen|seventeen` },
          { label: "she notices his teeth", re: R`teeth|not quite so white|shorter` },
          { label: "“not a blemish … skin like a baby's”", re: R`blemish|skin|baby` },
          { label: "the strange smell (hospital)", re: R`smell|hospital|walnuts|leather` }
        ] }
    },
    model: {
      gist: "Billy tries to remember the two names, and the landlady calmly reveals that both young men never left and are still upstairs on the third floor.",
      detail: "Pickled walnuts? New leather? Or was it the corridors of a hospital?",
      detailWhy: "These are smells of preserving and chemicals, which suggests that something is being kept unnaturally and hints at danger.",
      parts: [
        ["Suggestion", "The landlady's words suggest she has harmed the young men and is obsessed with young, handsome guests."],
        ["Detail 1 + link", "She says Mr Mulholland “never left” and is “still here” on the third floor, which suggests they cannot have left alive."],
        ["Detail 2 + link", "She says seventeen is “the perfect age” and that Mr Temple had “not a blemish on his body”, which shows she values young, flawless bodies in an unnatural way."]
      ]
    },
    tutorGuide: ["The inference is about danger or obsession; “she is lonely” alone is not enough.", "Language question: quoted smells are fine, but the explanation must be the student's own words.", "Marks: 1 precise suggestion · 1 two relevant details · 1 each detail linked."]
  },
  {
    id: "s7", scaffold: "none", title: "The truth", modelDraft: true,
    tags: { A: "Global", B: "Language use for impact", C: "Inferential" },
    covers: "Billy realises the parrot and the dog are stuffed. The tea tastes of bitter almonds and the landlady says he is her only guest in years.",
    pages: "Pages 6–7", start: "That parrot", end: "Only you.",
    gistPrompt: "In one complete sentence (about 20–35 words), explain what Billy discovers and what the landlady says at the end.",
    detailPrompt: "Find ONE thing the landlady says that sounds calm or ordinary but is actually disturbing. Copy the exact words, then explain in your own words why it is disturbing.",
    inferencePrompt: "What does the ending suggest will happen to Billy? Support your answer with two details and explain how each detail leads to your answer.",
    rubric: {
      A: { minWords: 12, need: 2, core: R`stuffed|preserv|dead|only you|guests?|parrot|dog|dachshund|taxiderm|tea`,
        groups: [R`parrot|dog|dachshund|basil|stuffed|preserv|taxiderm|dead`, R`tea|almond|only you|guests?|no other|last (two|three) years|never left`, R`billy|landlady|she`],
        missing: "Say that Billy discovers the animals are stuffed and the landlady tells him he is her only guest." },
      B: { relevant: R`not in the least|i did|stuff all my|little pets|alas|only you|bitter almonds|smil|gentle|basil|another cup`,
        function: R`calm|casual|ordinary|normal|matter.of.fact|disturb|chill|creepy|sinister|unsettl|danger|poison|kill|death|dead|contrast|threat|ominous|suggest|show|because` },
      C: { ideas: R`(will be|be|become) (killed|murdered|stuffed|poisoned|her next|the next|preserved|a victim)|killed|murder|poison|stuffed|next victim|die|death|trapped|never leave|will not (leave|escape)|victim`,
        feedbackIdea: "State what will happen: Billy will be killed (poisoned and stuffed) like the guests before him.",
        feedbackDetails: "Use specific details: the dog is hard and cold, she stuffs “all my little pets”, the tea tastes of bitter almonds, “only you”, or Mulholland and Temple “still here”.",
        details: [
          { label: "the dog is hard and cold / stuffed", re: R`hard and cold|dog|dachshund|basil|parrot|preserved|stuffed` },
          { label: "“I stuff all my little pets myself”", re: R`stuff all my|little pets|taxiderm|did it herself|i did` },
          { label: "the tea tastes of bitter almonds", re: R`bitter almonds|\btea\b|poison|taste` },
          { label: "“Only you” / no other guests", re: R`only you|no other guests|last two or three years|nobody else|no other` },
          { label: "Mulholland and Temple are still here", re: R`still here|never left|third floor|mulholland|temple` }
        ] }
    },
    model: {
      gist: "Billy discovers that the parrot and the dog are stuffed, the tea tastes of bitter almonds, and the landlady tells him he is her only guest in years.",
      detail: "Not in the least",
      detailWhy: "She says this about stuffing animals as if it were nothing, which shows she treats death as ordinary and makes her frightening.",
      parts: [
        ["Prediction", "The ending suggests that Billy will be poisoned and stuffed like the guests before him."],
        ["Detail 1 + link", "She says “I stuff all my little pets myself”, which suggests she may treat people the same way."],
        ["Detail 2 + link", "The tea tastes of bitter almonds and she says “Only you”, which shows that Billy is the next victim and no one else has left."]
      ]
    },
    tutorGuide: ["The ending is open, so accept a prediction only if two details from this section lead to it.", "Strong answers link a detail here with something noticed earlier.", "Marks: 1 precise prediction · 1 two relevant details · 1 each detail linked."]
  }
];

/* Simple full-marks gists and school-text words for each section (words verified to appear inside the section's range). */
const LANDLADY_EXTRAS = {
  s1: { gistBasic: "Billy arrives in Bath and looks for a cheap place to stay, then he stops at a house with a Bed and Breakfast sign because it looks warm and nice.",
    words: [
      { w: "brisk", plain: "quick and full of energy", zh: "敏捷有力的", say: "Billy tries to walk briskly like a businessman." },
      { w: "swanky", plain: "grand and fashionable", zh: "豪华时髦的", say: "The houses were once swanky, but now they are run-down." },
      { w: "facades", plain: "the fronts of buildings", zh: "建筑物的正面", say: "The white facades are cracked from neglect." },
      { w: "neglect", plain: "not looking after something", zh: "疏于照料", say: "The paint is peeling from neglect." }
    ] },
  s2: { gistBasic: "Billy is not sure whether to stay here or go to the pub, but the sign seems to pull him in and he walks up to the door and rings the bell.",
    words: [
      { w: "dithering", plain: "not able to decide", zh: "犹豫不决", say: "Billy is dithering in the cold." },
      { w: "rapacious", plain: "greedy and grasping", zh: "贪婪的", say: "He imagines rapacious landladies." },
      { w: "peculiar", plain: "strange", zh: "奇怪的", say: "A peculiar thing happens to him." },
      { w: "compelling", plain: "forcing you to do something", zh: "强迫的,难以抗拒的", say: "The notice seems to be compelling him to stay." },
      { w: "congenial", plain: "pleasant and friendly", zh: "令人愉快的", say: "A pub would be more congenial." }
    ] },
  s3: { gistBasic: "The landlady opens the door at once, smiles, welcomes Billy in and offers him a very cheap room, so he goes inside.",
    words: [
      { w: "compulsion", plain: "a very strong urge you can't resist", zh: "难以抗拒的冲动", say: "He feels a compulsion to follow her." },
      { w: "threshold", plain: "the doorway into a room or house", zh: "门槛,门口", say: "Billy steps over the threshold." },
      { w: "jack-in-the-box", plain: "a toy that pops up suddenly", zh: "弹出来的玩偶盒", say: "She pops out like a jack-in-the-box." }
    ] },
  s4: { gistBasic: "The landlady takes Billy upstairs to a room that is already ready, and she tells him that he is the only guest and that she is very choosy.",
    words: [
      { w: "dotty", plain: "a little mad or odd", zh: "有点疯疯癫癫的", say: "Billy thinks she is slightly dotty." },
      { w: "swamped", plain: "having far too many to deal with", zh: "应接不暇", say: "He thinks she must be swamped with guests." },
      { w: "choosy", plain: "careful about what you choose", zh: "挑剔的", say: "She says she is a teeny bit choosy." },
      { w: "earnestly", plain: "in a serious, sincere way", zh: "认真地,恳切地", say: "She looks earnestly into his face." }
    ] },
  s5: { gistBasic: "Billy thinks the landlady is harmless, then he signs the guest book and sees two old names that he feels he has heard before.",
    words: [
      { w: "off her rocker", plain: "a little mad (informal)", zh: "有点疯了", say: "He thinks she is slightly off her rocker." },
      { w: "rings a bell", plain: "sounds familiar", zh: "听起来耳熟", say: "The name rings a bell." },
      { w: "harmless", plain: "not able or likely to hurt anyone", zh: "无害的", say: "He decides she is harmless." }
    ] },
  s6: { gistBasic: "The landlady talks about the two young men in a strange way and says they never left but are still upstairs.",
    words: [
      { w: "tantalising", plain: "teasing: close but just out of reach", zh: "吊人胃口的", say: "Not remembering the names is tantalising." },
      { w: "emanate", plain: "come out from", zh: "散发出", say: "A smell seems to emanate from her." },
      { w: "whiff", plain: "a faint smell", zh: "一丝气味", say: "He catches a whiff of a strange smell." },
      { w: "blemish", plain: "a mark that spoils something", zh: "瑕疵", say: "There wasn't a blemish on his body." },
      { w: "trifle", plain: "a little", zh: "一点点", say: "Mr Mulholland was a trifle shorter." }
    ] },
  s7: { gistBasic: "Billy finds out that the parrot and the dog are stuffed, the tea tastes strange, and the landlady says he is her only guest for years.",
    words: [
      { w: "preserved", plain: "kept from rotting", zh: "被保存下来", say: "The dog's skin is perfectly preserved." },
      { w: "pass away", plain: "die (a gentler way to say it)", zh: "去世(委婉说法)", say: "She stuffs her pets when they pass away." },
      { w: "admiration", plain: "respect and approval", zh: "钦佩", say: "Billy looks at her with deep admiration." }
    ] }
};
LANDLADY_SEGMENTS.forEach(s => { const x = LANDLADY_EXTRAS[s.id]; if (x) { s.words = x.words; s.model.gistBasic = x.gistBasic; } });
