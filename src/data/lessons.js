// =========================================================================
// Curriculum content for the Inclusive Communities portal.
// -------------------------------------------------------------------------
// Each lesson has these top-level fields:
//   id        unique slug used in the URL
//   title     shown in nav, dashboard, lesson header
//   summary   one-line description
//   module    which group/week it belongs to (used to group the dashboard
//             and sidebar, e.g. "Pre-Curriculum · Week 1")
//   dueDate   ISO date string "YYYY-MM-DD" — when it's due (or null)
//   required  true = students MUST complete it (shows a "Required" marker)
//   sections  the lesson steps. Each section has a `type`:
//     - "content"    heading + rich text + optional image / media / code
//     - "quiz"       multiple-choice question
//     - "reflection" open-ended journaling prompt
//     - "dragdrop"   drag items into the correct category
//
// 📅 DUE DATES: the dates below are PLACEHOLDERS (today is 2026-05-31).
//    Edit each `dueDate` to your real deadlines.
//
// 📝 HTML/CSS CONTENT: the html-basics and css-basics lessons below are a
//    starter version. To use your exact Notion content, see the README
//    section "Adding curriculum content" — paste each Notion block into the
//    matching section's `body` / `code` fields.
// =========================================================================

export const lessons = [
  // ======================================================================
  // PRE-CURRICULUM · WEEK 1  (required before the program starts)
  // ======================================================================
  {
    id: "html-basics",
    title: "HTML Exercises & Learning",
    summary:
      "The building blocks of the web: text tags, lists, links, and tables — plus three coding exercises to submit.",
    module: "Pre-Curriculum · Week 1",
    dueDate: "2026-06-07", // ← placeholder, edit me
    required: true,
    sections: [
      // ---- Intro ----
      {
        id: "html-intro",
        type: "content",
        label: "Intro",
        heading: "Introduction to HTML 🤗",
        body: [
          "HTML (HyperText Markup Language) is the <strong>skeleton</strong> of a webpage. It uses \"tags\" enclosed in angle brackets ( <code>&lt; &gt;</code> ) to tell the browser what kind of content it is displaying.",
          "Most tags have an opening tag (e.g., <code>&lt;p&gt;</code>) and a closing tag (e.g., <code>&lt;/p&gt;</code>) to wrap around your content.",
          "Tip: take a look at the HTML + CSS slideshow before working through this material.",
        ],
        link: {
          text: "Open the HTML + CSS slides",
          url: "https://docs.google.com/presentation/d/1kMttfAy-_U8kI-Jkl82asqWvYfuaBoCXFm2GQD7YV2Q/edit?usp=sharing",
        },
      },

      // ---- Concept 1: Core text tags ----
      {
        id: "html-text-tags",
        type: "content",
        label: "Learn",
        heading: "1. Core Text Tags",
        body: [
          "Before formatting text, you need to understand the difference between headings and body text.",
          "<strong>Headings ( <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> ):</strong> Used for titles and subtitles. <code>&lt;h1&gt;</code> is the largest and most important (usually the main page title), while <code>&lt;h6&gt;</code> is the smallest.",
          "<strong>Paragraphs ( <code>&lt;p&gt;</code> ):</strong> Used for regular blocks of text. The browser automatically adds a bit of blank space before and after a paragraph.",
          "<strong>Emphasis:</strong> To make text <strong>bold</strong>, wrap it in <code>&lt;strong&gt;...&lt;/strong&gt;</code>. To make text <em>italic</em>, wrap it in <code>&lt;em&gt;...&lt;/em&gt;</code> (which stands for emphasis).",
        ],
      },

      // ---- Concept 2: Lists ----
      {
        id: "html-lists",
        type: "content",
        label: "Learn",
        heading: "2. How Lists Work",
        body: [
          "HTML supports two main types of lists: ordered (numbered) and unordered (bulleted).",
          "<strong>Unordered List ( <code>&lt;ul&gt;</code> ):</strong> Creates a bulleted list.",
          "<strong>Ordered List ( <code>&lt;ol&gt;</code> ):</strong> Creates a numbered list (1, 2, 3…).",
          "<strong>List Items ( <code>&lt;li&gt;</code> ):</strong> No matter which list type you choose, every single item inside the list must be wrapped in an <code>&lt;li&gt;</code> tag.",
        ],
        code: {
          language: "html",
          content:
            "<ul>\n  <li>First bullet point</li>\n  <li>Second bullet point</li>\n</ul>",
        },
      },

      // ---- Concept 3: Attributes & links ----
      {
        id: "html-links",
        type: "content",
        label: "Learn",
        heading: "3. Attributes and Hyperlinks ( <a> )",
        body: [
          "Tags can have <strong>attributes</strong> — extra pieces of information dropped inside the opening tag to change how it behaves. Attributes always look like <code>name=\"value\"</code>.",
          "To make a clickable link, we use the Anchor tag ( <code>&lt;a&gt;</code> ). It requires an <code>href</code> attribute to tell the browser where the link should go:",
        ],
        code: {
          language: "html",
          content:
            '<a href="https://google.com" target="_blank">Click here to search</a>',
        },
      },
      {
        id: "html-links-detail",
        type: "content",
        label: "Learn",
        heading: "Breaking down the link",
        body: [
          "<strong><code>href</code>:</strong> The URL destination website.",
          "<strong><code>target=\"_blank\"</code>:</strong> A special attribute that tells the browser, \"Open this link in a brand new tab instead of leaving my page.\"",
          "<strong>\"Click here to search\":</strong> The actual text the user sees and clicks on.",
        ],
      },

      // ---- Quick check ----
      {
        id: "html-quiz-tags",
        type: "quiz",
        label: "Check-in",
        question:
          "Which attribute makes a link open in a brand-new browser tab?",
        options: [
          { id: "a", text: 'href="..."' },
          { id: "b", text: 'target="_blank"' },
          { id: "c", text: 'new="tab"' },
          { id: "d", text: 'open="new"' },
        ],
        correctOptionId: "b",
        explanation:
          'target="_blank" tells the browser to open the link in a new tab. href sets where the link goes.',
      },

      // ---- Concept 4: Tables ----
      {
        id: "html-tables",
        type: "content",
        label: "Learn",
        heading: "4. The Anatomy of an HTML Table",
        body: [
          "Tables can look intimidating because they require nesting multiple tags inside one another. Think of it layer by layer:",
          "1. <code>&lt;table&gt;</code> — The main container that wraps the entire table.",
          "2. <code>&lt;tr&gt;</code> (Table Row) — Tables are built horizontally, row by row. Every time you want a new line of data, you create a new <code>&lt;tr&gt;</code>.",
          "3. <code>&lt;th&gt;</code> (Table Header) — In the first row, use <code>&lt;th&gt;</code> for column titles. The browser automatically makes this text bold and centered.",
          "4. <code>&lt;td&gt;</code> (Table Data) — In the following rows, use <code>&lt;td&gt;</code> for the standard cells.",
        ],
        code: {
          language: "html",
          content:
            "<table>\n  <tr>\n    <th>Header 1</th>\n    <th>Header 2</th>\n  </tr>\n  <tr>\n    <td>Data A</td>\n    <td>Data B</td>\n  </tr>\n</table>",
        },
      },

      // ---- Drag & drop: classify tags ----
      {
        id: "html-dragdrop",
        type: "dragdrop",
        label: "Activity",
        prompt: "Sort each tag into the right group.",
        items: [
          { id: "t1", text: "<ul>" },
          { id: "t2", text: "<ol>" },
          { id: "t3", text: "<th>" },
          { id: "t4", text: "<td>" },
          { id: "t5", text: "<tr>" },
        ],
        categories: [
          {
            id: "lists",
            title: "List tags",
            correctItemIds: ["t1", "t2"],
          },
          {
            id: "tables",
            title: "Table tags",
            correctItemIds: ["t3", "t4", "t5"],
          },
        ],
      },

      // ---- Starter template ----
      {
        id: "html-template",
        type: "content",
        label: "Template",
        heading: "Part 2: Starter HTML Template",
        body: [
          "Copy the code below into the CodVerter web editor (or a text editor like VS Code), and use it as the starting point for the exercises that follow.",
          "If you save it locally instead, name the file <code>index.html</code> and double-click it to open in any browser.",
        ],
        code: {
          language: "html",
          content:
            '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My First HTML Page</title>\n</head>\n<body>\n  <h1>Welcome to My Website</h1>\n  <p>This is a basic paragraph where you can describe your page or project.</p>\n  <a href="https://google.com" target="_blank">Click here to search</a>\n</body>\n</html>',
        },
        link: {
          text: "Open the CodVerter web editor",
          url: "https://codverter.com/src/webeditor?query=eb4a6f14-d730-43e8-9353-d309a302e577",
        },
      },
      {
        id: "html-codverter-note",
        type: "content",
        label: "Heads up",
        heading: "Before you start the exercises 📌",
        body: [
          "Please make an account on CodVerter, then copy and paste each project link into the exercise below (and into your pre-curriculum submission). Thank you!",
        ],
        link: {
          text: "Log in to CodVerter",
          url: "https://codverter.com/",
        },
      },

      // ---- Coding exercise 1: Easy ----
      {
        id: "html-exercise-easy",
        type: "coding",
        label: "Exercise 1",
        difficulty: "Difficulty 1 · Easy",
        difficultyTone: "mint",
        heading: "Adding Text and Emphasis",
        goal: "Practice using basic text formatting tags.",
        tasks: [
          'Inside the <code>&lt;body&gt;</code> tags of your template, add a secondary heading ( <code>&lt;h2&gt;</code> ) that says "About Me".',
          "Below that heading, add a paragraph describing your favorite hobby. Make your hobby <strong>bold</strong> using the <code>&lt;strong&gt;</code> tag and make one other word <em>italic</em> using the <code>&lt;em&gt;</code> tag.",
        ],
        stuckPrompt:
          "I need to add an <h2> heading and a paragraph using <strong> and <em> tags for an HTML assignment. Don't give me the code. Instead, ask for my attempt and guide me step-by-step to fix any mistakes.",
      },

      // ---- Coding exercise 2: Medium ----
      {
        id: "html-exercise-medium",
        type: "coding",
        label: "Exercise 2",
        difficulty: "Difficulty 2 · Medium",
        difficultyTone: "sun",
        heading: "Creating Lists and Links",
        goal: "Structure itemized data and connect to external websites.",
        tasks: [
          "Create a bulleted (unordered) list of your top 3 favorite foods using <code>&lt;ul&gt;</code> and <code>&lt;li&gt;</code> tags.",
          'Below the list, add a hyperlink using the <code>&lt;a&gt;</code> tag pointing to your favorite website (like https://www.wikipedia.org). The clickable text should read: "Click here to visit my favorite website!"',
          "Add the <code>target=\"_blank\"</code> attribute inside your link tag so it opens in a brand-new browser tab when clicked.",
        ],
        stuckPrompt:
          "I need to create an HTML unordered list and a link that opens in a new tab. Don't write the code for me. Ask me for my best guess first, then coach me through fixing any errors.",
      },

      // ---- Coding exercise 3: Hard ----
      {
        id: "html-exercise-hard",
        type: "coding",
        label: "Exercise 3",
        difficulty: "Difficulty 3 · Hard",
        difficultyTone: "coral",
        heading: "Building Data Tables",
        goal: "Structure multi-row / multi-column layout data using table elements.",
        tasks: [
          "Create a schedule or tracking table with <strong>3 rows</strong> and <strong>3 columns</strong>.",
          "The first row should use table header tags ( <code>&lt;th&gt;</code> ) to label the columns: <em>Day</em>, <em>Task</em>, and <em>Status</em>.",
          "The next two rows should use <code>&lt;td&gt;</code> tags to fill in the grid. For example — Row 2: Monday | Push code to GitHub | Completed. Row 3: Tuesday | Attend team meeting | In Progress.",
          "(Bonus) Add a <code>border=\"1\"</code> attribute inside your opening <code>&lt;table&gt;</code> tag so you can see the grid lines.",
        ],
        stuckPrompt:
          "I need to build an HTML table with headers, rows, and a border attribute. Do not write the code. Ask me to try it first, then give me feedback on my structure until it's correct.",
      },

      // ---- Wrap-up reflection ----
      {
        id: "html-reflect",
        type: "reflection",
        label: "Reflect",
        prompt:
          "Which exercise felt hardest, and what is one thing about HTML you'd like to learn more about?",
        helper: "A sentence or two is perfect. This is just for you and your teacher.",
      },
    ],
  },
  {
    id: "css-basics",
    title: "CSS Exercises & Learning",
    summary:
      "Style the web: CSS syntax, the box model, classes vs. IDs, and hover states — plus three coding exercises to submit.",
    module: "Pre-Curriculum · Week 1",
    dueDate: "2026-06-07", // ← placeholder, edit me
    required: true,
    sections: [
      // ---- Intro ----
      {
        id: "css-intro",
        type: "content",
        label: "Intro",
        heading: "Introduction to CSS 🤩",
        body: [
          "If HTML is the <strong>skeleton</strong> of a webpage, CSS (Cascading Style Sheets) is the <strong>skin, clothing, and style</strong>. CSS is what we use to add colors, change fonts, control spacing, and arrange the layout of our website.",
          "Tip: take a look at the HTML + CSS slideshow before working through this material.",
        ],
        link: {
          text: "Open the HTML + CSS slides",
          url: "https://docs.google.com/presentation/d/1kMttfAy-_U8kI-Jkl82asqWvYfuaBoCXFm2GQD7YV2Q/edit?usp=sharing",
        },
      },

      // ---- Concept 1: CSS syntax ----
      {
        id: "css-syntax",
        type: "content",
        label: "Learn",
        heading: "🛠 1. CSS Syntax (How it Looks)",
        body: [
          "CSS works by targeting an HTML element and applying styles to it. A CSS rule is made up of a <strong>selector</strong> and a <strong>declaration block</strong>.",
          "<strong>Selector:</strong> Points to the HTML element you want to style (e.g., <code>h1</code>, <code>p</code>, <code>ul</code>).",
          "<strong>Property:</strong> The feature you want to change (e.g., <code>color</code>, <code>font-size</code>, <code>background-color</code>).",
          "<strong>Value:</strong> The setting you want to apply (e.g., <code>red</code>, <code>20px</code>, <code>blue</code>).",
        ],
        code: {
          language: "css",
          content: "/* Example rule */\np {\n  color: blue;\n  font-size: 16px;\n}",
        },
      },

      // ---- Concept 2: Box model ----
      {
        id: "css-boxmodel",
        type: "content",
        label: "Learn",
        heading: "2. The Box Model",
        body: [
          "Every element on an HTML page is treated as a rectangular box. To control space around elements, you need to understand the Box Model, which consists of four layers:",
          "1. <strong>Content:</strong> The actual text or image inside the element.",
          "2. <strong>Padding:</strong> Clear space <em>inside</em> the element, directly around the content (inside the border).",
          "3. <strong>Border:</strong> A line that goes around the padding and content.",
          "4. <strong>Margin:</strong> Clear space <em>outside</em> the border, used to separate this element from other elements on the page.",
        ],
      },

      // ---- Box model check ----
      {
        id: "css-quiz-boxmodel",
        type: "quiz",
        label: "Check-in",
        question:
          "Which layer of the box model adds space INSIDE the element, between the content and the border?",
        options: [
          { id: "a", text: "Margin" },
          { id: "b", text: "Border" },
          { id: "c", text: "Padding" },
          { id: "d", text: "Content" },
        ],
        correctOptionId: "c",
        explanation:
          "Padding is the space inside the border, around the content. Margin is the space outside the border.",
      },

      // ---- Concept 3: Classes vs IDs ----
      {
        id: "css-selectors",
        type: "content",
        label: "Learn",
        heading: "3. Selectors: Classes vs. IDs",
        body: [
          "While you can style raw tags like <code>h1</code>, you'll eventually want to style specific elements differently. We use HTML attributes to do this:",
          "<strong>Class ( <code>.className</code> ):</strong> Used for styles you want to reuse on <strong>multiple</strong> elements across the page. In CSS, you target a class using a dot ( <code>.</code> ).",
          "<strong>ID ( <code>#idName</code> ):</strong> Used to target a <strong>single, unique</strong> element on the page. In CSS, you target an ID using a hashtag ( <code>#</code> ).",
        ],
        code: {
          language: "html",
          content:
            '<p class="error-text">This is a red error message.</p>\n<p id="featured-paragraph">This is a unique paragraph.</p>',
        },
      },
      {
        id: "css-selectors-css",
        type: "content",
        label: "Learn",
        heading: "Targeting them in CSS",
        body: [
          "Notice the dot before a class name and the hashtag before an ID — those prefixes are how CSS knows which one you mean.",
        ],
        code: {
          language: "css",
          content:
            "/* CSS */\n.error-text { color: red; }\n#featured-paragraph { font-weight: bold; }",
        },
      },

      // ---- Drag & drop: classes vs IDs ----
      {
        id: "css-dragdrop",
        type: "dragdrop",
        label: "Activity",
        prompt: "Sort each CSS selector by what it targets.",
        items: [
          { id: "s1", text: ".intro-text" },
          { id: "s2", text: "#main-title" },
          { id: "s3", text: ".error-text" },
          { id: "s4", text: "#featured" },
          { id: "s5", text: ".card" },
        ],
        categories: [
          {
            id: "class",
            title: "Class — reusable ( . )",
            correctItemIds: ["s1", "s3", "s5"],
          },
          {
            id: "id",
            title: "ID — unique ( # )",
            correctItemIds: ["s2", "s4"],
          },
        ],
      },

      // ---- Starter template ----
      {
        id: "css-template",
        type: "content",
        label: "Template",
        heading: "Part 2: Starter HTML & CSS Template",
        body: [
          "To practice CSS, we use the <code>&lt;style&gt;</code> tag inside the <code>&lt;head&gt;</code> of our HTML document. This is called <strong>Internal CSS</strong>.",
          "Copy this code into the CodVerter editor (or save it as <code>style_practice.html</code>) and write your CSS where it says \"YOUR CSS CODE WILL GO HERE\".",
        ],
        code: {
          language: "html",
          content:
            '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>CSS Learning Page</title>\n\n  <style>\n    /* YOUR CSS CODE WILL GO HERE */\n\n  </style>\n</head>\n<body>\n  <h1 id="main-title">Welcome to CSS Styling</h1>\n\n  <p class="intro-text">This is the introductory paragraph that needs some style.</p>\n\n  <p>This is a regular paragraph that should stay normal.</p>\n\n  <div class="box-element">\n    Inside the box!\n  </div>\n</body>\n</html>',
        },
        link: {
          text: "Open the CodVerter web editor",
          url: "https://codverter.com/src/webeditor?query=eb4a6f14-d730-43e8-9353-d309a302e577",
        },
      },
      {
        id: "css-codverter-note",
        type: "content",
        label: "Heads up",
        heading: "Before you start the exercises 📌",
        body: [
          "Please make an account on CodVerter, then copy and paste each project link into the exercise below (and into your pre-curriculum submission). Thank you!",
        ],
        link: {
          text: "Log in to CodVerter",
          url: "https://codverter.com/",
        },
      },

      // ---- Coding exercise 1: Easy ----
      {
        id: "css-exercise-easy",
        type: "coding",
        label: "Exercise 1",
        difficulty: "Difficulty 1 · Easy",
        difficultyTone: "mint",
        heading: "Selectors & Basic Styling",
        goal: "Learn how to differentiate and target HTML elements using Class and ID attributes.",
        tasks: [
          "Specify a unique <code>id</code> for a main title element, then use the correct CSS selector symbol ( <code>#</code> ) to target it and change its text color.",
          "Assign a reusable <code>class</code> to an introductory paragraph. Use the proper CSS class prefix ( <code>.</code> ) to target it, setting its <code>font-size</code> in pixels ( <code>px</code> ) and making its <code>font-style</code> italic.",
        ],
        stuckPrompt:
          "I am learning CSS selectors. I need to style a unique title element using its ID selector and an intro paragraph using its class selector. Don't write the CSS rules for me. Ask me for my initial code setup, and guide me on using the correct prefix symbols.",
      },

      // ---- Coding exercise 2: Medium ----
      {
        id: "css-exercise-medium",
        type: "coding",
        label: "Exercise 2",
        difficulty: "Difficulty 2 · Medium",
        difficultyTone: "sun",
        heading: "The Box Model",
        goal: "Visualise and control spacing using margin, borders, and padding.",
        tasks: [
          "Target a block element with the class <code>.box-element</code> inside your stylesheet.",
          "Apply the Box Model components: a custom <code>background-color</code>, a defined <code>width</code> in pixels, and a clearly visible <code>solid</code> border outline.",
          "Create spacing <em>inside</em> the element with <code>padding</code>, and add a <code>margin</code> to create empty space <em>outside</em> the element to separate it from surrounding tags.",
        ],
        stuckPrompt:
          "I need to configure the CSS Box Model on a class called .box-element. I want to define a width, background, a solid border, margin, and padding. Do not give me the final code. Ask me to draft the rules first, then check if I mixed up inner versus outer spacing.",
      },

      // ---- Coding exercise 3: Hard ----
      {
        id: "css-exercise-hard",
        type: "coding",
        label: "Exercise 3",
        difficulty: "Difficulty 3 · Hard",
        difficultyTone: "coral",
        heading: "Pseudo-classes & Hover States",
        goal: "Apply state-based selectors and handle simple user interaction overrides.",
        tasks: [
          "Target the outermost <code>body</code> element to apply a default background color across the entire page.",
          "Add a CSS rule using a pseudo-class ( <code>:hover</code> ) on your <code>.box-element</code> that only activates when a user hovers their mouse over it.",
          "Inside that hover rule, change both the <code>background-color</code> and the text <code>color</code> to contrasting colors, creating a visual feedback change on hover.",
        ],
        stuckPrompt:
          "I want to style the body element and append a :hover pseudo-class to a box element so its text and background swap colors on mouseover. Don't give me the code. Prompt me for my selector syntax and coach me through getting the hover rule working.",
      },

      // ---- Wrap-up reflection ----
      {
        id: "css-reflect",
        type: "reflection",
        label: "Reflect",
        prompt:
          "Which exercise felt hardest, and what colors or styles did you enjoy experimenting with?",
        helper: "A sentence or two is perfect. Have fun with this one!",
      },
    ],
  },

  // ======================================================================
  // INCLUSIVE COMMUNITIES  (the core lessons)
  // ======================================================================
  {
    id: "welcome",
    title: "Welcome to Inclusive Communities",
    summary: "What inclusion means and why it matters.",
    module: "Inclusive Communities",
    dueDate: null,
    required: false,
    sections: [
      {
        id: "welcome-intro",
        type: "content",
        label: "Intro",
        heading: "Welcome! 👋",
        body: [
          "Inclusive communities are spaces where everyone feels welcome, respected, and able to participate fully — no matter their background, identity, or ability.",
          "In this lesson we'll explore what inclusion really means, look at a short video, and try a few activities together.",
        ],
        image: {
          src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=70",
          alt: "A diverse group of people sitting together and smiling.",
        },
      },
      {
        id: "welcome-video",
        type: "content",
        label: "Watch",
        heading: "A quick look at belonging",
        body: ["Watch this short clip, then we'll reflect on it together."],
        media: {
          type: "youtube",
          embedId: "dQw4w9WgXcQ",
          title: "What belonging feels like",
        },
      },
      {
        id: "welcome-quiz",
        type: "quiz",
        label: "Check-in",
        question: "Which of these best describes an inclusive community?",
        options: [
          { id: "a", text: "A place where everyone looks the same" },
          {
            id: "b",
            text: "A place where everyone feels welcome and can participate",
          },
          { id: "c", text: "A place with the most rules" },
          { id: "d", text: "A place only for experts" },
        ],
        correctOptionId: "b",
        explanation:
          "Inclusion is about belonging and participation — everyone has a place and a voice.",
      },
      {
        id: "welcome-reflect",
        type: "reflection",
        label: "Reflect",
        prompt: "Describe a time you felt truly welcomed somewhere new.",
        helper:
          "There are no wrong answers — write as much or as little as you like.",
      },
    ],
  },
  {
    id: "identity",
    title: "Identity & Belonging",
    summary: "Exploring the many parts of who we are.",
    module: "Inclusive Communities",
    dueDate: null,
    required: false,
    sections: [
      {
        id: "identity-intro",
        type: "content",
        label: "Learn",
        heading: "We all carry many identities",
        body: [
          "Identity is made up of many parts — culture, language, interests, family, abilities, and more. Together they make each of us unique.",
          "Recognizing the richness in ourselves and others is the first step toward building belonging.",
        ],
        image: {
          src: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=900&q=70",
          alt: "Hands of many different skin tones stacked together.",
        },
      },
      {
        id: "identity-dragdrop",
        type: "dragdrop",
        label: "Activity",
        prompt:
          "Sort each example into 'Things we can see' or 'Things we can't always see'.",
        items: [
          { id: "i1", text: "Favorite music" },
          { id: "i2", text: "Hair style" },
          { id: "i3", text: "Home language" },
          { id: "i4", text: "Height" },
          { id: "i5", text: "Beliefs" },
        ],
        categories: [
          {
            id: "visible",
            title: "Things we can see",
            correctItemIds: ["i2", "i4"],
          },
          {
            id: "hidden",
            title: "Things we can't always see",
            correctItemIds: ["i1", "i3", "i5"],
          },
        ],
      },
      {
        id: "identity-reflect",
        type: "reflection",
        label: "Reflect",
        prompt: "What is one part of your identity you're proud of, and why?",
        helper: "This journal is private to you and your teacher.",
      },
    ],
  },
  {
    id: "allyship",
    title: "Being an Ally",
    summary: "Everyday actions that build inclusion.",
    module: "Inclusive Communities",
    dueDate: null,
    required: false,
    sections: [
      {
        id: "allyship-intro",
        type: "content",
        label: "Learn",
        heading: "Small actions, big impact",
        body: [
          "An ally is someone who supports and stands up for others, especially people who are treated unfairly.",
          "Allyship doesn't require grand gestures — it's often small, everyday choices: listening, including others, and speaking up kindly.",
        ],
      },
      {
        id: "allyship-quiz",
        type: "quiz",
        label: "Check-in",
        question: "Which is an example of everyday allyship?",
        options: [
          { id: "a", text: "Ignoring someone sitting alone" },
          { id: "b", text: "Inviting a new classmate to join your group" },
          { id: "c", text: "Laughing at an unkind joke" },
          { id: "d", text: "Keeping all the supplies for yourself" },
        ],
        correctOptionId: "b",
        explanation:
          "Including others — like inviting someone in — is one of the most powerful everyday acts of allyship.",
      },
      {
        id: "allyship-reflect",
        type: "reflection",
        label: "Reflect",
        prompt: "Name one small act of allyship you could practice this week.",
        helper: "Think about your classroom, home, or community.",
      },
    ],
  },
];

// Helper: look up a lesson by its id.
export function getLesson(lessonId) {
  return lessons.find((l) => l.id === lessonId);
}

// Helper: group lessons by their `module`, preserving order. Returns an array
// of { name, lessons } so the dashboard and sidebar can render sections.
export function getModules() {
  const groups = [];
  const byName = new Map();
  for (const lesson of lessons) {
    const name = lesson.module || "Lessons";
    if (!byName.has(name)) {
      const group = { name, lessons: [] };
      byName.set(name, group);
      groups.push(group);
    }
    byName.get(name).lessons.push(lesson);
  }
  return groups;
}
